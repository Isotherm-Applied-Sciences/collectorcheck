import assert from 'node:assert/strict';
import { mergeBlocks, stableBlocks } from '../../../src/v2/ocr/robustness/multiblock-stability.js';

export async function runMultiblockStabilityTests() {
  const invalidInput = stableBlocks(null);
  assert.deepEqual(invalidInput.blocks, []);
  assert.ok(invalidInput.warnings.includes('non_array_blocks'));

  const malformed = stableBlocks([null, undefined, 42]);
  assert.equal(malformed.blocks.length, 0);
  assert.ok(malformed.warnings.includes('malformed_ocr_block'));

  const input = [
    { index: 5, text: 'World', confidence: 0.9 },
    { index: 1, text: 'Hello', confidence: 0.8 }
  ];
  const ordered = stableBlocks(input);
  assert.equal(ordered.blocks[0].index, 1);
  assert.equal(ordered.blocks[1].index, 5);
  assert.deepEqual(ordered.blocks, stableBlocks([...input].reverse()).blocks);

  const merged = mergeBlocks(input);
  assert.equal(merged.text, 'Hello World');
  assert.ok(Math.abs(merged.confidence - 0.85) < Number.EPSILON * 2);
  assert.equal(merged.count, 2);

  const empty = mergeBlocks([]);
  assert.equal(empty.text, '');
  assert.equal(empty.confidence, 0);
  assert.equal(empty.count, 0);

  const malformedFields = stableBlocks([{ index: 'x', text: 123, confidence: 'abc' }]);
  assert.equal(malformedFields.blocks[0].index, 0);
  assert.equal(malformedFields.blocks[0].text, '');
  assert.equal(malformedFields.blocks[0].confidence, 0);

  return {
    ok: true,
    tests: [
      'Invalid block collections handled',
      'Malformed blocks filtered',
      'Block ordering deterministic',
      'Block merge deterministic',
      'Empty and malformed fields handled'
    ]
  };
}