import assert from 'node:assert/strict';
import { stableMetadata } from '../../../src/v2/metadata/robustness/extraction-stability.js';

export async function runMetadataStabilityTests() {
  const malformed = stableMetadata(null);
  assert.deepEqual(malformed.metadata, null);
  assert.equal(malformed.ok, false);
  assert.ok(malformed.error);

  const circular = {};
  circular.self = circular;
  const invalid = stableMetadata(circular);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error, 'Invalid JSON metadata structure');

  const normalized = stableMetadata({
    Merchant: '  Superstore  ',
    Date: ' 2024-11-05 ',
    Total: 12.34,
    FileName: 'receipt.png',
    details: { StoreID: 5 }
  });
  assert.equal(normalized.ok, true);
  assert.equal(normalized.metadata.merchant, 'Superstore');
  assert.equal(normalized.metadata.date, '2024-11-05');
  assert.equal(normalized.metadata.total, 12.34);
  assert.equal(normalized.metadata.file_name, 'receipt.png');
  assert.deepEqual(normalized.metadata.details, { store_id: 5 });

  const missing = stableMetadata({ FileName: 'receipt.png' });
  assert.equal(missing.metadata.merchant, '');
  assert.equal(missing.metadata.date, '');
  assert.equal(missing.metadata.total, '');
  assert.ok(missing.warnings.includes('missing_merchant'));

  const nullValues = stableMetadata({ vendor: null, store: undefined });
  assert.equal(nullValues.metadata.vendor, '');
  assert.equal(nullValues.metadata.store, '');
  assert.ok(nullValues.warnings.includes('empty_or_invalid_vendor'));
  assert.ok(nullValues.warnings.includes('empty_or_invalid_store'));

  const collision = stableMetadata({ merchant: 'first', Merchant: 'second' });
  assert.equal(collision.metadata.merchant, 'second');
  assert.ok(collision.warnings.includes('normalized_key_collision_merchant'));

  return {
    ok: true,
    tests: [
      'Malformed metadata fallback',
      'Circular metadata rejection',
      'Key/value and nested-object normalization',
      'Required key defaults',
      'Null and undefined tolerance',
      'Deterministic normalized-key collision handling'
    ]
  };
}