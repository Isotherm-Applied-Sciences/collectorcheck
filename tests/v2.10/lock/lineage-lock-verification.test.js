import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateLineageLock } from '../../../lineage/v2.10/lock/lock.js';
import { generateLineageSeal } from '../../../lineage/v2.10/lineage-seal.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runLineageLockVerificationTests() {
  const lockDirectory = path.join(root, 'lineage', 'v2.10', 'lock');
  const lockPath = path.join(lockDirectory, 'lineage-lock.sha256');
  const manifestPath = path.join(lockDirectory, 'manifest.json');
  assert.ok(fs.existsSync(lockPath), 'lineage lock exists');
  assert.ok(fs.existsSync(manifestPath), 'lineage lock manifest exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.lineage_locked, true);
  assert.equal(manifest.lock_scope, 'content-integrity-snapshot');
  assert.equal(manifest.lock_file, 'lineage-lock.sha256');
  assert.ok(Number.isFinite(Date.parse(manifest.locked_at)));
  assert.equal(manifest.immutability_rules.retroactive_modification, 'detectable_not_prevented');
  assert.equal(manifest.immutability_rules.lineage_chain, 'append-only');
  assert.equal(manifest.immutability_rules.tamper_evident, true);
  assert.equal(manifest.immutability_rules.lock_integrity, 'sha256_hash_linked');
  assert.equal(manifest.immutability_rules.immutability_enforced, false);

  const artifactPaths = {
    sealedArtifact: path.resolve(lockDirectory, manifest.sealed_artifact),
    lineageSeal: path.resolve(lockDirectory, manifest.lineage_seal),
    forwardAnchor: path.resolve(lockDirectory, manifest.forward_anchor),
    rootAnchor: path.resolve(lockDirectory, manifest.root_anchor)
  };
  assert.equal(artifactPaths.sealedArtifact, path.join(root, 'seal', 'v2.10', 'SEAL.txt'));
  assert.equal(artifactPaths.lineageSeal, path.join(root, 'lineage', 'v2.10', 'lineage-seal.sha256'));
  assert.equal(artifactPaths.forwardAnchor, path.join(root, 'ledger', 'continuity', 'v2.10', 'forward-anchor.sha256'));
  assert.equal(artifactPaths.rootAnchor, path.join(root, 'ledger', 'anchor', 'v2.10', 'anchor.sha256'));
  for (const artifactPath of Object.values(artifactPaths)) {
    assert.ok(fs.existsSync(artifactPath), `lock artifact exists: ${artifactPath}`);
  }

  const lineageSeal = fs.readFileSync(artifactPaths.lineageSeal, 'utf8').trim();
  assert.equal(lineageSeal, generateLineageSeal());
  const expectedLock = crypto.createHash('sha256').update(lineageSeal, 'utf8').digest('hex');
  const actualLock = fs.readFileSync(lockPath, 'utf8').trim();
  assert.equal(actualLock, expectedLock);
  assert.equal(actualLock, generateLineageLock());

  return {
    ok: true,
    tests: [
      'Lineage lock and manifest validate',
      'Seal and anchor paths resolve',
      'SHA-256 lock matches normalized lineage seal',
      'Manifest accurately describes tamper-evident lock semantics'
    ]
  };
}