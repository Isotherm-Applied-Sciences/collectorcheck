import sqlite3 from 'sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const filename = fileURLToPath(import.meta.url);
const directory = path.dirname(filename);
const databasePath = process.env.COLLECTORCHECK_DB_PATH || path.join(directory, '..', '..', 'receipts.db');

const database = new sqlite3.Database(databasePath);

function deserializeReceipt(row) {
  let tags;
  try {
    tags = JSON.parse(row.tags ?? '[]');
  } catch {
    tags = [];
  }
  return { ...row, tags: Array.isArray(tags) ? tags : [] };
}

const schemaReady = new Promise((resolve, reject) => {
  database.run(`
    CREATE TABLE IF NOT EXISTS receipts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      vendor TEXT,
      date TEXT,
      amount REAL,
      raw_metadata TEXT,
      created_at TEXT NOT NULL,
      stored_filename TEXT,
      tags TEXT NOT NULL DEFAULT '[]'
    )
  `, (createError) => {
    if (createError) {
      reject(createError);
      return;
    }

    database.all('PRAGMA table_info(receipts)', [], (pragmaError, columns) => {
      if (pragmaError) {
        reject(pragmaError);
        return;
      }

      const additions = [
        ['stored_filename', 'TEXT'],
        ['tags', "TEXT NOT NULL DEFAULT '[]'"]
      ].filter(([name]) => !columns.some((column) => column.name === name));
      Promise.all(additions.map(([name, definition]) => new Promise((resolveColumn, rejectColumn) => {
        database.run(`ALTER TABLE receipts ADD COLUMN ${name} ${definition}`, (migrationError) => {
          if (migrationError) rejectColumn(migrationError);
          else resolveColumn();
        });
      }))).then(() => resolve(), reject);
    });
  });
});

export async function insertReceipt({ filename, storedFilename, vendor, date, amount, rawMetadata, tags = [] }) {
  await schemaReady;
  return new Promise((resolve, reject) => {
    const statement = `
      INSERT INTO receipts (filename, stored_filename, vendor, date, amount, raw_metadata, tags, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    database.run(
      statement,
      [filename, storedFilename ?? null, vendor ?? null, date ?? null, amount ?? null, rawMetadata ?? null, JSON.stringify(tags)],
      function onInsert(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

export async function listReceipts() {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.all(
      'SELECT id, filename, vendor, date, amount, tags, raw_metadata, created_at FROM receipts ORDER BY created_at DESC, id DESC',
      [],
      (error, rows) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(rows.map(deserializeReceipt));
      }
    );
  });
}

export async function getReceiptById(id) {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.get(
      'SELECT id, filename, vendor, date, amount, tags, raw_metadata, created_at FROM receipts WHERE id = ?',
      [id],
      (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row ? deserializeReceipt(row) : null);
      }
    );
  });
}

export async function updateReceiptById(id, { filename, vendor, date, amount, tags }) {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.run(
      'UPDATE receipts SET filename = ?, vendor = ?, date = ?, amount = ?, tags = COALESCE(?, tags) WHERE id = ?',
      [filename, vendor ?? null, date ?? null, amount ?? null, tags === undefined ? null : JSON.stringify(tags), id],
      function onUpdate(error) {
        if (error) {
          reject(error);
          return;
        }
        resolve(this.changes > 0);
      }
    );
  });
}

export async function getReceiptStorageById(id) {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.get('SELECT stored_filename FROM receipts WHERE id = ?', [id], (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row ?? null);
    });
  });
}

export async function deleteReceiptById(id) {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.run('DELETE FROM receipts WHERE id = ?', [id], function onDelete(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve(this.changes > 0);
    });
  });
}

export async function closeDatabase() {
  await schemaReady;
  return new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}
