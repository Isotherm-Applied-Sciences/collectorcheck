import assert from 'node:assert/strict';
import { stableExtract } from '../../../src/v2/ocr/robustness/extraction-stability.js';
import { runConfidenceStabilityTests } from './confidence-stability.test.js';

export async function runExtractionStabilityTests() {
  const malformed = stableExtract(null);
  assert.deepEqual(malformed, {
    text: '',
    confidence: 0,
    warnings: ['malformed_ocr_block']
  });

  const missingText = stableExtract({ confidence: 0.8 });
  assert.equal(missingText.text, '');
  assert.equal(missingText.confidence, 0.8);
  assert.ok(missingText.warnings.includes('missing_text'));

  const normalized = stableExtract({ text: '  Hello   World  \r\n Next\tLine ', confidence: 0.9 });
  assert.equal(normalized.text, 'Hello World\nNext Line');
  assert.equal(normalized.confidence, 0.9);

  assert.equal(stableExtract({ text: 'ok', confidence: -5 }).confidence, 0);
  assert.equal(stableExtract({ text: 'ok', confidence: 5 }).confidence, 0.05);
  assert.equal(stableExtract({ text: 'ok', confidence: 500 }).confidence, 1);
  assert.equal(stableExtract({ text: 'ok', confidence: Number.NaN }).confidence, 0);

  const circular = { text: 'safe', confidence: 0.5 };
  circular.self = circular;
  assert.ok(stableExtract(circular).warnings.includes('invalid_json_structure'));

  const repeatA = stableExtract({ text: ' repeat  me ', confidence: 0.4 });
  const repeatB = stableExtract({ text: ' repeat  me ', confidence: 0.4 });
  assert.deepEqual(repeatA, repeatB);

  const confidenceTests = await runConfidenceStabilityTests();

  return {
    ok: true,
    tests: [
      'Malformed block fallback',
      'Text normalization',
      'Confidence clamp',
      'Circular input warning',
      'Deterministic output',
      ...confidenceTests.tests
    ]
  };
}