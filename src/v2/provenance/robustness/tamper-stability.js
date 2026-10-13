import crypto from 'node:crypto';

function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
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

function payloadFor(segment) {
  if (Object.hasOwn(segment, 'raw')) return segment.raw;
  const payload = {};
  for (const key of Object.keys(segment)) {
    if (!['hash', 'signature', 'public_key', 'publicKey'].includes(key)) payload[key] = segment[key];
  }
  return payload;
}

function computeHash(value) {
  const serialized = safeJSON(canonicalize(value));
  if (serialized === null) return null;
  return crypto.createHash('sha256').update(serialized, 'utf8').digest('hex');
}

function validateSignature(segment) {
  const publicKey = segment.public_key || segment.publicKey;
  if (typeof publicKey !== 'string' || typeof segment.signature !== 'string') return false;
  const serialized = safeJSON(canonicalize(payloadFor(segment)));
  if (serialized === null) return false;

  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(serialized, 'utf8');
    verifier.end();
    return verifier.verify(publicKey, Buffer.from(segment.signature, 'hex'));
  } catch {
    return false;
  }
}

function normalizeSegment(segment) {
  if (!segment || typeof segment !== 'object' || Array.isArray(segment)) return null;
  const idValue = segment.id ?? segment.segmentId;
  const parentValue = segment.parent ?? segment.parentId ?? segment.previousId;
  const timestampValue = segment.timestamp ?? segment.createdAt ?? segment.generatedAt;

  return {
    id: typeof idValue === 'string' ? idValue.trim() : '',
    parent: typeof parentValue === 'string' ? parentValue.trim() : '',
    timestamp: typeof timestampValue === 'string' ? timestampValue.trim() : '',
    original: segment
  };
}

function detectSegmentTampering(segment) {
  if (!segment || typeof segment !== 'object' || Array.isArray(segment)) {
    return ['malformed_segment'];
  }
  if (safeJSON(segment) === null) return ['invalid_segment_json'];

  const normalized = normalizeSegment(segment);
  const warnings = [];
  if (!normalized.id) warnings.push('missing_or_invalid_id');
  if (!normalized.timestamp) {
    warnings.push(`missing_or_invalid_timestamp_${normalized.id || 'unknown'}`);
  } else if (Number.isNaN(Date.parse(normalized.timestamp))) {
    warnings.push(`invalid_timestamp_${normalized.id || 'unknown'}`);
  }

  if (segment.hash !== undefined && segment.hash !== null) {
    if (typeof segment.hash !== 'string' || !/^[a-f0-9]{64}$/i.test(segment.hash)) {
      warnings.push(`invalid_hash_${normalized.id || 'unknown'}`);
    } else if (computeHash(payloadFor(segment)) !== segment.hash.toLowerCase()) {
      warnings.push(`hash_mismatch_${normalized.id || 'unknown'}`);
    }
  }

  if (segment.signature !== undefined && segment.signature !== null && !validateSignature(segment)) {
    warnings.push(`signature_mismatch_${normalized.id || 'unknown'}`);
  }
  return warnings;
}

function detectChainTampering(segments) {
  const warnings = [];
  const byId = new Map();

  for (const segment of segments) {
    if (!segment.id) continue;
    if (byId.has(segment.id)) warnings.push(`duplicate_id_${segment.id}`);
    else byId.set(segment.id, segment);
  }

  for (const segment of segments) {
    if (segment.parent && !byId.has(segment.parent)) {
      warnings.push(`missing_parent_${segment.parent}`);
    }
  }

  const state = new Map();
  const stack = [];
  const reportedCycles = new Set();

  function visit(id) {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      const start = stack.indexOf(id);
      for (const cycleId of stack.slice(start)) reportedCycles.add(cycleId);
      return;
    }

    state.set(id, 1);
    stack.push(id);
    const parent = byId.get(id)?.parent;
    if (parent && byId.has(parent)) visit(parent);
    stack.pop();
    state.set(id, 2);
  }

  for (const id of [...byId.keys()].sort()) visit(id);
  for (const id of [...reportedCycles].sort()) warnings.push(`circular_parent_chain_${id}`);

  let previousTimestamp = null;
  for (const segment of segments) {
    const timestamp = Date.parse(segment.timestamp);
    if (Number.isNaN(timestamp)) continue;
    if (previousTimestamp && timestamp < previousTimestamp.value) {
      warnings.push(`timestamp_out_of_order_${segment.id || 'unknown'}`);
    }
    previousTimestamp = { value: timestamp };
  }

  return warnings;
}

export function stableTamperDetection(chain) {
  if (!Array.isArray(chain)) {
    return { tampered: true, warnings: ['non_array_chain'] };
  }

  if (safeJSON(chain) === null) {
    return { tampered: true, warnings: ['invalid_json_structure'] };
  }

  const warnings = [];
  const segments = [];
  for (const segment of chain) {
    warnings.push(...detectSegmentTampering(segment));
    const normalized = normalizeSegment(segment);
    if (normalized) segments.push(normalized);
  }
  warnings.push(...detectChainTampering(segments));

  const stableWarnings = [...new Set(warnings)].sort();
  return {
    tampered: stableWarnings.length > 0,
    warnings: stableWarnings
  };
}