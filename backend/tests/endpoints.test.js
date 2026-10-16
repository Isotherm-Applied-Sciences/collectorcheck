import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import express from 'express';
import sqlite3 from 'sqlite3';

test('CC-31 endpoints with isolated SQLite persistence', async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'collectorcheck-cc31-'));
  const databasePath = path.join(directory, 'receipts.db');
  const previousPath = process.env.COLLECTORCHECK_DB_PATH;
  process.env.COLLECTORCHECK_DB_PATH = databasePath;
  let database;
  let server;
  context.after(async () => {
    if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    if (database) await database.closeDatabase();
    if (previousPath === undefined) delete process.env.COLLECTORCHECK_DB_PATH;
    else process.env.COLLECTORCHECK_DB_PATH = previousPath;
    await rm(directory, { recursive: true, force: true });
  });

  const legacy = new sqlite3.Database(databasePath);
  await new Promise((resolve, reject) => legacy.exec(`
    CREATE TABLE receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL,
      vendor TEXT, date TEXT, amount REAL, raw_metadata TEXT, created_at TEXT NOT NULL
    )
  `, (error) => error ? reject(error) : resolve()));
  await new Promise((resolve, reject) => legacy.close((error) => error ? reject(error) : resolve()));

  database = await import('../src/db/sqlite.js');
  const { default: receipts, uploadRouter } = await import('../src/routes/receipts.js');
  const app = express();
  app.use(express.json());
  app.use('/api/receipts', (await import('../src/routes/receiptRoutes.js')).default);
  app.use('/api', uploadRouter);
  app.use(['/receipts', '/api/receipts'], receipts);
  for (const name of ['vendors', 'tags', 'stats', 'timeline']) {
    app.use([`/${name}`, `/api/${name}`], (await import(`../src/routes/${name}.js`)).default);
  }
  const { handleError } = await import('../src/utils/errors.js');
  app.use(handleError);
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (pathname, options = {}, status = 200) => {
    const apiPath = pathname.startsWith('/api/') ? pathname : `/api${pathname}`;
    const response = await fetch(base + apiPath, options);
    assert.equal(response.status, status, `${options.method ?? 'GET'} ${apiPath}`);
    return response.json();
  };
  const update = (id, body, status = 200) => request(`/receipts/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
  }, status);
  const upload = async (date, amount) => {
    const form = new FormData();
    form.append('file', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'cc31.pdf');
    form.append('vendor', 'Test Vendor');
    if (date) form.append('date', date);
    form.append('amount', String(amount));
    return request('/api/upload', { method: 'POST', body: form }, 201);
  };

  await context.test('empty collections and missing/invalid resources', async () => {
    for (const pathname of ['/receipts', '/vendors', '/tags', '/timeline']) {
      assert.deepEqual(await request(pathname), []);
      const unprefixed = await fetch(base + pathname);
      assert.equal(unprefixed.status, 200);
      assert.deepEqual(await unprefixed.json(), []);
    }
    const stats = await request('/stats');
    assert.deepEqual(stats.monthlyTotals, {});
    assert.deepEqual(stats.categoryTotals, {});
    for (const method of ['GET', 'PUT', 'DELETE']) {
      await request('/receipts/999', { method }, 404);
      await request('/receipts/invalid', { method }, 400);
    }
    await request('/vendors/missing', {}, 404);
    await request('/tags/missing', {}, 404);
  });

  const later = await upload('2026-10-16', 12);
  const earlier = await upload('2026-09-16', 3);
  const undated = await upload(null, 5);
  assert.equal(undated.status, 'needs_metadata');
  await context.test('receipt updates persist validated tags and preserve omitted fields', async () => {
    assert.equal(later.status, 'accepted');
    const updated = await update(later.id, { tags: [' Travel ', 'Travel', '__proto__'] });
    assert.deepEqual(updated.tags, ['Travel', '__proto__']);
    assert.equal(updated.vendor, 'Test Vendor');
    assert.equal(updated.amount, 12);
    await update(later.id, { filename: 'renamed.pdf' });
    const stored = await request(`/receipts/${later.id}`);
    assert.deepEqual(stored.tags, ['Travel', '__proto__']);
    assert.equal(stored.filename, 'renamed.pdf');
    assert.deepEqual((await database.getReceiptById(later.id)).tags, stored.tags);
    for (const tags of ['invalid', null, [12], [' ']]) await update(later.id, { tags }, 400);
    await update(earlier.id, { tags: ['Travel'] });
    await update(undated.id, { tags: ['Travel'] });
    assert.equal((await request('/receipts')).length, 3);
    assert.equal((await request('/api/receipts/list')).length, 3);
    assert.equal((await request(`/api/receipts/receipt/${later.id}`)).id, later.id);
  });

  await context.test('vendor/tag lists and detail arrays', async () => {
    assert.deepEqual(await request('/vendors'), [{ name: 'Test Vendor', count: 3, total: 20 }]);
    assert.equal((await request('/vendors/Test%20Vendor')).length, 3);
    assert.deepEqual(await request('/tags'), [{ name: 'Travel', count: 3 }, { name: '__proto__', count: 1 }]);
    const tagged = await request('/tags/Travel');
    assert.equal(tagged.length, 3);
    assert.ok(tagged.every((receipt) => receipt.tags.includes('Travel')));
  });

  await context.test('monthly/category totals and ascending/descending timeline', async () => {
    const stats = await request('/stats');
    assert.deepEqual(stats.monthlyTotals, { '2026-09': 3, '2026-10': 12 });
    assert.deepEqual(stats.categoryTotals, JSON.parse('{"Travel":20,"__proto__":12}'));
    assert.deepEqual(stats.monthly, stats.monthlyTotals);
    assert.equal(stats.totalReceipts, 3);
    assert.equal(stats.totalAmount, 20);
    const ascending = (await request('/timeline')).filter((receipt) => receipt.date);
    assert.deepEqual(ascending.map((receipt) => receipt.id), [earlier.id, later.id]);
    const descending = (await request('/timeline?sort=desc')).filter((receipt) => receipt.date);
    assert.deepEqual(descending.map((receipt) => receipt.id), [later.id, earlier.id]);
  });

  await context.test('deletion removes receipts from all derived endpoints', async () => {
    for (const receipt of [later, earlier, undated]) {
      assert.equal((await request(`/receipts/${receipt.id}`, { method: 'DELETE' })).status, 'deleted');
      await request(`/receipts/${receipt.id}`, {}, 404);
    }
    assert.deepEqual(await request('/receipts'), []);
    assert.deepEqual(await request('/vendors'), []);
    assert.deepEqual(await request('/tags'), []);
    assert.deepEqual((await request('/stats')).categoryTotals, {});
    await request('/tags/Travel', {}, 404);
    await request('/vendors/Test%20Vendor', {}, 404);
  });
});