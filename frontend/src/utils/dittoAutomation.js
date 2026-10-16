import { addTagToReceipt, getTagsForReceipt } from './tags.js';

function getAmount(receipt) {
  const amount = Number(String(receipt.amount ?? '').replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function receiptText(receipt) {
  const metadata = typeof receipt.raw_metadata === 'string'
    ? receipt.raw_metadata
    : JSON.stringify(receipt.raw_metadata ?? '');
  return `${receipt.filename ?? ''} ${receipt.vendor ?? ''} ${metadata}`.toLowerCase();
}

function addReceiptTags(receipt, newTags) {
  const tags = new Set([
    ...getTagsForReceipt(receipt.id),
    ...(Array.isArray(receipt.tags) ? receipt.tags : [])
  ]);

  newTags.filter(Boolean).forEach((tag) => {
    tags.add(tag);
    addTagToReceipt(receipt.id, tag);
  });

  return { ...receipt, tags: [...tags] };
}

export function autoTagReceipts(receipts, clusters = {}, patterns = {}) {
  const currentYear = String(new Date().getFullYear());
  const recurringVendors = new Set(
    (patterns.recurringVendors || []).map((entry) => String(entry.vendor).toLowerCase())
  );

  return receipts.map((receipt) => {
    const amount = getAmount(receipt) ?? 0;
    const vendor = String(receipt.vendor ?? '').trim();
    const text = receiptText(receipt);
    const tags = [];

    if (clusters['High Value'] && amount > 200) tags.push('High Value');
    if (clusters['Amazon Purchases'] && /amazon|amzn/.test(text)) tags.push('Amazon');
    if (clusters['This Year'] && receipt.date?.startsWith(currentYear)) tags.push('This Year');
    if (vendor && recurringVendors.has(vendor.toLowerCase())) tags.push(`Recurring: ${vendor}`);

    return addReceiptTags(receipt, tags);
  });
}

export function autoInferVendors(receipts, vendorHints = []) {
  const hints = new Map(vendorHints.map((hint) => [String(hint.id), hint.vendor]));
  return receipts.map((receipt) => {
    const inferredVendor = hints.get(String(receipt.id));
    return inferredVendor && !String(receipt.vendor ?? '').trim()
      ? { ...receipt, vendor: inferredVendor }
      : receipt;
  });
}

export function autoGroupReceipts(receipts, intel) {
  const grouped = autoTagReceipts(receipts, intel?.clusters, intel?.patterns);
  const vendorHints = new Map((intel?.vendorHints || []).map((hint) => [String(hint.id), hint]));

  return grouped.map((receipt) => {
    const groupTags = [];
    const vendorHint = vendorHints.get(String(receipt.id));
    if (vendorHint) groupTags.push(`Group: ${vendorHint.vendor}`);
    return addReceiptTags(receipt, groupTags);
  });
}

export function autoCreateViews(receipts) {
  const views = [];
  const highValue = receipts.filter((receipt) => (getAmount(receipt) ?? 0) > 200);
  if (highValue.length >= 5) {
    views.push({
      name: 'High Value Purchases',
      state: { search: '', sortField: 'amount', sortDir: 'desc', tagFilter: 'High Value', page: 1 }
    });
  }

  const amazon = receipts.filter((receipt) => /amazon|amzn/i.test(receiptText(receipt)));
  if (amazon.length >= 5) {
    views.push({
      name: 'Amazon Purchases',
      state: { search: 'amazon', sortField: 'date', sortDir: 'desc', tagFilter: '', page: 1 }
    });
  }

  return views;
}

export function getDuplicateReceiptIds(receipts) {
  const seen = new Set();
  const duplicateIds = [];

  receipts.forEach((receipt) => {
    const filename = String(receipt.filename ?? '').trim().toLowerCase();
    const metadata = typeof receipt.raw_metadata === 'string'
      ? receipt.raw_metadata.trim().toLowerCase()
      : JSON.stringify(receipt.raw_metadata ?? '').toLowerCase();
    if (!filename && !metadata) return;

    const key = [
      filename,
      receipt.date || '',
      getAmount(receipt) ?? '',
      String(receipt.vendor ?? '').trim().toLowerCase(),
      metadata
    ].join('|');
    if (seen.has(key)) duplicateIds.push(receipt.id);
    else seen.add(key);
  });

  return duplicateIds;
}

export function autoRemoveDuplicates(receipts) {
  const duplicateIds = new Set(getDuplicateReceiptIds(receipts).map(String));
  return receipts.filter((receipt) => !duplicateIds.has(String(receipt.id)));
}