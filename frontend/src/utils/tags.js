const KEY = 'collectorcheck_tags';

export function getTags() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return stored && typeof stored === 'object' && !Array.isArray(stored)
      ? stored
      : {};
  } catch {
    return {};
  }
}

export function saveTags(tags) {
  localStorage.setItem(KEY, JSON.stringify(tags));
}

export function getTagsForReceipt(id) {
  const tags = getTags()[String(id)];
  return Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string') : [];
}

export function addTagToReceipt(id, tag) {
  const normalizedTag = String(tag ?? '').trim();
  if (!normalizedTag) return;

  const tags = getTags();
  const receiptTags = Array.isArray(tags[String(id)]) ? tags[String(id)] : [];
  if (!receiptTags.includes(normalizedTag)) {
    tags[String(id)] = [...receiptTags, normalizedTag];
    saveTags(tags);
  }
}

export function removeTagFromReceipt(id, tag) {
  const tags = getTags();
  const key = String(id);
  if (!Array.isArray(tags[key])) return;

  tags[key] = tags[key].filter((receiptTag) => receiptTag !== tag);
  if (tags[key].length === 0) delete tags[key];
  saveTags(tags);
}

export function removeTagsForReceipt(id) {
  const tags = getTags();
  delete tags[String(id)];
  saveTags(tags);
}

export function getAllTags() {
  const tags = getTags();
  const allTags = new Set();
  Object.values(tags).forEach((receiptTags) => {
    if (Array.isArray(receiptTags)) {
      receiptTags.forEach((tag) => {
        if (typeof tag === 'string' && tag.trim()) allTags.add(tag);
      });
    }
  });
  return Array.from(allTags).sort((a, b) => a.localeCompare(b));
}

export function getReceiptsByTag(receipts, tag) {
  return receipts.filter((receipt) =>
    getTagsForReceipt(receipt.id).includes(tag)
  );
}