import assert from 'node:assert/strict';
import { runSystemStability } from '../../../src/v2/integration/system-stability.js';

export async function runE2eSanityTests() {
  const output = runSystemStability({});
  assert.deepEqual(Object.keys(output), ['ocr', 'metadata', 'provenance', 'cloud', 'warnings']);
  assert.deepEqual(output, runSystemStability({}));

  return {
    ok: true,
    tests: [
      'Empty-input pipeline structure',
      'Deterministic end-to-end output'
    ]
  };
}