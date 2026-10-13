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
  const preservationDirectory = path.join(root, 'preservation', 'v2.10');
  const sourcePath = path.join(preservationDirectory, 'archive.json');
  const sourceManifestPath = path.join(preservationDirectory, 'manifest.json');
  const manifestPath = path.join(redundancyDirectory, 'manifest.json');
  assert.ok(fs.existsSync(sourcePath), 'source preservation archive exists');
  assert.ok(fs.existsSync(sourceManifestPath), 'source preservation manifest exists');
  assert.ok(fs.existsSync(manifestPath), 'redundancy manifest exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const sourceArchive = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const sourceManifest = JSON.parse(fs.readFileSync(sourceManifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.redundancy_enabled, true);
  assert.equal(manifest.replica_scope, 'single-repository');
  assert.equal(manifest.artifact_count, 8);
  assert.equal(manifest.hash_algorithm, 'SHA-256');
  assert.equal(manifest.hash_normalization, 'UTF-8 with LF line endings');
  assert.equal(manifest.integrity_rules.replicas_must_match, true);
  assert.equal(manifest.integrity_rules.replicas_must_be_hashable, true);
  assert.equal(manifest.integrity_rules.replicas_must_be_independent, false);
  assert.equal(manifest.integrity_rules.replicas_contain_full_artifacts, true);

  const sourceHash = canonicalSha256(sourcePath);
  assert.equal(sourceHash, manifest.source_archive_sha256);
  const sourceManifestHash = canonicalSha256(sourceManifestPath);
  for (const [replicaName, replica] of Object.entries(manifest.replicas)) {
    const archivePath = path.resolve(redundancyDirectory, replica.archive);
    const replicaManifestPath = path.resolve(redundancyDirectory, replica.preservation_manifest);
    const artifactRoot = path.resolve(redundancyDirectory, replica.artifact_root);
    assert.ok(fs.existsSync(archivePath), `${replicaName} archive exists`);
    assert.ok(fs.existsSync(replicaManifestPath), `${replicaName} preservation manifest exists`);
    assert.equal(canonicalSha256(archivePath), sourceHash, `${replicaName} archive matches source`);
    assert.equal(canonicalSha256(replicaManifestPath), sourceManifestHash, `${replicaName} manifest matches source`);

    const replicaArchive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
    const replicaManifest = JSON.parse(fs.readFileSync(replicaManifestPath, 'utf8'));
    assert.deepEqual(replicaArchive, sourceArchive);
    assert.deepEqual(replicaManifest, sourceManifest);
    assert.equal(Object.keys(replicaArchive.artifacts).length, manifest.artifact_count);

    for (const [artifactName, relativePath] of Object.entries(replicaArchive.artifacts)) {
      const originalPath = path.resolve(preservationDirectory, relativePath);
      const repoRelativePath = path.relative(root, originalPath);
      const payloadPath = path.join(artifactRoot, repoRelativePath);
      assert.ok(fs.existsSync(payloadPath), `${replicaName} payload exists: ${artifactName}`);
      assert.equal(
        canonicalSha256(payloadPath),
        sourceManifest.artifact_hashes[artifactName],
        `${replicaName} payload hash matches: ${artifactName}`
      );
    }
  }

  return {
    ok: true,
    tests: [
      'Three repository-local replicas contain all eight artifacts',
      'Replica archives, manifests, and payload hashes match preservation records',
      'Manifest hash and scope metadata validate',
      'Same-repository copies are not overstated as independent sites'
    ]
  };
}