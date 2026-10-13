import { stableConfidence } from '../ocr/robustness/confidence-stability.js';
import { stableExtract } from '../ocr/robustness/extraction-stability.js';
import { mergeBlocks, stableBlocks } from '../ocr/robustness/multiblock-stability.js';
import { stableNormalize } from '../ocr/robustness/normalization-stability.js';
import { stableCrossFields } from '../metadata/robustness/crossfield-stability.js';
import { stableMetadata } from '../metadata/robustness/extraction-stability.js';
import { stableNormalizeMetadata } from '../metadata/robustness/normalization-stability.js';
import { stableCrossEnvelopes } from '../provenance/robustness/crossenvelope-stability.js';
import { stableEnvelope } from '../provenance/robustness/envelope-stability.js';
import { stableProvenanceChain } from '../provenance/robustness/chain-stability.js';
import { stableTamperDetection } from '../provenance/robustness/tamper-stability.js';
import { stableBreakerTransition, stableCircuitBreaker } from '../cloud/robustness/circuitbreaker-stability.js';
import { stableCloudRequest } from '../cloud/robustness/request-stability.js';
import { stableCloudResponse } from '../cloud/robustness/response-stability.js';
import { stableBackoff, stableRetryConfig } from '../cloud/robustness/retry-stability.js';
import { stableTimeoutConfig } from '../cloud/robustness/timeout-stability.js';

export function runSystemStability(input = {}) {
  const warnings = [];
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  if (source !== input) warnings.push('malformed_system_input');

  const blockResult = stableBlocks(source.ocr_blocks ?? []);
  const merged = mergeBlocks(blockResult.blocks);
  const extractedText = stableExtract({ text: merged.text, confidence: merged.confidence });
  const normalizedText = stableNormalize(extractedText.text);
  const normalizedConfidence = stableConfidence(merged.confidence);
  warnings.push(
    ...blockResult.warnings,
    ...extractedText.warnings,
    ...normalizedText.warnings,
    ...normalizedConfidence.warnings
  );

  const metadataResult = stableMetadata(source.metadata ?? {});
  const metadataNormalization = stableNormalizeMetadata(metadataResult.metadata ?? {});
  const metadataConsistency = stableCrossFields(metadataNormalization.normalized);
  warnings.push(
    ...(metadataResult.warnings || []),
    ...(!metadataResult.ok ? ['metadata_extraction_failed'] : []),
    ...metadataNormalization.warnings,
    ...metadataConsistency.warnings
  );

  const provenanceInput = source.provenance ?? {};
  const envelopeResult = stableEnvelope(provenanceInput);
  const chainResult = stableProvenanceChain(envelopeResult.chain);
  const tamperResult = stableTamperDetection(chainResult.chain);
  const provenanceInputs = Array.isArray(source.provenance_envelopes)
    ? source.provenance_envelopes
    : [provenanceInput];
  const crossEnvelopeResult = stableCrossEnvelopes(provenanceInputs);
  warnings.push(
    ...envelopeResult.warnings,
    ...chainResult.warnings,
    ...tamperResult.warnings,
    ...crossEnvelopeResult.warnings
  );

  const requestResult = stableCloudRequest(source.cloud_request ?? {});
  const responseResult = stableCloudResponse(source.cloud_response ?? {});
  const retryResult = stableRetryConfig(source.retry ?? {});
  const timeoutResult = stableTimeoutConfig(source.timeout ?? {});
  const breakerResult = stableCircuitBreaker(source.breaker ?? {});
  const backoff = stableBackoff(source.retry_attempt ?? 0, retryResult.retry);
  const breakerTransition = stableBreakerTransition(
    breakerResult.breaker,
    source.breaker_event
  );
  warnings.push(
    ...requestResult.warnings,
    ...responseResult.warnings,
    ...retryResult.warnings,
    ...timeoutResult.warnings,
    ...breakerResult.warnings
  );

  return {
    ocr: {
      blocks: blockResult.blocks,
      merged: {
        ...merged,
        text: normalizedText.normalized,
        confidence: normalizedConfidence.confidence
      }
    },
    metadata: metadataConsistency.fields,
    provenance: {
      envelope: envelopeResult.envelope,
      chain: chainResult.chain,
      tampered: tamperResult.tampered,
      envelopes: crossEnvelopeResult.envelopes
    },
    cloud: {
      request: requestResult.request,
      response: responseResult.response,
      retry: retryResult.retry,
      backoff_ms: backoff,
      timeout: timeoutResult.timeout,
      breaker: breakerResult.breaker,
      breaker_transition: breakerTransition
    },
    warnings: [...new Set(warnings)].sort()
  };
}