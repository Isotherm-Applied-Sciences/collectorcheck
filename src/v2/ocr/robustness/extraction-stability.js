import { stableConfidence } from './confidence-stability.js';

export function normalizeText(text) {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(line => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n')
    .trim();
}

function safeJSON(value) {
  try {
    const serialized = JSON.stringify(value);
    return typeof serialized === 'string' ? serialized : null;
  } catch {
    return null;
  }
}

export function stableExtract(ocrBlock) {
  if (!ocrBlock || typeof ocrBlock !== 'object' || Array.isArray(ocrBlock)) {
    return {
      text: '',
      confidence: 0,
      warnings: ['malformed_ocr_block']
    };
  }

  const rawText = typeof ocrBlock.text === 'string' ? ocrBlock.text : '';
  const text = normalizeText(rawText);
  const normalizedConfidence = stableConfidence(ocrBlock.confidence);
  const confidence = normalizedConfidence.confidence;
  const warnings = [];

  if (!text) warnings.push('missing_text');
  warnings.push(...normalizedConfidence.warnings);
  if (safeJSON(ocrBlock) === null) warnings.push('invalid_json_structure');

  return { text, confidence, warnings: [...new Set(warnings)] };
}