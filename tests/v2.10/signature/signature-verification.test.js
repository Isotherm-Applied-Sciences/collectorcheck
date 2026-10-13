import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runSignatureVerificationTests() {
  const signatureDirectory = path.join(root, 'seal', 'v2.10', 'signature');
  const sealPath = path.join(root, 'seal', 'v2.10', 'SEAL.txt');
  const signaturePath = path.join(signatureDirectory, 'signature.sha256');
  const manifestPath = path.join(signatureDirectory, 'manifest.json');

  assert.ok(fs.existsSync(signaturePath), 'SHA-256 digest file exists');
  assert.ok(fs.existsSync(manifestPath), 'signature manifest exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.algorithm, 'SHA-256');
  assert.equal(manifest.signature_type, 'content-integrity-digest');
  assert.equal(manifest.signature_file, 'signature.sha256');
  assert.equal(manifest.sealed_artifact, '../SEAL.txt');
  assert.equal(manifest.authenticates_signer, false);
  assert.equal(manifest.verified, true);

  const seal = fs.readFileSync(sealPath);
  const expected = crypto.createHash('sha256').update(seal).digest('hex');
  const actual = fs.readFileSync(signaturePath, 'utf8').trim();
  assert.match(actual, /^[a-f0-9]{64}$/);
  assert.equal(actual, expected);

  return {
    ok: true,
    tests: [
      'Digest and manifest files exist',
      'SHA-256 manifest accurately describes integrity-only semantics',
      'Digest matches sealed artifact bytes'
    ]
  };
}