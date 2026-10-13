import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runContinuitySealVerificationTests } from '../continuity-seal/continuity-seal-verification.test.js';
import { generatePermanenceSeal } from '../../../permanence/v2.10/permanence-seal.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runPermanenceVerificationTests() {
  const permanenceDirectory = path.join(root, 'permanence', 'v2.10');
  const sealPath = path.join(permanenceDirectory, 'permanence-seal.sha256');
  const certificatePath = path.join(permanenceDirectory, 'certificate.json');
  assert.ok(fs.existsSync(sealPath), 'permanence seal exists');
  assert.ok(fs.existsSync(certificatePath), 'permanence certificate exists');

  const certificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
  assert.equal(certificate.version, '2.10.0');
  assert.equal(certificate.permanent, true);
  assert.equal(certificate.permanence_scope, 'versioned-release-snapshot');
  assert.match(certificate.permanence_note, /does not prevent future modification or supersession/);
  assert.ok(Number.isFinite(Date.parse(certificate.issued_at)));
  assert.equal(certificate.permanence_rules.release_is_perpetual, false);
  assert.equal(certificate.permanence_rules.cannot_be_superseded, false);
  assert.equal(certificate.permanence_rules.cannot_be_modified, false);
  assert.equal(certificate.permanence_rules.lineage_root_status, 'versioned_snapshot');
  assert.equal(certificate.permanence_rules.tamper_evident, true);

  const continuityCertificatePath = path.resolve(
    permanenceDirectory,
    '../../continuity-seal/v2.10/certificate.json'
  );
  const evidence = {
    continuitySeal: path.resolve(permanenceDirectory, certificate.continuity_seal),
    lineageLock: path.resolve(permanenceDirectory, certificate.lineage_lock),
    survivability: path.resolve(permanenceDirectory, certificate.survivability_manifest),
    redundancy: path.resolve(permanenceDirectory, certificate.redundancy_manifest),
    preservation: path.resolve(permanenceDirectory, certificate.preservation_manifest)
  };
  assert.equal(continuityCertificatePath, path.join(root, 'continuity-seal', 'v2.10', 'certificate.json'));
  for (const evidencePath of Object.values(evidence)) {
    assert.ok(fs.existsSync(evidencePath), `permanence evidence exists: ${evidencePath}`);
  }

  const continuityCertificate = fs.readFileSync(continuityCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  const expectedSeal = crypto.createHash('sha256').update(continuityCertificate, 'utf8').digest('hex');
  const actualSeal = fs.readFileSync(sealPath, 'utf8').trim();
  assert.equal(actualSeal, expectedSeal);
  assert.equal(actualSeal, generatePermanenceSeal());

  const continuityVerification = await runContinuitySealVerificationTests();
  assert.equal(continuityVerification.ok, true);

  return {
    ok: true,
    tests: [
      'Permanence digest and versioned certificate validate',
      'Continuity, lock, survivability, redundancy, and preservation evidence resolve',
      'Continuity verification reruns successfully',
      'Certificate distinguishes snapshot integrity from immutable permanence'
    ]
  };
}