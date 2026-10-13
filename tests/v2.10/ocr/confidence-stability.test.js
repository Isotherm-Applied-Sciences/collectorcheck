import assert from 'node:assert/strict';
import { stableAverage, stableConfidence } from '../../../src/v2/ocr/robustness/confidence-stability.js';

export async function runConfidenceStabilityTests() {
  const missing = stableConfidence(null);
  assert.equal(missing.confidence, 0);
  assert.ok(missing.warnings.includes('missing_confidence'));

  assert.equal(stableConfidence(85).confidence, 0.85);

  const stringValue = stableConfidence('0.92');
  assert.equal(stringValue.confidence, 0.92);
  assert.ok(stringValue.warnings.includes('string_confidence_normalized'));

  assert.equal(stableConfidence({ score: 0.77 }).confidence, 0.77);
  assert.equal(stableConfidence({ value: '65' }).confidence, 0.65);
  assert.equal(stableConfidence(500).confidence, 1);
  assert.equal(stableConfidence(-3).confidence, 0);

  const invalid = stableConfidence({ confidence: 'abc' });
  assert.equal(invalid.confidence, 0);
  assert.ok(invalid.warnings.includes('non_numeric_confidence'));

  const empty = stableAverage([]);
  assert.equal(empty.confidence, 0);
  assert.ok(empty.warnings.includes('empty_block_list'));

  const average = stableAverage([0.5, 0.9, 80]);
  assert.equal(average.confidence, 0.7333333333333334);

  return {
    ok: true,
    tests: [
      'Missing confidence fallback',
      'Percentage and decimal normalization',
      'Provider-specific fields',
      'Bounds and invalid input handling',
      'Stable confidence averaging'
    ]
  };
}