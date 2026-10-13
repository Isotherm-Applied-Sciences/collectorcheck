import { extractText } from '../ocr/index.js';
import { validateOcrResult } from '../ocr/contract.js';
import { extractMetadataFromText } from './extract.js';
import { validateMetadataResult } from './result.js';
import { applyMetadataPlugins } from '../plugins/enrich.js';
import { stableMetadata } from './robustness/extraction-stability.js';

export async function processFile(filePath, providedOcr = null) {
  const ocr = providedOcr || await extractText(filePath);

  if (!validateOcrResult(ocr)) {
    return { ok: false, metadata: null, error: 'Invalid OCR result shape' };
  }

  if (!ocr.ok) {
    return { ok: false, metadata: null, error: `OCR failed: ${ocr.error}` };
  }

  const metadata = extractMetadataFromText(ocr.text);

  if (!validateMetadataResult(metadata)) {
    return { ok: false, metadata: null, error: 'Invalid metadata result shape' };
  }

  if (!metadata.ok) return metadata;

  const enriched = await applyMetadataPlugins(metadata.metadata);
  const stable = stableMetadata(enriched);
  if (!stable.ok) return stable;

  const result = {
    ...metadata,
    metadata: stable.metadata,
    warnings: [...new Set([...(metadata.warnings || []), ...(stable.warnings || [])])]
  };

  return validateMetadataResult(result)
    ? result
    : { ok: false, metadata: null, error: 'Invalid enriched metadata result shape' };
}