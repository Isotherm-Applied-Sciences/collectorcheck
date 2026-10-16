export function createReceiptModel(receipt) {
  return {
    id: receipt.id,
    vendor: receipt.vendor ?? null,
    amount: Number.isFinite(Number(receipt.amount)) ? Number(receipt.amount) : null,
    date: receipt.date ?? null,
    tags: Array.isArray(receipt.tags) ? receipt.tags : [],
    filename: receipt.filename ?? '',
    imageUrl: receipt.imageUrl ?? (receipt.id ? `/api/receipts/file/${receipt.id}` : null),
    notes: receipt.notes ?? '',
    raw_metadata: receipt.raw_metadata ?? null,
    created_at: receipt.created_at ?? null
  };
}

export function validateReceipt(receipt) {
  return Boolean(receipt && typeof receipt.filename === 'string' && receipt.filename.trim());
}