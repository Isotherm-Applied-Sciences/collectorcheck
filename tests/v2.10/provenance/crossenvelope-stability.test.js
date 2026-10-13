import assert from 'node:assert/strict';
import { stableCrossEnvelopes } from '../../../src/v2/provenance/robustness/crossenvelope-stability.js';

function envelope(overrides = {}) {
  return {
    document_id: 'A',
    source: 'scanner',
    created_at: '2024-01-01T00:00:00.000Z',
    chain: [],
    ...overrides
  };
}

export async function runCrossEnvelopeStabilityTests() {
  const nonArray = stableCrossEnvelopes(null);
  assert.deepEqual(nonArray.envelopes, []);
  assert.ok(nonArray.warnings.includes('non_array_envelopes'));

  const circular = [];
  circular.push(circular);
  const invalid = stableCrossEnvelopes(circular);
  assert.deepEqual(invalid.envelopes, []);
  assert.ok(invalid.warnings.includes('invalid_json_structure'));

  const sourceMismatch = stableCrossEnvelopes([
    envelope(),
    envelope({ source: 'mobile_app' })
  ]);
  assert.ok(sourceMismatch.warnings.includes('source_mismatch_across_envelopes'));

  const documentMismatch = stableCrossEnvelopes([
    envelope({ document_id: 'B' }),
    envelope({ document_id: 'A' })
  ]);
  assert.ok(documentMismatch.warnings.includes('document_id_mismatch_across_envelopes'));

  const missingId = stableCrossEnvelopes([
    envelope({ document_id: 'B' }),
    envelope({ document_id: 'A' }),
    envelope({ document_id: '' })
  ]);
  assert.equal(missingId.envelopes[2].envelope.document_id, 'A');
  assert.ok(missingId.warnings.includes('document_id_reconstructed_across_envelopes'));

  const timestampOrder = stableCrossEnvelopes([
    envelope({ created_at: '2024-01-02T00:00:00.000Z' }),
    envelope({ created_at: '2024-01-01T00:00:00.000Z' })
  ]);
  assert.ok(timestampOrder.warnings.includes('timestamp_out_of_order_across_envelopes'));

  const lengthMismatch = stableCrossEnvelopes([
    envelope({ chain: [{ id: 'root', parent: '', timestamp: 't1' }] }),
    envelope()
  ]);
  assert.ok(lengthMismatch.warnings.includes('chain_length_mismatch_across_envelopes'));

  const idMismatch = stableCrossEnvelopes([
    envelope({ chain: [{ id: 'root', parent: '', timestamp: 't1' }] }),
    envelope({ chain: [{ id: 'child', parent: '', timestamp: 't1' }] })
  ]);
  assert.ok(idMismatch.warnings.includes('chain_id_mismatch_root'));
  assert.ok(idMismatch.warnings.includes('chain_id_mismatch_child'));

  const orderMismatch = stableCrossEnvelopes([
    envelope({ chain: [
      { id: 'root', parent: '', timestamp: 't1' },
      { id: 'child', parent: 'root', timestamp: 't2' }
    ] }),
    envelope({ chain: [
      { id: 'child', parent: 'root', timestamp: 't2' },
      { id: 'root', parent: '', timestamp: 't1' }
    ] })
  ]);
  assert.ok(orderMismatch.warnings.includes('chain_order_mismatch_across_envelopes'));

  return {
    ok: true,
    tests: [
      'Invalid collection handling',
      'Source/document consistency and deterministic reconstruction',
      'Timestamp ordering',
      'Chain length, ID, and order consistency'
    ]
  };
}