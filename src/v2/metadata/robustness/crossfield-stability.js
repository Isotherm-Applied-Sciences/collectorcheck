import { stableNormalizeMetadata } from './normalization-stability.js';

export function stableCrossFields(fields) {
  const stable = stableNormalizeMetadata(fields);
  if (Object.keys(stable.normalized).length === 0 && stable.warnings.includes('non_object_metadata')) {
    return { fields: {}, warnings: stable.warnings };
  }

  const output = { ...stable.normalized };
  const warnings = [...stable.warnings];

  applyVendorStoreConsistency(output, warnings);
  applyDateConsistency(output, warnings);
  applyTotalConsistency(output, warnings);

  return { fields: output, warnings: [...new Set(warnings)] };
}

function applyVendorStoreConsistency(fields, warnings) {
  const vendor = typeof fields.vendor === 'string' ? fields.vendor : '';
  const storeName = typeof fields.store_name === 'string' ? fields.store_name : '';

  if (vendor && storeName && vendor !== storeName) {
    warnings.push('vendor_store_mismatch');
  } else if (!vendor && storeName) {
    fields.vendor = storeName;
    warnings.push('vendor_reconstructed_from_store_name');
  } else if (!storeName && vendor) {
    fields.store_name = vendor;
    warnings.push('store_name_reconstructed_from_vendor');
  }
}

function applyDateConsistency(fields, warnings) {
  const purchaseDate = typeof fields.purchase_date === 'string' ? fields.purchase_date : '';
  const transactionDate = typeof fields.transaction_date === 'string' ? fields.transaction_date : '';

  if (purchaseDate && transactionDate && purchaseDate !== transactionDate) {
    warnings.push('date_mismatch');
  } else if (!purchaseDate && transactionDate) {
    fields.purchase_date = transactionDate;
    warnings.push('purchase_date_reconstructed_from_transaction_date');
  } else if (!transactionDate && purchaseDate) {
    fields.transaction_date = purchaseDate;
    warnings.push('transaction_date_reconstructed_from_purchase_date');
  }
}

function parseAmount(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;

  const normalized = value.trim().replace(/[$,\s]/g, '');
  if (!/^[+-]?\d+(?:\.\d+)?$/.test(normalized)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function applyTotalConsistency(fields, warnings) {
  const total = parseAmount(fields.total);
  const subtotal = parseAmount(fields.subtotal);
  const tax = parseAmount(fields.tax);

  if (total !== null && subtotal !== null && tax !== null) {
    const computed = subtotal + tax;
    if (Math.abs(computed - total) > 0.01) {
      warnings.push('total_mismatch_subtotal_plus_tax');
    }
    return;
  }

  if (total === null && subtotal !== null && tax !== null) {
    fields.total = Math.round((subtotal + tax + Number.EPSILON) * 100) / 100;
    warnings.push('total_reconstructed_from_subtotal_plus_tax');
  }
}