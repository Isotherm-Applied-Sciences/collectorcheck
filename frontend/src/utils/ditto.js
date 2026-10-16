const KEY = 'collectorcheck_ditto_state';

function defaultState() {
  return {
    visit: 1,
    enabled: true,
    skipped: false,
    lastShown: null,
    onboardingComplete: false
  };
}

export function getDittoState() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
      return defaultState();
    }

    const visit = Number.isInteger(stored.visit)
      ? Math.min(5, Math.max(1, stored.visit))
      : 1;

    return {
      visit,
      enabled: typeof stored.enabled === 'boolean' ? stored.enabled : true,
      skipped: typeof stored.skipped === 'boolean' ? stored.skipped : false,
      lastShown: typeof stored.lastShown === 'string' ? stored.lastShown : null,
      onboardingComplete: typeof stored.onboardingComplete === 'boolean'
        ? stored.onboardingComplete
        : false
    };
  } catch {
    return defaultState();
  }
}

export function saveDittoState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function advanceDittoVisit() {
  const state = getDittoState();
  if (state.visit < 5) {
    state.visit += 1;
  } else {
    state.onboardingComplete = true;
  }
  saveDittoState(state);
}

export function skipDitto() {
  const state = getDittoState();
  state.skipped = true;
  state.enabled = false;
  saveDittoState(state);
}

export function disableDitto() {
  const state = getDittoState();
  state.enabled = false;
  saveDittoState(state);
}

export function enableDitto() {
  const state = getDittoState();
  state.enabled = true;
  state.skipped = false;
  saveDittoState(state);
}

export function markDittoShown() {
  const state = getDittoState();
  state.lastShown = new Date().toISOString();
  saveDittoState(state);
}

export function resetDitto() {
  const state = defaultState();
  saveDittoState(state);
  return state;
}

export function resetQuietMode() {
  const state = getDittoState();
  state.onboardingComplete = false;
  saveDittoState(state);
  return state;
}

export function resetSkip() {
  const state = getDittoState();
  state.skipped = false;
  saveDittoState(state);
  return state;
}

export function resetVisitCounter() {
  const state = getDittoState();
  state.visit = 1;
  saveDittoState(state);
  return state;
}