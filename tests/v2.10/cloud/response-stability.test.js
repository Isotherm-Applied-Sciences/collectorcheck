import assert from 'node:assert/strict';
import { stableCloudResponse } from '../../../src/v2/cloud/robustness/response-stability.js';

export async function runCloudResponseStabilityTests() {
  const malformed = stableCloudResponse(null);
  assert.deepEqual(malformed.response, {});
  assert.ok(malformed.warnings.includes('malformed_response'));

  const circularResponse = {};
  circularResponse.self = circularResponse;
  const invalid = stableCloudResponse(circularResponse);
  assert.deepEqual(invalid.response, {});
  assert.ok(invalid.warnings.includes('invalid_json_structure'));

  const missing = stableCloudResponse({ status: 200 });
  assert.ok(missing.warnings.includes('missing_required_field_payload'));

  const normalized = stableCloudResponse({
    status: ' 200 ',
    payload: '  { "ok": true }  '
  });
  assert.equal(normalized.response.status, '200');
  assert.equal(normalized.response.payload, '{ "ok": true }');

  const nonFinite = stableCloudResponse({ status: 200, payload: {}, latency: Infinity });
  assert.equal(nonFinite.response.latency, '');
  assert.ok(nonFinite.warnings.includes('non_finite_number_latency'));

  const circularPayload = {};
  circularPayload.self = circularPayload;
  const partial = stableCloudResponse({ status: 200, payload: circularPayload });
  assert.equal(partial.response.status, 200);
  assert.equal(partial.response.payload, '');
  assert.ok(partial.warnings.includes('invalid_object_structure_payload'));

  const unsupported = stableCloudResponse({ status: 200, payload: {}, meta: Symbol('x') });
  assert.equal(unsupported.response.meta, '');
  assert.ok(unsupported.warnings.includes('unsupported_type_meta'));

  const orderedA = stableCloudResponse({ status: 200, payload: { b: 2, a: 1 } });
  const orderedB = stableCloudResponse({ payload: { a: 1, b: 2 }, status: 200 });
  assert.deepEqual(orderedA, orderedB);

  return {
    ok: true,
    tests: [
      'Malformed response and root-cycle handling',
      'Required response fields',
      'String and structured payload normalization',
      'Non-finite and unsupported values',
      'Nested malformed payload isolation',
      'Deterministic key ordering'
    ]
  };
}