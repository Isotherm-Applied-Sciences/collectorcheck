import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runPreservationVerificationTests() {
  const preservationDirectory = path.join(root, 'preservation', 'v2.10');
  const archivePath = path.join(preservationDirectory, 'archive.json');
  const manifestPath = path.join(preservationDirectory, 'manifest.json');
  assert.ok(fs.existsSync(archivePath), 'preservation archive exists');
  assert.ok(fs.existsSync(manifestPath), 'preservation manifest exists');

  const archive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(archive.version, '2.10.0');
  assert.equal(archive.archived, true);
  assert.equal(archive.archive_type, 'repository-reference-index');
  assert.equal(manifest.version, archive.version);
  assert.equal(manifest.preservation_complete, true);
  assert.equal(manifest.hash_algorithm, 'SHA-256');
  assert.equal(manifest.hash_normalization, 'UTF-8 with LF line endings');
  assert.ok(Number.isFinite(Date.parse(archive.timestamp)));
  assert.equal(manifest.archived_at, archive.timestamp);
  assert.deepEqual(Object.keys(archive.artifacts).sort(), Object.keys(manifest.artifact_hashes).sort());
  assert.equal(Object.keys(archive.artifacts).length, 8);

  const archiveDirectory = path.dirname(archivePath);
  for (const [name, relativePath] of Object.entries(archive.artifacts)) {
    const artifactPath = path.resolve(archiveDirectory, relativePath);
    assert.ok(fs.existsSync(artifactPath), `preserved artifact exists: ${name}`);
    const normalizedText = fs.readFileSync(artifactPath, 'utf8').replace(/\r\n?/g, '\n');
    const digest = crypto.createHash('sha256').update(normalizedText, 'utf8').digest('hex');
    assert.equal(digest, manifest.artifact_hashes[name], `preserved artifact hash matches: ${name}`);
  }

  for (const rule of Object.values(manifest.integrity_rules)) assert.equal(rule, true);

  return {
    ok: true,
    tests: [
      'Archive and preservation manifest validate',
      'All eight artifact paths resolve and are hashable',
      'Canonical SHA-256 hashes match preserved artifacts',
      'Integrity and reconstruction rules validate'
    ]
  };
}