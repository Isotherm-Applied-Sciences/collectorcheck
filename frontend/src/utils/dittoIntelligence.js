import { getDittoMemory } from './dittoMemory.js';

function getAmount(receipt) {
  const amount = Number(String(receipt.amount ?? '').replace(/[$,]/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function getReceiptText(receipt) {
  const metadata = receipt.raw_metadata;
  let metadataText = '';
  if (typeof metadata === 'string') metadataText = metadata;
  else if (metadata && typeof metadata === 'object') metadataText = JSON.stringify(metadata);

  return [receipt.text, metadataText, receipt.filename]
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toUpperCase();
}

export function clusterTags(receipts) {
  const clusters = {};
  const currentYear = String(new Date().getFullYear());

  receipts.forEach((receipt) => {
    const amount = getAmount(receipt) ?? 0;
    const text = getReceiptText(receipt);

    if (amount > 200) clusters['High Value'] = (clusters['High Value'] || 0) + 1;
    if (text.includes('AMAZON') || text.includes('AMZN')) {
      clusters['Amazon Purchases'] = (clusters['Amazon Purchases'] || 0) + 1;
    }
    if (receipt.date && receipt.date.startsWith(currentYear)) {
      clusters['This Year'] = (clusters['This Year'] || 0) + 1;
    }
  });

  return clusters;
}

export function inferVendors(receipts) {
  const vendorPatterns = [
    { pattern: /\bWAL[\s-]?MART\b/, vendor: 'Walmart' },
    { pattern: /\bCOSTCO\b/, vendor: 'Costco' },
    { pattern: /\bAMZN\b|\bAMAZON\b/, vendor: 'Amazon' },
    { pattern: /\bTARGET\b/, vendor: 'Target' },
    { pattern: /\bSTARBUCKS\b/, vendor: 'Starbucks' },
    { pattern: /\bCVS\b/, vendor: 'CVS' },
    { pattern: /\bWALGREENS\b/, vendor: 'Walgreens' }
  ];
  const corrections = Object.entries(getDittoMemory().vendorCorrections || {})
    .map(([pattern, vendor]) => [pattern.toLowerCase(), String(vendor)]);

  return receipts.flatMap((receipt) => {
    const text = getReceiptText(receipt);
    const existingVendor = String(receipt.vendor ?? '').trim().toLowerCase();
    const correction = corrections.find(([pattern]) =>
      existingVendor === pattern || text.toLowerCase().includes(pattern)
    );
    if (correction) {
      return existingVendor === correction[1].toLowerCase()
        ? []
        : [{ id: receipt.id, vendor: correction[1] }];
    }
    if (existingVendor) return [];
    const match = vendorPatterns.find(({ pattern }) => pattern.test(text));
    return match ? [{ id: receipt.id, vendor: match.vendor }] : [];
  });
}

export function detectSpendingPatterns(receipts) {
  const monthly = {};
  const vendorMonths = new Map();

  receipts.forEach((receipt) => {
    if (typeof receipt.date !== 'string' || !/^\d{4}-\d{2}/.test(receipt.date)) return;
    const month = receipt.date.slice(0, 7);
    const amount = getAmount(receipt) ?? 0;
    monthly[month] = (monthly[month] || 0) + amount;

    const vendor = String(receipt.vendor ?? '').trim().toLowerCase();
    if (!vendor) return;
    const months = vendorMonths.get(vendor) || new Set();
    months.add(month);
    vendorMonths.set(vendor, months);
  });

  const recurringVendors = [...vendorMonths.entries()]
    .filter(([, months]) => months.size >= 2)
    .map(([vendor, months]) => ({ vendor, months: [...months].sort() }));
  const sortedMonths = Object.keys(monthly).sort();
  const monthOverMonth = sortedMonths.slice(1).flatMap((month, index) => {
    const previousMonth = sortedMonths[index];
    const previousTotal = monthly[previousMonth];
    if (previousTotal <= 0) return [];
    return [{
      month,
      previousMonth,
      percentChange: ((monthly[month] - previousTotal) / previousTotal) * 100
    }];
  });

  return { monthly, recurringVendors, monthOverMonth };
}

export function detectAnomalies(receipts) {
  const anomalies = [];
  const duplicateGroups = new Map();

  receipts.forEach((receipt) => {
    const amount = getAmount(receipt);
    if (amount !== null && amount > 2000) {
      anomalies.push({ id: receipt.id, type: 'large', amount });
    }
    if (amount !== null && amount < 1) {
      anomalies.push({ id: receipt.id, type: 'suspicious', amount });
    }

    const filename = String(receipt.filename ?? '').trim().toLowerCase();
    const vendor = String(receipt.vendor ?? '').trim().toLowerCase();
    if (!filename && (!vendor || !receipt.date || amount === null)) return;
    const key = [filename, vendor, receipt.date || '', amount ?? ''].join('|');
    const matches = duplicateGroups.get(key) || [];
    matches.push(receipt.id);
    duplicateGroups.set(key, matches);
  });

  duplicateGroups.forEach((ids) => {
    if (ids.length > 1) anomalies.push({ ids, type: 'duplicate' });
  });

  return anomalies;
}

export function analyzeReceipts(receipts) {
  if (!Array.isArray(receipts) || receipts.length === 0) return {};

  return {
    clusters: clusterTags(receipts),
    vendorHints: inferVendors(receipts),
    anomalies: detectAnomalies(receipts),
    patterns: detectSpendingPatterns(receipts)
  };
}