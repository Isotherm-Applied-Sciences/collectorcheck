export function createVendorModel(name, receipts) {
  return {
    name,
    count: receipts.length,
    total: receipts.reduce((sum, receipt) => sum + (Number(receipt.amount) || 0), 0)
  };
}