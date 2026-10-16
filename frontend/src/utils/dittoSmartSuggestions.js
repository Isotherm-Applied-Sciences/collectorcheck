import { getTagsForReceipt } from './tags.js';

const STORAGE_KEY = 'collectorcheck_smart_suggestions';
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export function getDittoSmartSuggestion(receipts) {
  if (!Array.isArray(receipts) || receipts.length === 0) return null;

  const total = receipts.length;
  const untagged = receipts.filter((receipt) => {
    const tags = Array.isArray(receipt.tags)
      ? receipt.tags
      : getTagsForReceipt(receipt.id);
    return tags.length === 0;
  }).length;
  const noVendor = receipts.filter((receipt) =>
    !String(receipt.vendor ?? '').trim()
  ).length;
  const large = receipts.filter((receipt) => {
    const amount = Number(receipt.amount);
    return Number.isFinite(amount) && amount > 500;
  }).length;
  const today = new Date().toISOString().slice(0, 10);
  const newToday = receipts.filter((receipt) =>
    typeof receipt.date === 'string' && receipt.date.startsWith(today)
  ).length;

  if (untagged >= 10) {
    return {
      id: 'untagged-receipts',
      title: 'Lots of Untagged Receipts',
      message: `You have ${untagged} untagged receipts. Want help organizing them?`,
      action: 'help-organize'
    };
  }

  if (noVendor >= 5) {
    return {
      id: 'missing-vendor-info',
      title: 'Missing Vendor Info',
      message: `${noVendor} receipts don’t have vendor names. Want help filling them in?`,
      action: 'vendors'
    };
  }

  if (large >= 3) {
    return {
      id: 'large-purchases',
      title: 'Large Purchases',
      message: `You have ${large} receipts over $500. Want help organizing them with tags?`,
      action: 'help-organize'
    };
  }

  if (newToday >= 3) {
    return {
      id: 'new-receipts-today',
      title: 'New Receipts Today',
      message: `You added ${newToday} receipts today. Want help organizing them?`,
      action: 'help-organize'
    };
  }

  if (total >= 20 && untagged > 0) {
    return {
      id: 'large-untagged-collection',
      title: 'Big Upload',
      message: `You have ${total} receipts total. Want help tagging or sorting them?`,
      action: 'help-organize'
    };
  }

  return null;
}

export function shouldShowDittoSmartSuggestion(suggestion) {
  if (!suggestion?.id) return false;

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const seen = Array.isArray(stored.seen) ? stored.seen : [];
    const lastShownAt = Number(stored.lastShownAt) || 0;
    const now = Date.now();

    if (seen.includes(suggestion.id) || now - lastShownAt < COOLDOWN_MS) {
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lastShownAt: now,
      seen: [...seen, suggestion.id]
    }));
    return true;
  } catch {
    return true;
  }
}