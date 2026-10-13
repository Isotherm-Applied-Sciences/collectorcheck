import assert from 'node:assert/strict';
import { runSystemStability } from '../../../src/v2/integration/system-stability.js';

export async function runSmokeTests() {
  const output = runSystemStability({
    ocr_blocks: [{ index: 1, text: 'Test', confidence: 0.9 }],
    metadata: { vendor: 'TestVendor' },
    provenance: {
      document_id: 'X',
      source: 'scanner',
      created_at: '2024-01-01',
      chain: []
    },
    cloud_request: { endpoint: '/ping', payload: '{}', method: 'POST' },
    cloud_response: { status: 200, payload: '{}' },
    retry: { attempts: 1, delay_ms: 100, max_delay_ms: 200 },
    timeout: { request_ms: 100, connect_ms: 50, overall_ms: 200 },
    breaker: { state: 'closed', failures: 0, threshold: 5, reset_ms: 30000 }
  });

  assert.equal(output.ocr.merged.text, 'Test');
  assert.equal(output.metadata.vendor, 'TestVendor');
  assert.equal(output.provenance.envelope.document_id, 'X');
  assert.equal(output.cloud.request.endpoint, '/ping');
  assert.ok(Array.isArray(output.warnings));

  return { ok: true, tests: ['Stability pipeline smoke run'] };
}