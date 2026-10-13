import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAnchor } from '../../../ledger/anchor/v2.10/anchor.js';
import { generateForwardAnchor } from '../../../ledger/continuity/v2.10/forward-anchor.js';
import { generateLineageSeal } from '../../../lineage/v2.10/lineage-seal.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runLineageVerificationTests() {
  const lineageDirectory = path.join(root, 'lineage', 'v2.10');
  const sealPath = path.join(lineageDirectory, 'lineage-seal.sha256');
  const certificatePath = path.join(lineageDirectory, 'certificate.json');
  assert.ok(fs.existsSync(sealPath), 'lineage seal exists');
  assert.ok(fs.existsSync(certificatePath), 'lineage certificate exists');

  const certificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
  assert.equal(certificate.version, '2.10.0');
  assert.equal(certificate.lineage_sealed, true);
  assert.ok(Number.isFinite(Date.parse(certificate.issued_at)));
  assert.equal(certificate.lineage_rules.chain_type, 'append-only');
  assert.equal(certificate.lineage_rules.tamper_evident, true);
  assert.equal(certificate.lineage_rules.lineage_integrity, 'hash_linked_tamper_evident');
  assert.equal(certificate.lineage_rules.signer_authenticated, false);

  const rootAnchorPath = path.resolve(lineageDirectory, certificate.root_anchor);
  const forwardAnchorPath = path.resolve(lineageDirectory, certificate.forward_anchor);
  const nextReleaseAnchorPath = path.resolve(
    lineageDirectory,
    certificate.lineage_rules.future_release_must_anchor_to
  );
  assert.equal(rootAnchorPath, path.join(root, 'ledger', 'anchor', 'v2.10', 'anchor.sha256'));
  assert.equal(forwardAnchorPath, path.join(root, 'ledger', 'continuity', 'v2.10', 'forward-anchor.sha256'));
  assert.equal(nextReleaseAnchorPath, forwardAnchorPath);

  const rootAnchor = fs.readFileSync(rootAnchorPath, 'utf8').trim();
  const forwardAnchor = fs.readFileSync(forwardAnchorPath, 'utf8').trim();
  const actualSeal = fs.readFileSync(sealPath, 'utf8').trim();
  const expectedSeal = crypto.createHash('sha256').update(forwardAnchor, 'utf8').digest('hex');
  assert.equal(rootAnchor, generateAnchor());
  assert.equal(forwardAnchor, generateForwardAnchor());
  assert.equal(actualSeal, expectedSeal);
  assert.equal(actualSeal, generateLineageSeal());

  return {
    ok: true,
    tests: [
      'Lineage seal and certificate exist and validate',
      'Root, forward, and future anchor paths resolve',
      'Ledger-to-lineage SHA-256 chain verifies',
      'Certificate describes hash-link integrity accurately'
    ]
  };
}