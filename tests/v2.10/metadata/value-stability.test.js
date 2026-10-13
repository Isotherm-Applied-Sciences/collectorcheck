import assert from 'node:assert/strict';
import { stableValue } from '../../../src/v2/metadata/robustness/value-stability.js';

export async function runMetadataValueStabilityTests() {
  const nullValue = stableValue(null);
  assert.equal(nullValue.value, '');
  assert.ok(nullValue.warnings.includes('null_or_undefined_value'));

  const undefinedValue = stableValue(undefined);
  assert.equal(undefinedValue.value, '');
  assert.ok(undefinedValue.warnings.includes('null_or_undefined_value'));

  assert.equal(stableValue('  Best    Buy  ').value, 'Best Buy');
  const empty = stableValue('   ');
  assert.equal(empty.value, '');
  assert.ok(empty.warnings.includes('empty_string'));

  assert.equal(stableValue(42).value, 42);
  assert.equal(stableValue(true).value, true);

  const nonFinite = stableValue(Infinity);
  assert.equal(nonFinite.value, '');
  assert.ok(nonFinite.warnings.includes('non_finite_number'));

  assert.deepEqual(stableValue([1, 2, 3]).value, [1, 2, 3]);
  const circularArray = [];
  circularArray.push(circularArray);
  const invalidArray = stableValue(circularArray);
  assert.equal(invalidArray.value, '');
  assert.ok(invalidArray.warnings.includes('invalid_array_structure'));

  assert.deepEqual(stableValue({ a: 1, b: 2 }).value, { a: 1, b: 2 });
  const circularObject = {};
  circularObject.self = circularObject;
  const invalidObject = stableValue(circularObject);
  assert.equal(invalidObject.value, '');
  assert.ok(invalidObject.warnings.includes('invalid_object_structure'));

  const symbolValue = stableValue(Symbol('x'));
  assert.equal(symbolValue.value, '');
  assert.ok(symbolValue.warnings.includes('unsupported_value_type'));

  return {
    ok: true,
    tests: [
      'Null and undefined fallback',
      'String whitespace normalization',
      'Finite and non-finite numbers',
      'Boolean preservation',
      'Array and object safety',
      'Unsupported type fallback'
    ]
  };
}