import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runDistributionPrepTests() {
  const packagePath = path.join(root, 'package.json');
  const bundlePath = path.join(root, 'dist', 'index.js');
  const releasePath = path.join(root, 'release', 'v2.10', 'github', 'release.json');

  assert.ok(fs.existsSync(bundlePath), 'distribution bundle exists');
  assert.ok(fs.existsSync(releasePath), 'GitHub release metadata exists');

  const packageManifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  assert.equal(packageManifest.version, '2.10.0');
  assert.equal(packageManifest.main, 'dist/index.js');
  assert.equal(packageManifest.exports['.'], './dist/index.js');
  assert.equal(packageManifest.exports['./api'], './src/api/index.js');
  assert.ok(packageManifest.dependencies['@aws-sdk/client-s3']);
  assert.ok(packageManifest.scripts['build:v2']);

  const release = JSON.parse(fs.readFileSync(releasePath, 'utf8'));
  assert.equal(release.tag, 'v2.10.0');
  assert.equal(release.draft, false);
  assert.equal(release.prerelease, false);

  const distribution = await import(pathToFileURL(bundlePath).href);
  assert.equal(typeof distribution.runSystemStability, 'function');

  return {
    ok: true,
    tests: [
      'Distribution bundle and system export',
      'npm manifest version and preserved project settings',
      'GitHub release metadata validity'
    ]
  };
}