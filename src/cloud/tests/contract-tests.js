import assert from 'node:assert/strict';
import { cloudResult, cloudError, validateCloudResult } from '../contract.js';
import * as local from '../local/index.js';
import * as remote from '../remote/index.js';

export async function runCloudContractTests() {
  // 1. Basic contract shape tests
  const r = cloudResult('local', 'path.json', true);
  assert.equal(validateCloudResult(r), true);

  const bad1 = { target: 'local', path: 'x', ok: 'yes' };
  assert.equal(validateCloudResult(bad1), false);

  const e = cloudError('FAILED', 'nope');
  assert.deepEqual(e, { error: 'FAILED', msg: 'nope', data: null });

  // 2. Local adapter compliance
  const localOut = local.saveJson('test-local.json', { a: 1 });
  assert.equal(validateCloudResult(localOut), true);

  // 3. Remote adapter compliance
  const remoteOut = await remote.uploadJson('test-remote.json', { b: 2 });
  assert.equal(validateCloudResult(remoteOut), true);

  return {
    ok: true,
    tests: [
      'cloudResult/validateCloudResult',
      'cloudError',
      'local.saveJson contract compliance',
      'remote.uploadJson contract compliance'
    ]
  };
}