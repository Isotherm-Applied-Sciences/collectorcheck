import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { stableTamperDetection } from '../../../src/v2/provenance/robustness/tamper-stability.js';

export async function runTamperStabilityTests() {
  const nonArray = stableTamperDetection(null);
  assert.equal(nonArray.tampered, true);
  assert.ok(nonArray.warnings.includes('non_array_chain'));

  const circularChain = [];
  circularChain.push(circularChain);
  const invalid = stableTamperDetection(circularChain);
  assert.equal(invalid.tampered, true);
  assert.ok(invalid.warnings.includes('invalid_json_structure'));

  const missingId = stableTamperDetection([{ id: '', timestamp: '2024-01-01T00:00:00.000Z' }]);
  assert.ok(missingId.warnings.includes('missing_or_invalid_id'));

  const missingTimestamp = stableTamperDetection([{ id: 'A', timestamp: '' }]);
  assert.ok(missingTimestamp.warnings.includes('missing_or_invalid_timestamp_A'));

  const raw = { id: 'A', timestamp: '2024-01-01T00:00:00.000Z' };
  const wrongHash = stableTamperDetection([{ ...raw, hash: '0'.repeat(64), raw }]);
  assert.ok(wrongHash.warnings.includes('hash_mismatch_A'));

  const missingParent = stableTamperDetection([
    { id: 'child', parent: 'missing', timestamp: '2024-01-01T00:00:00.000Z' }
  ]);
  assert.ok(missingParent.warnings.includes('missing_parent_missing'));

  const outOfOrder = stableTamperDetection([
    { id: 'A', timestamp: '2024-01-02T00:00:00.000Z' },
    { id: 'B', timestamp: '2024-01-01T00:00:00.000Z' }
  ]);
  assert.ok(outOfOrder.warnings.includes('timestamp_out_of_order_B'));

  const keyPair = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const signedRaw = { id: 'signed', timestamp: '2024-01-01T00:00:00.000Z' };
  const signature = crypto.sign('sha256', Buffer.from(JSON.stringify(signedRaw)), keyPair.privateKey).toString('hex');
  const validSignature = stableTamperDetection([
    { ...signedRaw, raw: signedRaw, public_key: keyPair.publicKey.export({ type: 'spki', format: 'pem' }), signature }
  ]);
  assert.equal(validSignature.tampered, false);

  const invalidSignature = stableTamperDetection([
    { ...signedRaw, raw: signedRaw, public_key: keyPair.publicKey.export({ type: 'spki', format: 'pem' }), signature: '00' }
  ]);
  assert.ok(invalidSignature.warnings.includes('signature_mismatch_signed'));

  const deterministicA = stableTamperDetection([{ id: 'A', timestamp: '2024-01-01T00:00:00.000Z' }]);
  const deterministicB = stableTamperDetection([{ id: 'A', timestamp: '2024-01-01T00:00:00.000Z' }]);
  assert.deepEqual(deterministicA, deterministicB);

  return {
    ok: true,
    tests: [
      'Malformed chain and segment handling',
      'ID, hash, and parent validation',
      'Timestamp order detection',
      'Signature verification',
      'Deterministic tamper results'
    ]
  };
}