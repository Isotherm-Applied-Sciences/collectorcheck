function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

function nonNegativeNumber(value, key, warnings) {
  let numeric = value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    numeric = trimmed === '' ? Number.NaN : Number(trimmed);
  }

  if (typeof numeric !== 'number' || !Number.isFinite(numeric)) {
    warnings.push(typeof value === 'string' ? `invalid_string_number_${key}` : `non_finite_number_${key}`);
    return 0;
  }

  if (numeric < 0) {
    warnings.push(`negative_${key}_corrected`);
    return 0;
  }
  return numeric;
}

function normalizeRetryConfig(config) {
  const fields = {};
  const warnings = [];

  for (const key of ['attempts', 'delay_ms', 'max_delay_ms']) {
    if (!Object.hasOwn(config, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = 0;
      continue;
    }

    const numeric = nonNegativeNumber(config[key], key, warnings);
    fields[key] = key === 'attempts' ? Math.floor(numeric) : numeric;
    if (key === 'attempts' && fields[key] !== numeric) warnings.push('fractional_attempts_rounded_down');
  }

  if (fields.attempts > 10) {
    fields.attempts = 10;
    warnings.push('attempts_clamped_to_10');
  }

  if (fields.max_delay_ms < fields.delay_ms) {
    fields.max_delay_ms = fields.delay_ms;
    warnings.push('max_delay_less_than_delay_corrected');
  }

  return { fields, warnings: [...new Set(warnings)] };
}

export function stableRetryConfig(config) {
  const defaults = { attempts: 0, delay_ms: 0, max_delay_ms: 0 };
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { retry: defaults, warnings: ['malformed_retry_config'] };
  }

  if (safeJSON(config) === null) {
    return { retry: defaults, warnings: ['invalid_json_structure'] };
  }

  const normalized = normalizeRetryConfig(config);
  return { retry: normalized.fields, warnings: normalized.warnings };
}

export function stableBackoff(attempt, config) {
  const { retry } = stableRetryConfig(config);
  const numericAttempt = typeof attempt === 'number' ? attempt : Number(attempt);
  if (!Number.isFinite(numericAttempt) || numericAttempt < 0) return 0;

  const exponent = Math.floor(numericAttempt);
  if (retry.delay_ms === 0 || retry.max_delay_ms === 0) return 0;
  if (exponent > 1023) return retry.max_delay_ms;

  const delay = retry.delay_ms * (2 ** exponent);
  return Math.min(retry.max_delay_ms, Number.isFinite(delay) ? delay : retry.max_delay_ms);
}