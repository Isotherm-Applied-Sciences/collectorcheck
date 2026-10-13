import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateForwardAnchor } from '../../../ledger/continuity/v2.10/forward-anchor.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runContinuityVerificationTests() {
  const continuityDirectory = path.join(root, 'ledger', 'continuity', 'v2.10');
  const forwardAnchorPath = path.join(continuityDirectory, 'forward-anchor.sha256');
  const mapPath = path.join(continuityDirectory, 'map.json');
  const previousAnchorPath = path.join(root, 'ledger', 'anchor', 'v2.10', 'anchor.sha256');

  assert.ok(fs.existsSync(forwardAnchorPath), 'forward anchor exists');
  assert.ok(fs.existsSync(mapPath), 'continuity map exists');

  const previousAnchor = fs.readFileSync(previousAnchorPath, 'utf8').trim();
  assert.match(previousAnchor, /^[a-f0-9]{64}$/);
  const expected = crypto.createHash('sha256').update(previousAnchor, 'utf8').digest('hex');
  const actual = fs.readFileSync(forwardAnchorPath, 'utf8').trim();
  assert.equal(actual, expected);
  assert.equal(generateForwardAnchor(), expected);

  const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  assert.equal(map.version, '2.10.0');
  assert.equal(map.forward_anchor, 'forward-anchor.sha256');
  assert.equal(map.links_to_future, true);
  assert.equal(map.continuity_rules.next_release_must_anchor_to,
    'ledger/continuity/v2.10/forward-anchor.sha256');
  assert.equal(map.continuity_rules.chain_type, 'append-only');
  assert.equal(map.continuity_rules.tamper_evident, true);

  return {
    ok: true,
    tests: [
      'Forward anchor matches normalized prior anchor digest',
      'Continuity map enables future linking',
      'Append-only and tamper-evident rules validate'
    ]
  };
}