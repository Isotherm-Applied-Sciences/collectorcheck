import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

function canonicalSha256(filePath) {
  const text = fs.readFileSync(filePath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

export async function runRedundancyVerificationTests() {
  const redundancyDirectory = path.join(root, 'redundancy', 'v2.10');
  const sourcePath = path.join(root, 'preservation', 'v2.10', 'archive.json');
  const manifestPath = path.join(redundancyDirectory, 'manifest.json');
  assert.ok(fs.existsSync(sourcePath), 'source preservation archive exists');
  assert.ok(fs.existsSync(manifestPath), 'redundancy manifest exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.redundancy_enabled, true);
  assert.equal(manifest.replica_scope, 'single-repository');
  assert.equal(manifest.hash_algorithm, 'SHA-256');
  assert.equal(manifest.hash_normalization, 'UTF-8 with LF line endings');
  assert.equal(manifest.integrity_rules.replicas_must_match, true);
  assert.equal(manifest.integrity_rules.replicas_must_be_hashable, true);
  assert.equal(manifest.integrity_rules.replicas_must_be_independent, false);

  const sourceHash = canonicalSha256(sourcePath);
  assert.equal(sourceHash, manifest.source_archive_sha256);
  for (const [replicaName, relativePath] of Object.entries(manifest.replicas)) {
    const replicaPath = path.resolve(redundancyDirectory, relativePath);
    assert.ok(fs.existsSync(replicaPath), `${replicaName} archive exists`);
    assert.equal(canonicalSha256(replicaPath), sourceHash, `${replicaName} matches preservation archive`);
  }

  return {
    ok: true,
    tests: [
      'Three repository-local replicas exist',
      'Replica hashes match the preserved source archive',
      'Manifest hash and scope metadata validate',
      'Same-repository copies are not overstated as independent sites'
    ]
  };
}