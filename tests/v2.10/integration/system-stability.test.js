import assert from 'node:assert/strict';
import { runSystemStability } from '../../../src/v2/integration/system-stability.js';

export async function runSystemStabilityTests() {
  const input = {
    ocr_blocks: [
      { index: 1, text: 'Hello', confidence: 0.9 },
      { index: 2, text: 'World', confidence: 0.8 }
    ],
    metadata: { vendor: '  Walmart  ', store_name: 'Walmart' },
    provenance: {
      document_id: 'A',
      source: 'scanner',
      created_at: '2024-01-01',
      chain: [
        { id: 'root', parent: '', timestamp: 't1' },
        { id: 'child', parent: 'root', timestamp: 't2' }
      ]
    },
    cloud_request: { endpoint: '/scan', payload: '{}', method: 'POST' },
    cloud_response: { status: 200, payload: '{}' },
    retry: { attempts: 3, delay_ms: 100, max_delay_ms: 500 },
    retry_attempt: 2,
    timeout: { request_ms: 100, connect_ms: 50, overall_ms: 200 },
    breaker: { state: 'closed', failures: 0, threshold: 5, reset_ms: 30000 },
    breaker_event: 'failure'
  };

  const output = runSystemStability(input);
  assert.equal(output.ocr.merged.text, 'Hello World');
  assert.equal(output.ocr.merged.confidence, 0.8500000000000001);
  assert.equal(output.metadata.vendor, 'Walmart');
  assert.equal(output.provenance.chain.length, 2);
  assert.equal(output.provenance.envelopes.length, 1);
  assert.equal(output.cloud.request.endpoint, '/scan');
  assert.equal(output.cloud.retry.attempts, 3);
  assert.equal(output.cloud.backoff_ms, 400);
  assert.equal(output.cloud.timeout.overall_ms, 200);
  assert.equal(output.cloud.breaker.state, 'closed');
  assert.deepEqual(output.cloud.breaker_transition, { state: 'half_open', failures: 1 });
  assert.deepEqual(output, runSystemStability(input));

  const malformed = runSystemStability(null);
  assert.ok(malformed.warnings.includes('malformed_system_input'));
  assert.deepEqual(malformed.ocr.merged, { text: '', confidence: 0, count: 0 });
  assert.deepEqual(malformed.metadata, { date: '', merchant: '', total: '' });

  return {
    ok: true,
    tests: [
      'Cross-subsystem stability pipeline',
      'Deterministic repeated output',
      'Malformed top-level input fallback'
    ]
  };
}