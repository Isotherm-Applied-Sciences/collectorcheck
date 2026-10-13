import assert from 'node:assert/strict';
import { stableNormalize } from '../../../src/v2/ocr/robustness/normalization-stability.js';

export async function runNormalizationStabilityTests() {
  const nonString = stableNormalize(42);
  assert.equal(nonString.normalized, '');
  assert.ok(nonString.warnings.includes('non_string_input'));

  const invisible = stableNormalize('Hello\u200BWorld');
  assert.equal(invisible.normalized, 'Hello World');
  assert.ok(invisible.warnings.includes('invisible_characters_removed'));

  const whitespace = stableNormalize('Hello     World');
  assert.equal(whitespace.normalized, 'Hello World');
  assert.ok(whitespace.warnings.includes('whitespace_collapsed'));

  const unicode = stableNormalize('e\u0301');
  assert.equal(unicode.normalized, '\u00e9');

  const multiline = stableNormalize('Hello\n\nWorld');
  assert.equal(multiline.normalized, 'Hello World');

  assert.deepEqual(
    stableNormalize('  repeat\tthis  '),
    stableNormalize('  repeat\tthis  ')
  );

  return {
    ok: true,
    tests: [
      'Non-string input fallback',
      'Invisible character handling',
      'Whitespace collapse',
      'NFC Unicode normalization',
      'Multiline normalization',
      'Deterministic output'
    ]
  };
}