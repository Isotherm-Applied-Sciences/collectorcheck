import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

function canonicalSha256(filePath) {
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export async function runSurvivabilityVerificationTests() {
  const survivabilityDirectory = path.join(root, 'survivability', 'v2.10');
  const simulationPath = path.join(survivabilityDirectory, 'simulation.json');
  const manifestPath = path.join(survivabilityDirectory, 'manifest.json');
  assert.ok(fs.existsSync(simulationPath), 'recovery simulation exists');
  assert.ok(fs.existsSync(manifestPath), 'survivability manifest exists');

  const simulation = JSON.parse(fs.readFileSync(simulationPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const destroyedArtifacts = [
    'seal/v2.10/SEAL.txt',
    'lineage/v2.10/lineage-seal.sha256',
    'lineage/v2.10/lock/lineage-lock.sha256'
  ];
  assert.equal(simulation.version, '2.10.0');
  assert.equal(simulation.simulation, 'catastrophic_primary_loss');
  assert.deepEqual(simulation.primary_artifacts_destroyed, destroyedArtifacts);
  assert.equal(simulation.reconstruction_possible, true);
  assert.equal(manifest.version, simulation.version);
  assert.equal(manifest.survivability_verified, true);
  assert.equal(manifest.replica_scope, 'single-repository');
  assert.equal(manifest.recovery_artifact_count, 8);
  assert.ok(Number.isFinite(Date.parse(simulation.timestamp)));
  assert.equal(manifest.verified_at, simulation.timestamp);
  for (const ruleValue of Object.values(manifest.recovery_rules)) assert.equal(ruleValue, true);

  const archivePath = path.join(root, 'preservation', 'v2.10', 'archive.json');
  const sourceArchive = JSON.parse(fs.readFileSync(archivePath, 'utf8'));
  const expectedArtifactCount = Object.keys(sourceArchive.artifacts).length;
  assert.equal(expectedArtifactCount, manifest.recovery_artifact_count);

  const preservationDirectory = path.dirname(archivePath);
  const recoveredHashesByReplica = {};
  const temporaryRoots = [];

  try {
    for (const [replicaName, replicaRelativePath] of Object.entries(simulation.recovery_sources)) {
      const replicaRoot = path.resolve(survivabilityDirectory, replicaRelativePath);
      const replicaArchivePath = path.join(replicaRoot, 'archive.json');
      const replicaManifestPath = path.join(replicaRoot, 'manifest.json');
      const replicaArtifactRoot = path.join(replicaRoot, 'artifacts');
      assert.ok(fs.existsSync(replicaArchivePath), `${replicaName} archive exists`);
      assert.ok(fs.existsSync(replicaManifestPath), `${replicaName} preservation manifest exists`);

      const replicaArchive = JSON.parse(fs.readFileSync(replicaArchivePath, 'utf8'));
      const replicaManifest = JSON.parse(fs.readFileSync(replicaManifestPath, 'utf8'));
      assert.deepEqual(replicaArchive, sourceArchive);
      assert.equal(replicaManifest.version, simulation.version);
      assert.equal(replicaManifest.preservation_complete, true);

      const recoveryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'collectorcheck-recovery-'));
      temporaryRoots.push(recoveryRoot);
      const recoveredHashes = {};

      for (const [artifactName, archivedRelativePath] of Object.entries(replicaArchive.artifacts)) {
        const originalPath = path.resolve(preservationDirectory, archivedRelativePath);
        const repositoryRelativePath = path.relative(root, originalPath);
        const replicaPayloadPath = path.join(replicaArtifactRoot, repositoryRelativePath);
        const recoveredPath = path.join(recoveryRoot, repositoryRelativePath);
        assert.ok(fs.existsSync(replicaPayloadPath), `${replicaName} payload exists: ${artifactName}`);
        fs.mkdirSync(path.dirname(recoveredPath), { recursive: true });
        fs.copyFileSync(replicaPayloadPath, recoveredPath);

        const recoveredHash = canonicalSha256(recoveredPath);
        assert.equal(recoveredHash, replicaManifest.artifact_hashes[artifactName]);
        recoveredHashes[artifactName] = recoveredHash;
      }

      assert.equal(Object.keys(recoveredHashes).length, expectedArtifactCount);
      recoveredHashesByReplica[replicaName] = recoveredHashes;
    }
  } finally {
    for (const temporaryRoot of temporaryRoots) {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  }

  const replicaResults = Object.values(recoveredHashesByReplica);
  assert.equal(replicaResults.length, 3);
  for (const recoveredHashes of replicaResults.slice(1)) {
    assert.deepEqual(recoveredHashes, replicaResults[0]);
  }

  return {
    ok: true,
    tests: [
      'Primary-loss simulation reconstructs all eight artifact payloads',
      'Recovery uses replica contents and matches preserved hashes',
      'Three replica recoveries produce deterministic results',
      'Temporary recovery workspaces are cleaned up'
    ]
  };
}