function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

function referencesRoot(value, root, seen = new WeakSet()) {
  if (value === root) return true;
  if (!value || typeof value !== 'object' || seen.has(value)) return false;

  seen.add(value);
  for (const key of Object.keys(value)) {
    if (referencesRoot(value[key], root, seen)) return true;
  }
  return false;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const normalized = {};
    for (const key of Object.keys(value).sort()) normalized[key] = canonicalize(value[key]);
    return normalized;
  }
  return value;
}

function normalizeValue(value, key, warnings) {
  if (value === null || value === undefined) {
    warnings.push(`null_or_undefined_${key}`);
    return '';
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) warnings.push(`empty_string_${key}`);
    return normalized;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      warnings.push(`non_finite_number_${key}`);
      return '';
    }
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (typeof value === 'object') {
    if (safeJSON(value) === null) {
      warnings.push(`invalid_object_structure_${key}`);
      return '';
    }
    return canonicalize(value);
  }
  warnings.push(`unsupported_type_${key}`);
  return '';
}

function hasRootCycle(response) {
  for (const key of Object.keys(response)) {
    if (referencesRoot(response[key], response)) return true;
  }
  return false;
}

export function stableCloudResponse(response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    return { response: {}, warnings: ['malformed_response'] };
  }

  try {
    if (hasRootCycle(response)) {
      return { response: {}, warnings: ['invalid_json_structure'] };
    }
  } catch {
    return { response: {}, warnings: ['invalid_json_structure'] };
  }

  const fields = {};
  const warnings = [];
  for (const key of ['status', 'payload']) {
    if (!Object.hasOwn(response, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = '';
    } else {
      fields[key] = normalizeValue(response[key], key, warnings);
    }
  }

  for (const key of Object.keys(response).filter(key => !['status', 'payload'].includes(key)).sort()) {
    fields[key] = normalizeValue(response[key], key, warnings);
  }

  return { response: fields, warnings: [...new Set(warnings)] };
}