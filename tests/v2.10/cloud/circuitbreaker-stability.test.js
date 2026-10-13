import assert from 'node:assert/strict';
import {
  stableBreakerTransition,
  stableCircuitBreaker
} from '../../../src/v2/cloud/robustness/circuitbreaker-stability.js';

export async function runCircuitBreakerStabilityTests() {
  const malformed = stableCircuitBreaker(null);
  assert.deepEqual(malformed.breaker, { state: 'closed', failures: 0, threshold: 5, reset_ms: 30000 });
  assert.ok(malformed.warnings.includes('malformed_breaker_config'));

  const circular = {};
  circular.self = circular;
  assert.ok(stableCircuitBreaker(circular).warnings.includes('invalid_json_structure'));

  const missing = stableCircuitBreaker({ state: 'open' });
  assert.ok(missing.warnings.includes('missing_required_field_failures'));
  assert.ok(missing.warnings.includes('missing_required_field_threshold'));
  assert.ok(missing.warnings.includes('missing_required_field_reset_ms'));

  const normalized = stableCircuitBreaker({
    state: ' CLOSED ',
    failures: ' 3 ',
    threshold: ' 5 ',
    reset_ms: ' 30000 '
  });
  assert.deepEqual(normalized.breaker, { state: 'closed', failures: 3, threshold: 5, reset_ms: 30000 });

  const negative = stableCircuitBreaker({ state: 'closed', failures: -10, threshold: 5, reset_ms: 30000 });
  assert.equal(negative.breaker.failures, 0);
  assert.ok(negative.warnings.includes('negative_failures_corrected'));

  const exceeded = stableCircuitBreaker({ state: 'closed', failures: 10, threshold: 5, reset_ms: 30000 });
  assert.equal(exceeded.breaker.state, 'open');
  assert.ok(exceeded.warnings.includes('failures_exceed_threshold'));

  const invalidState = stableCircuitBreaker({ state: 'INVALID', failures: 0, threshold: 5, reset_ms: 30000 });
  assert.equal(invalidState.breaker.state, 'closed');
  assert.ok(invalidState.warnings.includes('invalid_state_corrected'));

  const tooSmallReset = stableCircuitBreaker({ state: 'closed', failures: 0, threshold: 5, reset_ms: 10 });
  assert.equal(tooSmallReset.breaker.reset_ms, 1000);
  assert.ok(tooSmallReset.warnings.includes('reset_ms_too_small_corrected'));

  const nonFinite = stableCircuitBreaker({ state: 'closed', failures: Infinity, threshold: 5, reset_ms: 30000 });
  assert.equal(nonFinite.breaker.failures, 0);
  assert.ok(nonFinite.warnings.includes('non_finite_number_failures'));

  const success = stableBreakerTransition(
    { state: 'open', failures: 5, threshold: 5, reset_ms: 30000 },
    'success'
  );
  assert.deepEqual(success, { state: 'closed', failures: 0 });

  const failure = stableBreakerTransition(
    { state: 'closed', failures: 2, threshold: 5, reset_ms: 30000 },
    'failure'
  );
  assert.deepEqual(failure, { state: 'half_open', failures: 3 });

  const thresholdFailure = stableBreakerTransition(
    { state: 'half_open', failures: 4, threshold: 5, reset_ms: 30000 },
    'failure'
  );
  assert.deepEqual(thresholdFailure, { state: 'open', failures: 5 });

  const saturatedFailure = stableBreakerTransition(
    { state: 'open', failures: Number.MAX_SAFE_INTEGER, threshold: 5, reset_ms: 30000 },
    'failure'
  );
  assert.deepEqual(saturatedFailure, { state: 'open', failures: Number.MAX_SAFE_INTEGER });

  const hostile = new Proxy({}, {
    get() { throw new Error('unreadable config'); },
    getOwnPropertyDescriptor() { throw new Error('unreadable config'); }
  });
  const rejectedHostile = stableCircuitBreaker(hostile);
  assert.deepEqual(rejectedHostile.breaker, { state: 'closed', failures: 0, threshold: 5, reset_ms: 30000 });
  assert.ok(rejectedHostile.warnings.includes('invalid_json_structure'));

  return {
    ok: true,
    tests: [
      'Malformed and missing breaker configuration',
      'State, counter, and reset normalization',
      'Threshold, reset, and non-finite correction',
      'Deterministic success/failure transitions and saturation',
      'Hostile configuration fallback'
    ]
  };
}