function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

const TIMEOUT_FIELDS = ['request_ms', 'connect_ms', 'overall_ms'];
const DEFAULT_TIMEOUT = { request_ms: 0, connect_ms: 0, overall_ms: 0 };

function normalizeValue(value, key, warnings) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const numeric = trimmed === '' ? Number.NaN : Number(trimmed);
    if (!Number.isFinite(numeric)) {
      warnings.push(`invalid_string_number_${key}`);
      return 0;
    }
    value = numeric;
  }

  if (value === null || value === undefined) {
    warnings.push(`null_or_undefined_${key}`);
    return 0;
  }

  if (typeof value !== 'number') {
    warnings.push(`unsupported_type_${key}`);
    return 0;
  }

  if (!Number.isFinite(value)) {
    warnings.push(`non_finite_number_${key}`);
    return 0;
  }

  if (value < 0) {
    warnings.push(`negative_timeout_corrected_${key}`);
    return 0;
  }

  if (value > Number.MAX_SAFE_INTEGER) {
    warnings.push(`timeout_clamped_to_max_safe_integer_${key}`);
    return Number.MAX_SAFE_INTEGER;
  }

  return value;
}

function normalizeTimeoutConfig(config) {
  const fields = {};
  const warnings = [];

  for (const key of TIMEOUT_FIELDS) {
    if (!Object.hasOwn(config, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = 0;
    } else {
      fields[key] = normalizeValue(config[key], key, warnings);
    }
  }

  const requiredOverall = Math.min(
    Number.MAX_SAFE_INTEGER,
    fields.request_ms + fields.connect_ms
  );
  if (fields.overall_ms < requiredOverall) {
    fields.overall_ms = requiredOverall;
    warnings.push('overall_timeout_too_small_corrected');
  }

  return { fields, warnings: [...new Set(warnings)] };
}

export function stableTimeoutConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { timeout: { ...DEFAULT_TIMEOUT }, warnings: ['malformed_timeout_config'] };
  }

  if (safeJSON(config) === null) {
    return { timeout: { ...DEFAULT_TIMEOUT }, warnings: ['invalid_json_structure'] };
  }

  try {
    const normalized = normalizeTimeoutConfig(config);
    return { timeout: normalized.fields, warnings: normalized.warnings };
  } catch {
    return { timeout: { ...DEFAULT_TIMEOUT }, warnings: ['invalid_json_structure'] };
  }
}