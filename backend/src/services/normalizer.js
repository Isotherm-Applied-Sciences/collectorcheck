const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeDate(value) {
  if (typeof value !== 'string' || !ISO_DATE_PATTERN.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return null;
  }

  return value;
}

export function normalizeMetadata({ vendor, date, amount } = {}) {
  const normalizedVendor = typeof vendor === 'string' && vendor.trim() !== ''
    ? vendor.trim()
    : null;
  const normalizedDate = normalizeDate(date);
  const numericAmount = amount === null || amount === undefined || amount === ''
    ? null
    : Number(amount);
  const normalizedAmount = Number.isFinite(numericAmount) ? numericAmount : null;

  return {
    vendor: normalizedVendor,
    date: normalizedDate,
    amount: normalizedAmount
  };
}
