import { listReceipts } from '../utils/db.js';
import { createVendorModel } from '../models/vendor.js';
import { createReceiptModel } from '../models/receipt.js';

export async function listVendors(request, response, next) {
  try {
    const receipts = await listReceipts();
    const groups = groupByVendor(receipts);
    return response.json([...groups.entries()].map(([name, vendorReceipts]) =>
      createVendorModel(name, vendorReceipts)
    ));
  } catch (error) {
    return next(error);
  }
}

export async function getVendor(request, response, next) {
  try {
    const receipts = await listReceipts();
    const name = request.params.name;
    const matches = receipts.filter((receipt) =>
      (String(receipt.vendor ?? '').trim() || '(none)').toLowerCase() === name.toLowerCase()
    );
    if (matches.length === 0) return response.status(404).json({ error: 'Vendor not found.' });
    return response.json(matches.map(createReceiptModel));
  } catch (error) {
    return next(error);
  }
}

function groupByVendor(receipts) {
  const groups = new Map();
  receipts.forEach((receipt) => {
    const name = String(receipt.vendor ?? '').trim() || '(none)';
    const group = groups.get(name) || [];
    group.push(receipt);
    groups.set(name, group);
  });
  return groups;
}