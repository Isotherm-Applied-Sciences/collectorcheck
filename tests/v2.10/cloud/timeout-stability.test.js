import assert from 'node:assert/strict';
import { stableTimeoutConfig } from '../../../src/v2/cloud/robustness/timeout-stability.js';

export async function runTimeoutStabilityTests() {
  const malformed = stableTimeoutConfig(null);
  assert.deepEqual(malformed.timeout, { request_ms: 0, connect_ms: 0, overall_ms: 0 });
  assert.ok(malformed.warnings.includes('malformed_timeout_config'));

  const circular = {};
  circular.self = circular;
  assert.ok(stableTimeoutConfig(circular).warnings.includes('invalid_json_structure'));

  const missing = stableTimeoutConfig({ request_ms: 100 });
  assert.ok(missing.warnings.includes('missing_required_field_connect_ms'));
  assert.ok(missing.warnings.includes('missing_required_field_overall_ms'));

  const normalized = stableTimeoutConfig({
    request_ms: ' 100 ',
    connect_ms: ' 50 ',
    overall_ms: ' 200 '
  });
  assert.deepEqual(normalized.timeout, { request_ms: 100, connect_ms: 50, overall_ms: 200 });

  const negative = stableTimeoutConfig({ request_ms: -100, connect_ms: 50, overall_ms: 200 });
  assert.equal(negative.timeout.request_ms, 0);
  assert.ok(negative.warnings.includes('negative_timeout_corrected_request_ms'));

  const tooSmall = stableTimeoutConfig({ request_ms: 100, connect_ms: 50, overall_ms: 120 });
  assert.equal(tooSmall.timeout.overall_ms, 150);
  assert.ok(tooSmall.warnings.includes('overall_timeout_too_small_corrected'));

  const nonFinite = stableTimeoutConfig({ request_ms: Infinity, connect_ms: 50, overall_ms: 200 });
  assert.equal(nonFinite.timeout.request_ms, 0);
  assert.ok(nonFinite.warnings.includes('non_finite_number_request_ms'));

  const unsupported = stableTimeoutConfig({ request_ms: 100, connect_ms: {}, overall_ms: 200 });
  assert.equal(unsupported.timeout.connect_ms, 0);
  assert.ok(unsupported.warnings.includes('unsupported_type_connect_ms'));

  const overflow = stableTimeoutConfig({
    request_ms: Number.MAX_VALUE,
    connect_ms: Number.MAX_VALUE,
    overall_ms: 0
  });
  assert.deepEqual(overflow.timeout, {
    request_ms: Number.MAX_SAFE_INTEGER,
    connect_ms: Number.MAX_SAFE_INTEGER,
    overall_ms: Number.MAX_SAFE_INTEGER
  });
  assert.ok(overflow.warnings.includes('overall_timeout_too_small_corrected'));

  const hostile = new Proxy({}, {
    get() { throw new Error('unreadable config'); },
    getOwnPropertyDescriptor() { throw new Error('unreadable config'); }
  });
  const rejectedHostile = stableTimeoutConfig(hostile);
  assert.deepEqual(rejectedHostile.timeout, { request_ms: 0, connect_ms: 0, overall_ms: 0 });
  assert.ok(rejectedHostile.warnings.includes('invalid_json_structure'));

  return {
    ok: true,
    tests: [
      'Malformed and circular timeout configuration',
      'Required fields and numeric normalization',
      'Negative and undersized timeout correction',
      'Non-finite, unsupported, overflow, and hostile input handling'
    ]
  };
}