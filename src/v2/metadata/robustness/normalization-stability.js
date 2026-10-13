import { safeJSON, stableMetadata } from './extraction-stability.js';

export function stableNormalizeMetadata(fields) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
    return {
      normalized: {},
      warnings: ['non_object_metadata']
    };
  }

  if (safeJSON(fields) === null) {
    return {
      normalized: {},
      warnings: ['invalid_json_structure']
    };
  }

  const stable = stableMetadata(fields);
  if (!stable.ok) {
    return {
      normalized: {},
      warnings: [stable.error === 'Invalid JSON metadata structure' ? 'invalid_json_structure' : 'non_object_metadata']
    };
  }

  const warnings = [...(stable.warnings || [])];
  const normalized = normalizeValue(stable.metadata, warnings);

  return {
    normalized,
    warnings: [...new Set(warnings)]
  };
}

function normalizeValue(value, warnings) {
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (normalized !== value) warnings.push('whitespace_collapsed');
    return normalized;
  }
  if (Array.isArray(value)) return value.map(item => normalizeValue(item, warnings));
  if (value && typeof value === 'object') {
    const normalized = {};
    for (const key of Object.keys(value).sort()) {
      normalized[key] = normalizeValue(value[key], warnings);
    }
    return normalized;
  }
  return value;
}