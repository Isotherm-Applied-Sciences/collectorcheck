import { normalizeMetadata } from '../services/normalizer.js';

function normalizeVendor(rawVendor) {
  if (typeof rawVendor !== 'string' || !rawVendor.trim()) return '';

  const cleaned = rawVendor
    .normalize('NFKD')
    .replace(/[^\w\s]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (cleaned.includes('mcdonald')) return "McDonald's";
  if (cleaned.includes('tim hortons')) return 'Tim Hortons';
  if (cleaned.includes('starbucks')) return 'Starbucks';
  if (cleaned.includes('costco')) return 'Costco';
  if (cleaned.includes('walmart') || cleaned.includes('walmrt')) return 'Walmart';
  if (cleaned.includes('amazon') || cleaned.includes('amzn')) return 'Amazon';

  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function validDate(year, month, day) {
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return null;
  }
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function normalizeDate(rawDate) {
  if (rawDate instanceof Date && Number.isFinite(rawDate.getTime())) {
    return validDate(rawDate.getUTCFullYear(), rawDate.getUTCMonth() + 1, rawDate.getUTCDate());
  }
  if (typeof rawDate !== 'string' || !rawDate.trim()) return null;

  const value = rawDate.trim();
  let match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) return validDate(Number(match[1]), Number(match[2]), Number(match[3]));

  match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) return validDate(Number(match[3]), Number(match[1]), Number(match[2]));

  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return validDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, parsed.getUTCDate());
}

function normalizeAmount(rawAmount) {
  if (typeof rawAmount === 'number') return Number.isFinite(rawAmount) ? rawAmount : 0;
  if (rawAmount === null || rawAmount === undefined || String(rawAmount).trim() === '') return 0;

  const source = String(rawAmount).trim();
  const isParenthesizedNegative = /^\(.*\)$/.test(source);
  const cleaned = source.replace(/[^0-9.]/g, '');
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return 0;
  return isParenthesizedNegative || /^\s*-/.test(source) ? -value : value;
}

function normalizeReceipt(ocrResult = {}) {
  return {
    vendor: normalizeVendor(ocrResult.vendor),
    date: normalizeDate(ocrResult.date),
    amount: normalizeAmount(ocrResult.amount),
    tags: Array.isArray(ocrResult.tags) ? [...new Set(ocrResult.tags.map(String))] : [],
    notes: typeof ocrResult.notes === 'string' ? ocrResult.notes : '',
    imageUrl: typeof ocrResult.imageUrl === 'string' ? ocrResult.imageUrl : ''
  };
}

export {
  normalizeVendor,
  normalizeDate,
  normalizeAmount,
  normalizeReceipt,
  normalizeMetadata
};