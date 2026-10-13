import { metadataResult } from './result.js';
import { stableNormalizeMetadata } from './robustness/normalization-stability.js';

export function extractMetadataFromText(text) {
  if (!text || typeof text !== 'string') {
    return metadataResult(false, null, 'Invalid OCR text input');
  }

  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  const merchant = lines[0] || null;

  const dateRegexes = [
    /\b(\d{4})-(\d{2})-(\d{2})\b/,
    /\b(\d{2})\/(\d{2})\/(\d{4})\b/,
    /\b(\d{2})\/(\d{2})\/(\d{2})\b/
  ];

  let date = null;
  for (const line of lines) {
    for (const regex of dateRegexes) {
      const match = line.match(regex);
      if (match) {
        date = match[0];
        break;
      }
    }
    if (date) break;
  }

  const totalRegexes = [
    /Total[:\s]+\$?(\d+\.\d{2})/i,
    /\$?(\d+\.\d{2})\s*Total/i,
    /\$([0-9]+\.[0-9]{2})/
  ];

  let total = null;
  for (const line of lines) {
    for (const regex of totalRegexes) {
      const match = line.match(regex);
      if (match) {
        total = match[1] || match[0].replace(/[^0-9.]/g, '');
        break;
      }
    }
    if (total) break;
  }

  const stable = stableNormalizeMetadata({ merchant, date, total });
  return {
    ...metadataResult(true, stable.normalized, null),
    warnings: stable.warnings
  };
}