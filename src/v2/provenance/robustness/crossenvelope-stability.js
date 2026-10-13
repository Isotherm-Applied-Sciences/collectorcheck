import { stableEnvelope } from './envelope-stability.js';

function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

export function stableCrossEnvelopes(envelopes) {
  if (!Array.isArray(envelopes)) {
    return { envelopes: [], warnings: ['non_array_envelopes'] };
  }

  if (safeJSON(envelopes) === null) {
    return { envelopes: [], warnings: ['invalid_json_structure'] };
  }

  const inputChainOrders = envelopes.map(envelope => rawChainIds(envelope));
  const normalized = envelopes.map(envelope => stableEnvelope(envelope));
  const warnings = [];

  applySourceConsistency(normalized, warnings);
  applyDocumentIdConsistency(normalized, warnings);
  applyTimestampConsistency(normalized, warnings);
  applyChainConsistency(normalized, warnings, inputChainOrders);

  return {
    envelopes: normalized,
    warnings: [...new Set(warnings)].sort()
  };
}

function applySourceConsistency(envelopes, warnings) {
  const sources = new Set(
    envelopes.map(item => item.envelope.source).filter(source => typeof source === 'string' && source)
  );
  if (sources.size > 1) warnings.push('source_mismatch_across_envelopes');
}

function applyDocumentIdConsistency(envelopes, warnings) {
  const ids = [...new Set(
    envelopes.map(item => item.envelope.document_id)
      .filter(id => typeof id === 'string' && id)
  )].sort();

  if (ids.length > 1) warnings.push('document_id_mismatch_across_envelopes');
  const canonicalId = ids[0] || '';

  for (const item of envelopes) {
    if (!item.envelope.document_id && canonicalId) {
      item.envelope.document_id = canonicalId;
      warnings.push('document_id_reconstructed_across_envelopes');
    }
  }
}

function applyTimestampConsistency(envelopes, warnings) {
  let previous = null;

  for (let index = 0; index < envelopes.length; index += 1) {
    const timestamp = envelopes[index].envelope.created_at;
    if (!timestamp) continue;
    const current = Date.parse(timestamp);
    if (Number.isNaN(current)) {
      warnings.push(`invalid_timestamp_across_envelopes_${index}`);
      continue;
    }
    if (previous !== null && current < previous) {
      warnings.push('timestamp_out_of_order_across_envelopes');
    }
    previous = current;
  }
}

function rawChainIds(envelope) {
  if (!envelope || typeof envelope !== 'object' || !Array.isArray(envelope.chain)) return [];
  return envelope.chain.map(segment => typeof segment?.id === 'string' ? segment.id.trim() : '');
}

function applyChainConsistency(envelopes, warnings, inputChainOrders) {
  if (envelopes.length < 2) return;

  const firstIds = envelopes[0].chain.map(segment => segment.id).filter(Boolean);
  const firstSet = new Set(firstIds);

  for (const item of envelopes.slice(1)) {
    const ids = item.chain.map(segment => segment.id).filter(Boolean);
    const idSet = new Set(ids);

    if (item.chain.length !== envelopes[0].chain.length) {
      warnings.push('chain_length_mismatch_across_envelopes');
    }

    for (const id of firstSet) {
      if (!idSet.has(id)) warnings.push(`chain_id_mismatch_${id}`);
    }
    for (const id of idSet) {
      if (!firstSet.has(id)) warnings.push(`chain_id_mismatch_${id}`);
    }

    if (firstSet.size === idSet.size && [...firstSet].every(id => idSet.has(id))
      && inputChainOrders[0].filter(Boolean).join('\0') !== inputChainOrders[envelopes.indexOf(item)].filter(Boolean).join('\0')) {
      warnings.push('chain_order_mismatch_across_envelopes');
    }
  }
}