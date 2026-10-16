const KEY = 'dittoMemory';

export function getDittoMemory() {
  try {
    const memory = JSON.parse(localStorage.getItem(KEY) || '{}');
    return memory && typeof memory === 'object' && !Array.isArray(memory)
      ? memory
      : {};
  } catch {
    return {};
  }
}

export function saveDittoMemory(memory) {
  localStorage.setItem(KEY, JSON.stringify(memory));
  window.dispatchEvent(new Event('ditto-memory-updated'));
}

export function updateDittoMemory(updates) {
  const memory = getDittoMemory();
  const updated = { ...memory, ...updates };
  saveDittoMemory(updated);
  return updated;
}

export function recordTagAdded(tagName) {
  const tag = String(tagName ?? '').trim();
  if (!tag) return getDittoMemory();
  const memory = getDittoMemory();
  const tagCounts = { ...(memory.tagCounts || {}) };
  const key = tag.toLowerCase();
  tagCounts[key] = (tagCounts[key] || 0) + 1;
  const updates = { tagCounts, lastTagAdded: tag };

  return updateDittoMemory(updates);
}

export function recordTagRemoved(tagName) {
  const tag = String(tagName ?? '').trim();
  if (!tag) return getDittoMemory();
  const memory = getDittoMemory();
  const tagRemovalCounts = { ...(memory.tagRemovalCounts || {}) };
  const key = tag.toLowerCase();
  tagRemovalCounts[key] = (tagRemovalCounts[key] || 0) + 1;
  return updateDittoMemory({ tagRemovalCounts, lastTagRemoved: tag });
}

export function recordVendorCorrection(pattern, vendor) {
  const normalizedPattern = String(pattern ?? '').trim();
  const normalizedVendor = String(vendor ?? '').trim();
  if (!normalizedPattern || !normalizedVendor) return getDittoMemory();

  const memory = getDittoMemory();
  const vendorCorrections = { ...(memory.vendorCorrections || {}) };
  vendorCorrections[normalizedPattern.toLowerCase()] = normalizedVendor;
  return updateDittoMemory({ vendorCorrections });
}

export function recordAutomationUsed(action) {
  const actionKeys = {
    'auto-tag': 'autoTagUsed',
    'auto-vendor': 'vendorInferenceUsed',
    'auto-views': 'autoViewsUsed',
    'auto-dedupe': 'dedupeUsed',
    'auto-group': 'autoGroupUsed',
    'auto-tag-high-value': 'autoTagUsed'
  };
  const memory = getDittoMemory();
  const actionCounts = { ...(memory.actionCounts || {}) };
  actionCounts[action] = (actionCounts[action] || 0) + 1;
  const updates = { actionCounts, lastAutomationAction: action };
  if (actionKeys[action]) updates[actionKeys[action]] = true;
  return updateDittoMemory(updates);
}

export function recordViewOpened(name) {
  const viewName = String(name ?? '').trim();
  if (!viewName) return getDittoMemory();
  const memory = getDittoMemory();
  const viewOpenCounts = { ...(memory.viewOpenCounts || {}) };
  viewOpenCounts[viewName] = (viewOpenCounts[viewName] || 0) + 1;
  return updateDittoMemory({ viewOpenCounts, lastViewOpened: viewName });
}