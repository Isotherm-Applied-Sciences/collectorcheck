import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runArtifactIntegrityTests() {
  const bundlePath = path.join(root, 'dist', 'index.js');
  const buildManifestPath = path.join(root, 'release', 'v2.10', 'build-manifest.json');
  const publishManifestPath = path.join(root, 'release', 'v2.10', 'final', 'publish.json');

  assert.ok(fs.statSync(bundlePath).size > 10, 'distribution bundle is non-empty');

  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  assert.equal(buildManifest.version, '2.10.0');

  const publishManifest = JSON.parse(fs.readFileSync(publishManifestPath, 'utf8'));
  assert.equal(publishManifest.ready_for_publish, true);

  return {
    ok: true,
    tests: [
      'Distribution bundle is present and non-empty',
      'Build manifest parses and has expected version',
      'Publish manifest parses and marks release ready'
    ]
  };
}