function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

function mergeWarnings(...warningLists) {
  return [...new Set(warningLists.flat())];
}

export function stableValue(value) {
  if (value === null || value === undefined) {
    return { value: '', warnings: ['null_or_undefined_value'] };
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    const warnings = [];
    if (normalized !== value) warnings.push('whitespace_collapsed');
    if (normalized === '') warnings.push('empty_string');
    return {
      value: normalized,
      warnings
    };
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? { value, warnings: [] }
      : { value: '', warnings: ['non_finite_number'] };
  }

  if (typeof value === 'boolean') return { value, warnings: [] };

  if (Array.isArray(value)) {
    if (safeJSON(value) === null) {
      return { value: '', warnings: ['invalid_array_structure'] };
    }

    try {
      const items = Array.from(value, item => stableValue(item));
      return {
        value: items.map(item => item.value),
        warnings: mergeWarnings(...items.map(item => item.warnings))
      };
    } catch {
      return { value: '', warnings: ['invalid_array_structure'] };
    }
  }

  if (typeof value === 'object') {
    if (safeJSON(value) === null) {
      return { value: '', warnings: ['invalid_object_structure'] };
    }

    try {
      const normalized = {};
      const entries = Object.keys(value).sort().map(key => [key, stableValue(value[key])]);
      for (const [key, result] of entries) normalized[key] = result.value;
      return {
        value: normalized,
        warnings: mergeWarnings(...entries.map(([, result]) => result.warnings))
      };
    } catch {
      return { value: '', warnings: ['invalid_object_structure'] };
    }
  }

  return { value: '', warnings: ['unsupported_value_type'] };
}