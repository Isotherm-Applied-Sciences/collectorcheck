import assert from 'node:assert/strict';
import { stableNormalizeMetadata } from '../../../src/v2/metadata/robustness/normalization-stability.js';

export async function runMetadataNormalizationStabilityTests() {
  const nonObject = stableNormalizeMetadata(null);
  assert.deepEqual(nonObject.normalized, {});
  assert.ok(nonObject.warnings.includes('non_object_metadata'));

  const circular = {};
  circular.self = circular;
  const invalidJson = stableNormalizeMetadata(circular);
  assert.deepEqual(invalidJson.normalized, {});
  assert.ok(invalidJson.warnings.includes('invalid_json_structure'));

  const normalized = stableNormalizeMetadata({
    Merchant: '  Walmart  ',
    FileName: 'receipt.png',
    Vendor: 'Best    Buy',
    total: 42,
    verified: true,
    meta: { StoreID: '  17  ' }
  });
  assert.equal(normalized.normalized.merchant, 'Walmart');
  assert.equal(normalized.normalized.file_name, 'receipt.png');
  assert.equal(normalized.normalized.vendor, 'Best Buy');
  assert.equal(normalized.normalized.total, 42);
  assert.equal(normalized.normalized.verified, true);
  assert.deepEqual(normalized.normalized.meta, { store_id: '17' });
  assert.ok(normalized.warnings.includes('whitespace_collapsed'));

  const missingValues = stableNormalizeMetadata({ store: null, city: undefined });
  assert.equal(missingValues.normalized.store, '');
  assert.equal(missingValues.normalized.city, '');
  assert.ok(missingValues.warnings.includes('empty_or_invalid_store'));
  assert.ok(missingValues.warnings.includes('empty_or_invalid_city'));

  return {
    ok: true,
    tests: [
      'Malformed metadata fallback',
      'Circular metadata handling',
      'Key, whitespace, nested-value, number, and boolean normalization',
      'Null and undefined value handling'
    ]
  };
}