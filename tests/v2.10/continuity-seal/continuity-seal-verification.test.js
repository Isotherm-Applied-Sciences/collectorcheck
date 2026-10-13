import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAnchorVerificationTests } from '../anchor/anchor-verification.test.js';
import { runLineageVerificationTests } from '../lineage/lineage-verification.test.js';
import { runLineageLockVerificationTests } from '../lock/lineage-lock-verification.test.js';
import { runPreservationVerificationTests } from '../preservation/preservation-verification.test.js';
import { runRedundancyVerificationTests } from '../redundancy/redundancy-verification.test.js';
import { runSurvivabilityVerificationTests } from '../survivability/survivability-verification.test.js';
import { generateContinuitySeal } from '../../../continuity-seal/v2.10/seal.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runContinuitySealVerificationTests() {
  const sealDirectory = path.join(root, 'continuity-seal', 'v2.10');
  const sealPath = path.join(sealDirectory, 'continuity-seal.sha256');
  const certificatePath = path.join(sealDirectory, 'certificate.json');
  assert.ok(fs.existsSync(sealPath), 'continuity seal exists');
  assert.ok(fs.existsSync(certificatePath), 'continuity seal certificate exists');

  const certificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
  assert.equal(certificate.version, '2.10.0');
  assert.equal(certificate.continuity_sealed, true);
  assert.ok(Number.isFinite(Date.parse(certificate.issued_at)));
  assert.equal(certificate.continuity_rules.post_survivability_integrity, 'verified');
  assert.equal(certificate.continuity_rules.lineage_chain_still_valid, true);
  assert.equal(certificate.continuity_rules.anchors_still_match, true);
  assert.equal(certificate.continuity_rules.lock_still_valid, true);
  assert.equal(certificate.continuity_rules.tamper_evident, true);
  assert.equal(certificate.continuity_rules.integrity_semantics, 'sha256_hash_linked');
  assert.equal(certificate.continuity_rules.signer_authenticated, false);

  const evidence = {
    survivability: path.resolve(sealDirectory, certificate.survivability_manifest),
    redundancy: path.resolve(sealDirectory, certificate.redundancy_manifest),
    preservation: path.resolve(sealDirectory, certificate.preservation_manifest),
    lockedLineage: path.resolve(sealDirectory, certificate.locked_lineage)
  };
  assert.equal(evidence.survivability, path.join(root, 'survivability', 'v2.10', 'manifest.json'));
  assert.equal(evidence.redundancy, path.join(root, 'redundancy', 'v2.10', 'manifest.json'));
  assert.equal(evidence.preservation, path.join(root, 'preservation', 'v2.10', 'manifest.json'));
  assert.equal(evidence.lockedLineage, path.join(root, 'lineage', 'v2.10', 'lock', 'lineage-lock.sha256'));
  for (const evidencePath of Object.values(evidence)) {
    assert.ok(fs.existsSync(evidencePath), `continuity evidence exists: ${evidencePath}`);
  }

  const survivabilityManifest = fs.readFileSync(evidence.survivability, 'utf8').replace(/\r\n?/g, '\n');
  const expectedSeal = crypto.createHash('sha256').update(survivabilityManifest, 'utf8').digest('hex');
  const actualSeal = fs.readFileSync(sealPath, 'utf8').trim();
  assert.equal(actualSeal, expectedSeal);
  assert.equal(actualSeal, generateContinuitySeal());

  const verifierResults = await Promise.all([
    runAnchorVerificationTests(),
    runLineageVerificationTests(),
    runLineageLockVerificationTests(),
    runPreservationVerificationTests(),
    runRedundancyVerificationTests(),
    runSurvivabilityVerificationTests()
  ]);
  for (const result of verifierResults) assert.equal(result.ok, true);

  return {
    ok: true,
    tests: [
      'Continuity seal digest and certificate validate',
      'Survivability, redundancy, preservation, and lock evidence resolves',
      'Anchors, lineage, lock, and recovery checks rerun successfully',
      'Certificate correctly identifies hash-linked integrity semantics'
    ]
  };
}