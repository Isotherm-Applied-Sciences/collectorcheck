import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAnchor } from '../../../ledger/anchor/v2.10/anchor.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runAnchorVerificationTests() {
  const anchorDirectory = path.join(root, 'ledger', 'anchor');
  const indexPath = path.join(anchorDirectory, 'index.json');
  const entryPath = path.join(root, 'ledger', 'v2.10', 'entry.json');

  assert.ok(fs.existsSync(indexPath), 'anchor index exists');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  assert.equal(index.chain.length, 1);

  const anchorRecord = index.chain[0];
  assert.equal(anchorRecord.version, '2.10.0');
  assert.equal(anchorRecord.anchor_file, 'v2.10/anchor.sha256');
  assert.equal(anchorRecord.linked_ledger_entry, '../v2.10/entry.json');
  assert.ok(Number.isFinite(Date.parse(anchorRecord.anchored_at)));

  const anchorPath = path.resolve(anchorDirectory, anchorRecord.anchor_file);
  const linkedEntryPath = path.resolve(anchorDirectory, anchorRecord.linked_ledger_entry);
  assert.ok(fs.existsSync(anchorPath), 'anchor digest exists');
  assert.equal(linkedEntryPath, entryPath);

  const expected = crypto.createHash('sha256').update(fs.readFileSync(entryPath)).digest('hex');
  const actual = fs.readFileSync(anchorPath, 'utf8').trim();
  assert.match(actual, /^[a-f0-9]{64}$/);
  assert.equal(actual, expected);
  assert.equal(generateAnchor(), expected);

  return {
    ok: true,
    tests: [
      'Anchor index and v2.10 chain entry validate',
      'Anchor and ledger paths resolve correctly',
      'SHA-256 anchor matches ledger entry bytes'
    ]
  };
}