import { metadataResult } from '../result.js';

export function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

export function stableMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return metadataResult(false, null, 'Malformed metadata input');
  }

  if (safeJSON(metadata) === null) {
    return metadataResult(false, null, 'Invalid JSON metadata structure');
  }

  const warnings = [];
  let fields;
  try {
    fields = normalizeFields(metadata, warnings);
  } catch (error) {
    return metadataResult(false, null, `Metadata normalization failed: ${error.message || error}`);
  }

  for (const field of ['merchant', 'date', 'total']) {
    if (!Object.hasOwn(fields, field)) {
      fields[field] = '';
      warnings.push(`missing_${field}`);
    }
  }

  return {
    ...metadataResult(true, fields, null),
    warnings: [...new Set(warnings)]
  };
}

function normalizeFields(metadata, warnings) {
  const fields = {};
  for (const key of Object.keys(metadata).sort()) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
      warnings.push('invalid_metadata_key');
      continue;
    }
    if (Object.hasOwn(fields, normalizedKey)) {
      warnings.push(`normalized_key_collision_${normalizedKey}`);
      continue;
    }

    fields[normalizedKey] = normalizeValue(metadata[key], normalizedKey, warnings);
  }
  return fields;
}

function normalizeKey(key) {
  return key
    .trim()
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
}

function normalizeValue(value, field, warnings) {
  if (value === null || value === undefined) {
    warnings.push(`empty_or_invalid_${field}`);
    return '';
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) warnings.push(`empty_or_invalid_${field}`);
    return normalized;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      warnings.push(`empty_or_invalid_${field}`);
      return '';
    }
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item, index) => normalizeNestedValue(item, `${field}_${index}`, warnings));
  if (typeof value === 'object') return normalizeNestedObject(value, field, warnings);

  warnings.push(`empty_or_invalid_${field}`);
  return '';
}

function normalizeNestedObject(value, field, warnings) {
  const normalized = {};
  for (const key of Object.keys(value).sort()) {
    const normalizedKey = normalizeKey(key);
    if (!normalizedKey) {
      warnings.push(`invalid_metadata_key_${field}`);
      continue;
    }
    if (Object.hasOwn(normalized, normalizedKey)) {
      warnings.push(`normalized_key_collision_${field}_${normalizedKey}`);
      continue;
    }
    normalized[normalizedKey] = normalizeNestedValue(value[key], `${field}_${normalizedKey}`, warnings);
  }
  return normalized;
}

function normalizeNestedValue(value, field, warnings) {
  if (value === null || value === undefined) {
    warnings.push(`empty_or_invalid_${field}`);
    return '';
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) warnings.push(`empty_or_invalid_${field}`);
    return normalized;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      warnings.push(`empty_or_invalid_${field}`);
      return '';
    }
    return value;
  }
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.map((item, index) => normalizeNestedValue(item, `${field}_${index}`, warnings));
  if (typeof value === 'object') return normalizeNestedObject(value, field, warnings);
  warnings.push(`empty_or_invalid_${field}`);
  return '';
}