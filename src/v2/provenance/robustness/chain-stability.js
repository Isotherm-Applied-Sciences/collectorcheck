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

function stableString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function compareSegments(left, right) {
  for (const key of ['id', 'parent', 'timestamp', 'sortKey']) {
    if (left[key] < right[key]) return -1;
    if (left[key] > right[key]) return 1;
  }
  return 0;
}

export function stableProvenanceChain(chain) {
  if (!Array.isArray(chain)) {
    return { chain: [], warnings: ['non_array_chain'] };
  }

  if (safeJSON(chain) === null) {
    return { chain: [], warnings: ['invalid_json_structure'] };
  }

  const warnings = [];
  const normalized = [];

  for (const segment of chain) {
    if (!segment || typeof segment !== 'object' || Array.isArray(segment)) {
      warnings.push('malformed_segment');
      continue;
    }

    const canonicalRaw = canonicalize(segment);
    const rawString = JSON.stringify(canonicalRaw);
    const idValue = segment.id ?? segment.segmentId ?? segment.hash;
    const parentValue = segment.parent ?? segment.parentId ?? segment.previousId;
    const timestampValue = segment.timestamp ?? segment.createdAt ?? segment.generatedAt;
    const id = stableString(typeof idValue === 'number' && Number.isFinite(idValue) ? String(idValue) : idValue);
    const parent = stableString(typeof parentValue === 'number' && Number.isFinite(parentValue) ? String(parentValue) : parentValue);
    const timestamp = stableString(timestampValue);

    if (!id) warnings.push('missing_id');
    if (!timestamp) warnings.push(`missing_timestamp_${id || 'unknown'}`);

    normalized.push({ id, parent, timestamp, raw: canonicalRaw, sortKey: rawString });
  }

  normalized.sort(compareSegments);

  const unique = [];
  const byId = new Map();
  for (const segment of normalized) {
    if (segment.id && byId.has(segment.id)) {
      warnings.push(`duplicate_id_${segment.id}`);
      continue;
    }
    unique.push(segment);
    if (segment.id) byId.set(segment.id, segment);
  }

  const state = new Map();
  const path = [];
  const cycleIds = new Set();
  const ordered = [];

  function visit(segment) {
    const id = segment.id;
    if (!id) {
      ordered.push(segment);
      return;
    }

    const currentState = state.get(id);
    if (currentState === 2) return;
    if (currentState === 1) {
      const cycleStart = path.indexOf(id);
      for (const cycleId of path.slice(cycleStart)) cycleIds.add(cycleId);
      warnings.push(`circular_reference_${id}`);
      return;
    }

    state.set(id, 1);
    path.push(id);
    const parent = segment.parent ? byId.get(segment.parent) : null;
    if (parent) visit(parent);
    path.pop();
    state.set(id, 2);
    ordered.push(segment);
  }

  for (const segment of unique) visit(segment);

  const result = ordered.filter(segment => !segment.id || !cycleIds.has(segment.id));
  const resultIds = new Set(result.map(segment => segment.id).filter(Boolean));
  for (const segment of result) {
    if (segment.parent && !resultIds.has(segment.parent)) {
      warnings.push(`missing_parent_${segment.parent}`);
    }
  }

  return {
    chain: result.map(({ sortKey: _sortKey, ...segment }) => segment),
    warnings: [...new Set(warnings)].sort()
  };
}