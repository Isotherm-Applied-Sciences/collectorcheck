function extractRawConfidence(input) {
  if (typeof input === 'number' || typeof input === 'string') return input;
  if (!input || typeof input !== 'object') return undefined;

  try {
    if ('confidence' in input) return input.confidence;
    if ('score' in input) return input.score;
    if ('value' in input) return input.value;
  } catch {
    return undefined;
  }

  return undefined;
}

function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

export function stableConfidence(input) {
  if (input === null || input === undefined) {
    return { confidence: 0, warnings: ['missing_confidence'] };
  }

  const warnings = [];
  const raw = extractRawConfidence(input);
  if (raw === null || raw === undefined) warnings.push('missing_confidence');
  if (typeof raw === 'string') warnings.push('string_confidence_normalized');

  let numeric;
  try {
    numeric = Number(raw);
  } catch {
    numeric = Number.NaN;
  }

  if (!Number.isFinite(numeric)) warnings.push('non_numeric_confidence');
  const safe = Number.isFinite(numeric) ? numeric : 0;
  const normalized = safe > 1 ? safe / 100 : safe;
  const confidence = Math.max(0, Math.min(1, normalized));

  if (safeJSON(input) === null) warnings.push('invalid_json_structure');
  return { confidence, warnings };
}

export function stableAverage(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return { confidence: 0, warnings: ['empty_block_list'] };
  }

  const results = blocks.map(stableConfidence);
  const confidence = results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
  const warnings = [...new Set(results.flatMap(result => result.warnings))];

  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    warnings
  };
}