import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runPermanenceVerificationTests } from '../permanence/permanence-verification.test.js';
import { generateCanonicalRecord } from '../../../canon/v2.10/canon.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runCanonVerificationTests() {
  const canonDirectory = path.join(root, 'canon', 'v2.10');
  const recordPath = path.join(canonDirectory, 'canonical-record.sha256');
  const certificatePath = path.join(canonDirectory, 'certificate.json');
  assert.ok(fs.existsSync(recordPath), 'canonical record exists');
  assert.ok(fs.existsSync(certificatePath), 'canonization certificate exists');

  const certificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
  assert.equal(certificate.version, '2.10.0');
  assert.equal(certificate.canonized, true);
  assert.equal(certificate.canonization_scope, 'versioned-historical-record');
  assert.ok(Number.isFinite(Date.parse(certificate.issued_at)));
  assert.equal(certificate.canonization_rules.historical_record_status, 'versioned_snapshot');
  assert.equal(certificate.canonization_rules.must_be_referenced_by_future_releases, true);
  assert.equal(certificate.canonization_rules.reference_enforcement, 'repository_policy_only');
  assert.equal(certificate.canonization_rules.cannot_be_removed_from_history, false);
  assert.equal(certificate.canonization_rules.tamper_evident, true);
  assert.equal(certificate.canonization_rules.integrity_semantics, 'sha256_hash_linked');

  const permanenceCertificatePath = path.resolve(canonDirectory, certificate.permanence_certificate);
  const continuitySealPath = path.resolve(canonDirectory, certificate.continuity_seal);
  const lineageLockPath = path.resolve(canonDirectory, certificate.lineage_lock);
  assert.equal(permanenceCertificatePath, path.join(root, 'permanence', 'v2.10', 'certificate.json'));
  assert.equal(continuitySealPath, path.join(root, 'continuity-seal', 'v2.10', 'certificate.json'));
  assert.equal(lineageLockPath, path.join(root, 'lineage', 'v2.10', 'lock', 'lineage-lock.sha256'));
  for (const evidencePath of [permanenceCertificatePath, continuitySealPath, lineageLockPath]) {
    assert.ok(fs.existsSync(evidencePath), `canonization evidence exists: ${evidencePath}`);
  }

  const permanenceCertificate = fs.readFileSync(permanenceCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  const expectedRecord = crypto.createHash('sha256').update(permanenceCertificate, 'utf8').digest('hex');
  const actualRecord = fs.readFileSync(recordPath, 'utf8').trim();
  assert.equal(actualRecord, expectedRecord);
  assert.equal(actualRecord, generateCanonicalRecord());

  const permanenceVerification = await runPermanenceVerificationTests();
  assert.equal(permanenceVerification.ok, true);

  return {
    ok: true,
    tests: [
      'Canonical record and certificate validate',
      'Permanence, continuity, and lock references resolve',
      'Canonical SHA-256 record matches the permanence certificate',
      'Permanence verification reruns successfully'
    ]
  };
}