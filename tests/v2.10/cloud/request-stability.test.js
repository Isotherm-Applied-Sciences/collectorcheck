import assert from 'node:assert/strict';
import { stableCloudRequest } from '../../../src/v2/cloud/robustness/request-stability.js';

export async function runCloudRequestStabilityTests() {
  const malformed = stableCloudRequest(null);
  assert.deepEqual(malformed.request, {});
  assert.ok(malformed.warnings.includes('malformed_request'));

  const circularRequest = {};
  circularRequest.self = circularRequest;
  const invalid = stableCloudRequest(circularRequest);
  assert.deepEqual(invalid.request, {});
  assert.ok(invalid.warnings.includes('invalid_json_structure'));

  const missing = stableCloudRequest({ endpoint: '/scan' });
  assert.ok(missing.warnings.includes('missing_required_field_payload'));
  assert.ok(missing.warnings.includes('missing_required_field_method'));

  const normalized = stableCloudRequest({
    endpoint: '  /scan  ',
    payload: '  { "a": 1 }  ',
    method: '  POST  '
  });
  assert.equal(normalized.request.endpoint, '/scan');
  assert.equal(normalized.request.payload, '{ "a": 1 }');
  assert.equal(normalized.request.method, 'POST');

  const nonFinite = stableCloudRequest({ endpoint: '/scan', payload: {}, method: 'POST', timeout: Infinity });
  assert.equal(nonFinite.request.timeout, '');
  assert.ok(nonFinite.warnings.includes('non_finite_number_timeout'));

  const circularPayload = {};
  circularPayload.self = circularPayload;
  const partial = stableCloudRequest({ endpoint: '/scan', payload: circularPayload, method: 'POST' });
  assert.equal(partial.request.endpoint, '/scan');
  assert.equal(partial.request.payload, '');
  assert.ok(partial.warnings.includes('invalid_object_structure_payload'));

  const unsupported = stableCloudRequest({ endpoint: '/scan', payload: {}, method: 'POST', meta: Symbol('x') });
  assert.equal(unsupported.request.meta, '');
  assert.ok(unsupported.warnings.includes('unsupported_type_meta'));

  const orderedA = stableCloudRequest({ endpoint: '/scan', payload: { z: 1, a: 2 }, method: 'POST' });
  const orderedB = stableCloudRequest({ endpoint: '/scan', payload: { a: 2, z: 1 }, method: 'POST' });
  assert.deepEqual(orderedA, orderedB);

  return {
    ok: true,
    tests: [
      'Malformed request and root-cycle handling',
      'Required field reporting',
      'String and object normalization',
      'Invalid numeric and unsupported type handling',
      'Nested malformed payload isolation',
      'Deterministic key ordering'
    ]
  };
}