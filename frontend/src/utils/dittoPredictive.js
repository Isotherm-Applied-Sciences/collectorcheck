export function parseDittoIntent(text) {
  const query = String(text ?? '').toLowerCase();
  if (/\b(tax|insurance|compliance)\b/.test(query)) return null;
  if (/duplicate|dedupe/.test(query)) return { action: 'auto-dedupe' };
  if (/tag|organize/.test(query)) return { action: 'auto-tag' };
  if (/vendor/.test(query)) return { action: 'auto-vendor' };
  if (/saved view|favorite view/.test(query)) return { action: 'views' };
  if (/timeline/.test(query)) return { action: 'timeline' };
  if (/stat|spending/.test(query)) return { action: 'stats' };
  if (/upload|receipt/.test(query)) return { action: 'scan-receipts' };
  return null;
}