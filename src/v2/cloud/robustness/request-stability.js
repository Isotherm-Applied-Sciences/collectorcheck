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

function stableValue(value, key, warnings) {
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
    const serialized = safeJSON(value);
    if (serialized === null) {
      warnings.push(`invalid_object_structure_${key}`);
      return '';
    }
    return canonicalize(JSON.parse(serialized));
  }

  warnings.push(`unsupported_type_${key}`);
  return '';
}

export function stableCloudRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    return { request: {}, warnings: ['malformed_request'] };
  }

  try {
    if (Object.keys(request).some(key => referencesRoot(request[key], request))) {
      return { request: {}, warnings: ['invalid_json_structure'] };
    }
  } catch {
    return { request: {}, warnings: ['invalid_json_structure'] };
  }

  const fields = {};
  const warnings = [];
  const required = ['endpoint', 'payload', 'method'];

  for (const key of required) {
    if (!Object.hasOwn(request, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = '';
    } else {
      fields[key] = stableValue(request[key], key, warnings);
    }
  }

  for (const key of Object.keys(request).filter(key => !required.includes(key)).sort()) {
    fields[key] = stableValue(request[key], key, warnings);
  }

  return { request: fields, warnings: [...new Set(warnings)] };
}