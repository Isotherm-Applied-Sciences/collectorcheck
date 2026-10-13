import assert from 'node:assert/strict';
import { stableEnvelope } from '../../../src/v2/provenance/robustness/envelope-stability.js';

export async function runEnvelopeStabilityTests() {
  const malformed = stableEnvelope(null);
  assert.deepEqual(malformed.envelope, {});
  assert.deepEqual(malformed.chain, []);
  assert.ok(malformed.warnings.includes('malformed_envelope'));

  const circularEnvelope = {};
  circularEnvelope.self = circularEnvelope;
  const invalid = stableEnvelope(circularEnvelope);
  assert.deepEqual(invalid.envelope, {});
  assert.deepEqual(invalid.chain, []);
  assert.ok(invalid.warnings.includes('invalid_json_structure'));

  const missing = stableEnvelope({ source: 'scanner' });
  assert.ok(missing.warnings.includes('missing_required_field_document_id'));
  assert.ok(missing.warnings.includes('missing_required_field_created_at'));
  assert.ok(missing.warnings.includes('missing_required_field_chain'));

  const normalized = stableEnvelope({
    document_id: '  ABC123  ',
    source: '  mobile_app  ',
    created_at: ' 2024-01-01 ',
    chain: []
  });
  assert.equal(normalized.envelope.document_id, 'ABC123');
  assert.equal(normalized.envelope.source, 'mobile_app');
  assert.equal(normalized.envelope.created_at, '2024-01-01');

  const nonFinite = stableEnvelope({
    document_id: 'A', source: 'scanner', created_at: '2024-01-01', chain: [], confidence: Infinity
  });
  assert.equal(nonFinite.envelope.confidence, '');
  assert.ok(nonFinite.warnings.includes('non_finite_number_confidence'));

  const circularMetadata = {};
  circularMetadata.self = circularMetadata;
  const partial = stableEnvelope({
    document_id: 'A', source: 'scanner', created_at: '2024-01-01', chain: [], meta: circularMetadata
  });
  assert.equal(partial.envelope.meta, '');
  assert.ok(partial.warnings.includes('invalid_object_structure_meta'));
  assert.equal(partial.envelope.document_id, 'A');

  const chained = stableEnvelope({
    document_id: 'A', source: 'scanner', created_at: '2024-01-01',
    chain: [
      { id: 'child', parent: 'root', timestamp: 't2' },
      { id: 'root', parent: '', timestamp: 't1' }
    ]
  });
  assert.equal(chained.envelope.chain[0].id, 'root');
  assert.equal(chained.chain[1].id, 'child');

  return {
    ok: true,
    tests: [
      'Malformed envelope handling',
      'Required fields and string normalization',
      'Invalid nested value isolation',
      'Chain normalization integration'
    ]
  };
}