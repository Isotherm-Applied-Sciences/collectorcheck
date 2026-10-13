import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runLedgerVerificationTests() {
  const ledgerDirectory = path.join(root, 'ledger', 'v2.10');
  const entryPath = path.join(ledgerDirectory, 'entry.json');
  const indexPath = path.join(ledgerDirectory, 'index.json');

  assert.ok(fs.existsSync(entryPath), 'ledger entry exists');
  assert.ok(fs.existsSync(indexPath), 'ledger index exists');

  const entry = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
  assert.equal(entry.version, '2.10.0');
  assert.equal(entry.sealed, true);
  assert.equal(entry.ledger_registered, true);
  assert.equal(entry.signed, false);
  assert.equal(entry.signer_authenticated, false);
  assert.equal(entry.signature_type, 'sha256-integrity-digest');
  assert.ok(Number.isFinite(Date.parse(entry.timestamp)));

  const sealPath = path.resolve(ledgerDirectory, entry.seal_file);
  const signaturePath = path.resolve(ledgerDirectory, entry.signature_file);
  const certificatePath = path.resolve(ledgerDirectory, entry.certificate_file);
  assert.ok(fs.existsSync(sealPath), 'ledger seal target exists');
  assert.ok(fs.existsSync(signaturePath), 'ledger digest target exists');
  assert.ok(fs.existsSync(certificatePath), 'ledger certificate target exists');

  const expectedDigest = crypto.createHash('sha256').update(fs.readFileSync(sealPath)).digest('hex');
  const actualDigest = fs.readFileSync(signaturePath, 'utf8').trim();
  assert.equal(actualDigest, expectedDigest);

  const signatureManifest = JSON.parse(fs.readFileSync(
    path.join(path.dirname(signaturePath), 'manifest.json'),
    'utf8'
  ));
  assert.equal(signatureManifest.authenticates_signer, false);

  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  assert.equal(index.entries.length, 1);
  assert.deepEqual(index.entries[0], {
    version: entry.version,
    path: 'entry.json',
    registered_at: entry.timestamp
  });

  return {
    ok: true,
    tests: [
      'Ledger entry and index exist and parse',
      'Entry metadata and linked seal artifacts validate',
      'SHA-256 integrity digest matches the seal',
      'Index records one matching registration'
    ]
  };
}