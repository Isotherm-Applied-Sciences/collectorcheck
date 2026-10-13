function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

const DEFAULT_BREAKER = { state: 'closed', failures: 0, threshold: 5, reset_ms: 30000 };
const VALID_STATES = ['closed', 'open', 'half_open'];

function normalizeNumber(value, key, warnings) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const numeric = trimmed === '' ? Number.NaN : Number(trimmed);
    if (!Number.isFinite(numeric)) {
      warnings.push(`invalid_string_number_${key}`);
      return DEFAULT_BREAKER[key];
    }
    value = numeric;
  }

  if (value === null || value === undefined) {
    warnings.push(`null_or_undefined_${key}`);
    return DEFAULT_BREAKER[key];
  }

  if (typeof value !== 'number') {
    warnings.push(`unsupported_type_${key}`);
    return DEFAULT_BREAKER[key];
  }

  if (!Number.isFinite(value)) {
    warnings.push(`non_finite_number_${key}`);
    return DEFAULT_BREAKER[key];
  }

  if (value < 0) {
    warnings.push(`negative_${key}_corrected`);
    return 0;
  }

  if (value > Number.MAX_SAFE_INTEGER) {
    warnings.push(`${key}_clamped_to_max_safe_integer`);
    return Number.MAX_SAFE_INTEGER;
  }

  const integer = Math.floor(value);
  if (integer !== value) warnings.push(`fractional_${key}_rounded_down`);
  return integer;
}

function normalizeBreakerConfig(config) {
  const fields = {};
  const warnings = [];

  for (const key of ['state', 'failures', 'threshold', 'reset_ms']) {
    if (!Object.hasOwn(config, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = DEFAULT_BREAKER[key];
    } else if (key === 'state') {
      const value = config[key];
      if (value === null || value === undefined) {
        warnings.push(`null_or_undefined_${key}`);
        fields[key] = DEFAULT_BREAKER.state;
      } else if (typeof value !== 'string') {
        warnings.push(`invalid_state_type_${key}`);
        fields[key] = DEFAULT_BREAKER.state;
      } else {
        fields[key] = value.trim().toLowerCase();
      }
    } else {
      fields[key] = normalizeNumber(config[key], key, warnings);
    }
  }

  if (fields.failures > fields.threshold) {
    warnings.push('failures_exceed_threshold');
    fields.state = 'open';
  }

  if (!VALID_STATES.includes(fields.state)) {
    warnings.push('invalid_state_corrected');
    fields.state = DEFAULT_BREAKER.state;
  }

  if (fields.reset_ms < 1000) {
    warnings.push('reset_ms_too_small_corrected');
    fields.reset_ms = 1000;
  }

  return { fields, warnings: [...new Set(warnings)] };
}

export function stableCircuitBreaker(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { breaker: { ...DEFAULT_BREAKER }, warnings: ['malformed_breaker_config'] };
  }

  if (safeJSON(config) === null) {
    return { breaker: { ...DEFAULT_BREAKER }, warnings: ['invalid_json_structure'] };
  }

  try {
    const normalized = normalizeBreakerConfig(config);
    return { breaker: normalized.fields, warnings: normalized.warnings };
  } catch {
    return { breaker: { ...DEFAULT_BREAKER }, warnings: ['invalid_json_structure'] };
  }
}

export function stableBreakerTransition(config, event) {
  const { breaker } = stableCircuitBreaker(config);

  if (event === 'success') return { state: 'closed', failures: 0 };

  if (event === 'failure') {
    const failures = Math.min(Number.MAX_SAFE_INTEGER, breaker.failures + 1);
    return {
      state: failures >= breaker.threshold ? 'open' : 'half_open',
      failures
    };
  }

  return { state: breaker.state, failures: breaker.failures };
}