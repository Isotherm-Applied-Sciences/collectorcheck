import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateAnchor } from '../../../ledger/anchor/v2.10/anchor.js';
import { generateForwardAnchor } from '../../../ledger/continuity/v2.10/forward-anchor.js';
import { generateLineageSeal } from '../../../lineage/v2.10/lineage-seal.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runBroadcastVerificationTests() {
  const broadcastDirectory = path.join(root, 'broadcast');
  const manifestPath = path.join(broadcastDirectory, 'v2.10', 'broadcast.json');
  const globalMapPath = path.join(broadcastDirectory, 'global-anchor-map.json');
  assert.ok(fs.existsSync(manifestPath), 'broadcast manifest exists');
  assert.ok(fs.existsSync(globalMapPath), 'global anchor map exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.broadcasted, true);
  assert.equal(manifest.broadcast_scope, 'repository-global-anchor-map');
  assert.ok(Number.isFinite(Date.parse(manifest.timestamp)));

  const manifestDirectory = path.dirname(manifestPath);
  const lineageSealPath = path.resolve(manifestDirectory, manifest.lineage_seal);
  const forwardAnchorPath = path.resolve(manifestDirectory, manifest.forward_anchor);
  const rootAnchorPath = path.resolve(manifestDirectory, manifest.root_anchor);
  assert.equal(lineageSealPath, path.join(root, 'lineage', 'v2.10', 'lineage-seal.sha256'));
  assert.equal(forwardAnchorPath, path.join(root, 'ledger', 'continuity', 'v2.10', 'forward-anchor.sha256'));
  assert.equal(rootAnchorPath, path.join(root, 'ledger', 'anchor', 'v2.10', 'anchor.sha256'));

  const lineageSeal = fs.readFileSync(lineageSealPath, 'utf8').trim();
  const forwardAnchor = fs.readFileSync(forwardAnchorPath, 'utf8').trim();
  const rootAnchor = fs.readFileSync(rootAnchorPath, 'utf8').trim();
  assert.equal(lineageSeal, crypto.createHash('sha256').update(forwardAnchor, 'utf8').digest('hex'));
  assert.equal(lineageSeal, generateLineageSeal());
  assert.equal(forwardAnchor, generateForwardAnchor());
  assert.equal(rootAnchor, generateAnchor());

  const globalMap = JSON.parse(fs.readFileSync(globalMapPath, 'utf8'));
  assert.equal(globalMap.anchors.length, 1);
  assert.deepEqual(globalMap.anchors[0], {
    version: manifest.version,
    lineage_seal: 'v2.10/broadcast.json',
    registered_at: manifest.timestamp
  });
  assert.equal(path.resolve(broadcastDirectory, globalMap.anchors[0].lineage_seal), manifestPath);

  return {
    ok: true,
    tests: [
      'Broadcast manifest and global map validate',
      'Lineage, forward, and root anchor paths resolve',
      'Broadcast links match the complete SHA-256 chain',
      'Global map records the v2.10 broadcast'
    ]
  };
}