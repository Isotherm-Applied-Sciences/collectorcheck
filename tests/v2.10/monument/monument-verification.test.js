import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCanonVerificationTests } from '../canon/canon-verification.test.js';
import { generateMonumentHash } from '../../../monument/v2.10/monument.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runMonumentVerificationTests() {
  const monumentDirectory = path.join(root, 'monument', 'v2.10');
  const hashPath = path.join(monumentDirectory, 'monument.sha256');
  const recordPath = path.join(monumentDirectory, 'record.json');
  assert.ok(fs.existsSync(hashPath), 'monument hash exists');
  assert.ok(fs.existsSync(recordPath), 'monument record exists');

  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  assert.equal(record.version, '2.10.0');
  assert.equal(record.monument_established, true);
  assert.equal(record.monument_scope, 'versioned-release-marker');
  assert.ok(Number.isFinite(Date.parse(record.issued_at)));
  assert.equal(record.monument_rules.final_status, 'versioned_snapshot');
  assert.equal(record.monument_rules.cannot_be_replaced, false);
  assert.equal(record.monument_rules.cannot_be_removed, false);
  assert.equal(record.monument_rules.must_be_referenced_by_all_future_releases, true);
  assert.equal(record.monument_rules.reference_enforcement, 'repository_policy_only');
  assert.equal(record.monument_rules.tamper_evident, true);
  assert.equal(record.monument_rules.integrity_semantics, 'sha256_hash_linked');

  const canonCertificatePath = path.resolve(monumentDirectory, '../../canon/v2.10/certificate.json');
  const permanenceCertificatePath = path.resolve(monumentDirectory, record.permanence_certificate);
  const continuityCertificatePath = path.resolve(monumentDirectory, record.continuity_seal);
  const lineageLockPath = path.resolve(monumentDirectory, record.lineage_lock);
  assert.equal(canonCertificatePath, path.join(root, 'canon', 'v2.10', 'certificate.json'));
  assert.equal(permanenceCertificatePath, path.join(root, 'permanence', 'v2.10', 'certificate.json'));
  assert.equal(continuityCertificatePath, path.join(root, 'continuity-seal', 'v2.10', 'certificate.json'));
  assert.equal(lineageLockPath, path.join(root, 'lineage', 'v2.10', 'lock', 'lineage-lock.sha256'));
  for (const evidencePath of [canonCertificatePath, permanenceCertificatePath, continuityCertificatePath, lineageLockPath]) {
    assert.ok(fs.existsSync(evidencePath), `monument evidence exists: ${evidencePath}`);
  }

  const canonCertificate = fs.readFileSync(canonCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  const expectedHash = crypto.createHash('sha256').update(canonCertificate, 'utf8').digest('hex');
  const actualHash = fs.readFileSync(hashPath, 'utf8').trim();
  assert.equal(actualHash, expectedHash);
  assert.equal(actualHash, generateMonumentHash());

  const canonVerification = await runCanonVerificationTests();
  assert.equal(canonVerification.ok, true);

  return {
    ok: true,
    tests: [
      'Monument hash and versioned record validate',
      'Canonical, permanence, continuity, and lock references resolve',
      'Monument hash matches the canonization certificate',
      'Canonization verification reruns successfully'
    ]
  };
}