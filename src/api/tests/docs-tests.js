import assert from 'node:assert/strict';
import { docs } from '../docs/index.js';
import fs from 'fs';

export function runApiDocsTests() {
  // 1. Check markdown exists
  assert.equal(fs.existsSync('src/api/docs/v1.md'), true);

  // 2. Check JSON exists and parses
  const json = JSON.parse(fs.readFileSync('src/api/docs/v1.json', 'utf8'));
  assert.equal(json.version, 'v1');

  // 3. Check required fields
  assert.ok(json.methods.processAll);
  assert.ok(json.methods.snapshot);
  assert.ok(json.methods.extractMetadata);

  return {
    ok: true,
    tests: [
      'v1.md exists',
      'v1.json parses',
      'v1.json contains required fields'
    ]
  };
}