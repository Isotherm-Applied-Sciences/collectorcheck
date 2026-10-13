import assert from 'node:assert/strict';
import { apiResult, apiError, validateApiResult } from '../contract/index.js';
import { v1 } from '../index.js';

export async function runApiContractTests() {
  // 1. Basic contract shape tests
  const r = apiResult(true, { a: 1 });
  assert.equal(validateApiResult(r), true);

  const e = apiError('FAILED', 'nope');
  assert.equal(validateApiResult(e), true);

  const bad = { ok: true, data: 'not-object' };
  assert.equal(validateApiResult(bad), false);

  // 2. API snapshot test
  const snap = v1.snapshot();
  assert.equal(validateApiResult(snap), true);

  // 3. API processAll test
  const proc = await v1.processAll();
  assert.equal(validateApiResult(proc), true);

  return {
    ok: true,
    tests: [
      'apiResult/validateApiResult',
      'apiError',
      'v1.snapshot contract compliance',
      'v1.processAll contract compliance'
    ]
  };
}