const KEY = 'collectorcheck_views';

export function getViews() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return stored && typeof stored === 'object' && !Array.isArray(stored)
      ? stored
      : {};
  } catch {
    return {};
  }
}

export function saveViews(views) {
  localStorage.setItem(KEY, JSON.stringify(views));
}

export function saveView(name, state) {
  const normalizedName = String(name ?? '').trim();
  if (!normalizedName) return;

  const views = getViews();
  views[normalizedName] = state;
  saveViews(views);
}

export function deleteView(name) {
  const views = getViews();
  delete views[name];
  saveViews(views);
}

export function loadView(name) {
  const view = getViews()[name];
  return view && typeof view === 'object' && !Array.isArray(view)
    ? view
    : null;
}