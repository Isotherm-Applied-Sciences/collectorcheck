import { normalizeText } from './extraction-stability.js';

export function stableNormalize(text) {
  if (typeof text !== 'string') {
    return {
      normalized: '',
      warnings: ['non_string_input']
    };
  }

  const cleaned = removeInvisible(text);
  const unicodeSafe = safeUnicode(cleaned);
  const collapsed = collapseWhitespace(unicodeSafe);

  return {
    normalized: normalizeText(collapsed),
    warnings: buildWarnings(text)
  };
}

function removeInvisible(text) {
  return text
    .replace(/\u200B/g, ' ')
    .replace(/[\u200C-\u200F\uFEFF]/g, '');
}

function safeUnicode(text) {
  try {
    return text.normalize('NFC');
  } catch {
    return text;
  }
}

function collapseWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function buildWarnings(original) {
  const warnings = [];
  if (/[\u200B-\u200F\uFEFF]/.test(original)) {
    warnings.push('invisible_characters_removed');
  }
  if (/\s{2,}/.test(original)) {
    warnings.push('whitespace_collapsed');
  }
  return warnings;
}