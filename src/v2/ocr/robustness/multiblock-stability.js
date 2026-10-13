import { stableExtract } from './extraction-stability.js';
import { stableNormalize } from './normalization-stability.js';
import { stableAverage, stableConfidence } from './confidence-stability.js';

export function stableBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    return { blocks: [], warnings: ['non_array_blocks'] };
  }

  const warnings = [];
  const cleaned = [];

  for (const block of blocks) {
    if (!block || typeof block !== 'object' || Array.isArray(block)) {
      warnings.push('malformed_ocr_block');
      continue;
    }

    cleaned.push(normalizeBlock(block));
  }

  cleaned.sort((left, right) => {
    if (left.index !== right.index) return left.index - right.index;
    if (left.text < right.text) return -1;
    if (left.text > right.text) return 1;
    return left.confidence - right.confidence;
  });

  warnings.push(...cleaned.flatMap(block => block.warnings));
  return { blocks: cleaned, warnings: [...new Set(warnings)] };
}

export function mergeBlocks(blocks) {
  const stable = stableBlocks(blocks).blocks;
  const text = stable.map(block => block.text).filter(Boolean).join(' ');
  const confidence = stableAverage(stable.map(block => block.confidence)).confidence;

  return {
    text,
    confidence,
    count: stable.length
  };
}

function normalizeBlock(block) {
  const index = Number.isFinite(block.index) ? block.index : 0;
  const extracted = stableExtract(block);
  const normalized = stableNormalize(extracted.text);
  const confidence = stableConfidence(block.confidence);

  return {
    index,
    text: normalized.normalized,
    confidence: confidence.confidence,
    warnings: [...new Set([
      ...extracted.warnings,
      ...normalized.warnings,
      ...confidence.warnings
    ])]
  };
}