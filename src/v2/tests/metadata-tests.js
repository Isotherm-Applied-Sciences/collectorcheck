import assert from 'node:assert/strict';
import { extractMetadataFromText } from '../metadata/extract.js';
import { validateMetadataResult } from '../metadata/result.js';
import { runMetadataStabilityTests } from '../../../tests/v2.10/metadata/extraction-stability.test.js';

export async function runMetadataTests() {
  const tests = [];
  const sample = '\n  SUPERSTORE\n  2024-11-05\n  Total: $12.34\n';
  const result = extractMetadataFromText(sample);

  assert.equal(result.ok, true);
  assert.equal(result.metadata.merchant, 'SUPERSTORE');
  assert.equal(result.metadata.date, '2024-11-05');
  assert.equal(result.metadata.total, '12.34');
  assert.equal(validateMetadataResult(result), true);
  tests.push('Metadata extraction (merchant/date/total)');

  const invalid = extractMetadataFromText('');
  assert.equal(validateMetadataResult(invalid), true);
  assert.equal(invalid.ok, false);
  tests.push('Invalid OCR text returns a metadata error');

  const stability = await runMetadataStabilityTests();
  tests.push(...stability.tests);

  return { ok: true, tests };
}