import assert from 'node:assert/strict';
import { stableBackoff, stableRetryConfig } from '../../../src/v2/cloud/robustness/retry-stability.js';

export async function runRetryStabilityTests() {
  const malformed = stableRetryConfig(null);
  assert.deepEqual(malformed.retry, { attempts: 0, delay_ms: 0, max_delay_ms: 0 });
  assert.ok(malformed.warnings.includes('malformed_retry_config'));

  const circular = {};
  circular.self = circular;
  const invalidJson = stableRetryConfig(circular);
  assert.ok(invalidJson.warnings.includes('invalid_json_structure'));

  const missing = stableRetryConfig({ attempts: 3 });
  assert.ok(missing.warnings.includes('missing_required_field_delay_ms'));
  assert.ok(missing.warnings.includes('missing_required_field_max_delay_ms'));

  const normalized = stableRetryConfig({ attempts: ' 3 ', delay_ms: ' 100 ', max_delay_ms: ' 500 ' });
  assert.deepEqual(normalized.retry, { attempts: 3, delay_ms: 100, max_delay_ms: 500 });

  const fractional = stableRetryConfig({ attempts: 3.8, delay_ms: 100, max_delay_ms: 500 });
  assert.equal(fractional.retry.attempts, 3);
  assert.ok(fractional.warnings.includes('fractional_attempts_rounded_down'));

  const excessive = stableRetryConfig({ attempts: 50, delay_ms: 100, max_delay_ms: 500 });
  assert.equal(excessive.retry.attempts, 10);
  assert.ok(excessive.warnings.includes('attempts_clamped_to_10'));

  const negativeDelay = stableRetryConfig({ attempts: 3, delay_ms: -100, max_delay_ms: 500 });
  assert.equal(negativeDelay.retry.delay_ms, 0);
  assert.ok(negativeDelay.warnings.includes('negative_delay_ms_corrected'));

  const maxBelowBase = stableRetryConfig({ attempts: 3, delay_ms: 200, max_delay_ms: 100 });
  assert.equal(maxBelowBase.retry.max_delay_ms, 200);
  assert.ok(maxBelowBase.warnings.includes('max_delay_less_than_delay_corrected'));

  const config = { attempts: 5, delay_ms: 100, max_delay_ms: 1000 };
  assert.equal(stableBackoff(0, config), 100);
  assert.equal(stableBackoff(1, config), 200);
  assert.equal(stableBackoff(2, config), 400);
  assert.equal(stableBackoff(3, config), 800);
  assert.equal(stableBackoff(4, config), 1000);
  assert.equal(stableBackoff(3, { attempts: 5, delay_ms: 100, max_delay_ms: 300 }), 300);
  assert.equal(stableBackoff(-1, config), 0);
  assert.equal(stableBackoff(Number.NaN, config), 0);

  return {
    ok: true,
    tests: [
      'Malformed and missing retry configuration',
      'Numeric normalization and attempt storm clamp',
      'Delay correction and deterministic exponential backoff',
      'Invalid attempt handling'
    ]
  };
}