export function extractMetadataFromBody(body = {}) {
  const { vendor, date, amount } = body;
  const amountText = typeof amount === 'string' ? amount.trim() : amount;
  const parsedAmount =
    typeof amountText === 'number'
      ? amountText
      : amountText === '' || amountText === null || amountText === undefined
        ? null
        : Number(amountText);

  return {
    vendor: vendor ? String(vendor) : null,
    date: date ? String(date) : null,
    amount: Number.isFinite(parsedAmount) ? parsedAmount : null
  };
}
