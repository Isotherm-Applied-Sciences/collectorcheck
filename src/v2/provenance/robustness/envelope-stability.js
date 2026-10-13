import { stableProvenanceChain } from './chain-stability.js';

const requiredFields = ['document_id', 'source', 'created_at', 'chain'];

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

function hasRootCycle(envelope) {
  for (const key of Object.keys(envelope)) {
    if (referencesRoot(envelope[key], envelope)) return true;
  }
  return false;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = canonicalize(value[key]);
    return result;
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

function invalidEnvelope(warning) {
  return { envelope: {}, chain: [], warnings: [warning] };
}

export function stableEnvelope(envelope) {
  if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) {
    return invalidEnvelope('malformed_envelope');
  }

  try {
    if (hasRootCycle(envelope)) return invalidEnvelope('invalid_json_structure');
  } catch {
    return invalidEnvelope('invalid_json_structure');
  }

  const fields = {};
  const warnings = [];
  let chainInput = [];

  for (const key of requiredFields) {
    if (!Object.hasOwn(envelope, key)) {
      warnings.push(`missing_required_field_${key}`);
      fields[key] = key === 'chain' ? [] : '';
    } else if (key === 'chain') {
      chainInput = envelope.chain;
    } else {
      fields[key] = normalizeValue(envelope[key], key, warnings);
    }
  }

  const extraFields = Object.keys(envelope)
    .filter(key => !requiredFields.includes(key))
    .sort();
  for (const key of extraFields) {
    fields[key] = normalizeValue(envelope[key], key, warnings);
  }

  const chainResult = stableProvenanceChain(chainInput);
  fields.chain = chainResult.chain;
  warnings.push(...chainResult.warnings);

  return {
    envelope: fields,
    chain: chainResult.chain,
    warnings: [...new Set(warnings)]
  };
}