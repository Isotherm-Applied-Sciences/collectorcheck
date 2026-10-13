import assert from 'node:assert/strict';
import { stableCrossFields } from '../../../src/v2/metadata/robustness/crossfield-stability.js';

export async function runCrossFieldStabilityTests() {
  const vendorFromStore = stableCrossFields({ store_name: 'Walmart' });
  assert.equal(vendorFromStore.fields.vendor, 'Walmart');
  assert.ok(vendorFromStore.warnings.includes('vendor_reconstructed_from_store_name'));

  const storeFromVendor = stableCrossFields({ vendor: 'Target' });
  assert.equal(storeFromVendor.fields.store_name, 'Target');
  assert.ok(storeFromVendor.warnings.includes('store_name_reconstructed_from_vendor'));

  const vendorMismatch = stableCrossFields({ vendor: 'Costco', store_name: 'Walmart' });
  assert.ok(vendorMismatch.warnings.includes('vendor_store_mismatch'));

  const purchaseDate = stableCrossFields({ transaction_date: '2024-01-01' });
  assert.equal(purchaseDate.fields.purchase_date, '2024-01-01');
  assert.ok(purchaseDate.warnings.includes('purchase_date_reconstructed_from_transaction_date'));

  const dateMismatch = stableCrossFields({
    purchase_date: '2024-01-01',
    transaction_date: '2024-01-02'
  });
  assert.ok(dateMismatch.warnings.includes('date_mismatch'));

  const reconstructedTotal = stableCrossFields({ subtotal: 10, tax: 2 });
  assert.equal(reconstructedTotal.fields.total, 12);
  assert.ok(reconstructedTotal.warnings.includes('total_reconstructed_from_subtotal_plus_tax'));

  const mismatchTotal = stableCrossFields({ subtotal: 10, tax: 2, total: 20 });
  assert.ok(mismatchTotal.warnings.includes('total_mismatch_subtotal_plus_tax'));

  const invalid = stableCrossFields(null);
  assert.deepEqual(invalid.fields, {});

  return {
    ok: true,
    tests: [
      'Vendor/store reconstruction and mismatch',
      'Purchase/transaction date reconstruction and mismatch',
      'Total reconstruction and mismatch',
      'Malformed cross-field input handling'
    ]
  };
}