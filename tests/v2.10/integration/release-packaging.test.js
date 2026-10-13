import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const releaseDirectory = path.join(root, 'release', 'v2.10');

export async function runReleasePackagingTests() {
  const manifestPath = path.join(releaseDirectory, 'build-manifest.json');
  const versionPath = path.join(releaseDirectory, 'version.txt');
  const changelogPath = path.join(releaseDirectory, 'CHANGELOG.md');

  assert.ok(fs.existsSync(manifestPath), 'build manifest exists');
  assert.ok(fs.existsSync(versionPath), 'version stamp exists');
  assert.ok(fs.existsSync(changelogPath), 'release changelog exists');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.version, '2.10.0');
  assert.equal(manifest.build, 'stable');
  assert.ok(Number.isFinite(Date.parse(manifest.timestamp)));

  for (const [group, modules] of Object.entries(manifest.modules)) {
    for (const moduleName of modules) {
      const sourcePath = group === 'integration'
        ? path.join(root, 'src', 'v2', 'integration', `${moduleName}.js`)
        : path.join(root, 'src', 'v2', group, 'robustness', `${moduleName}.js`);
      assert.ok(fs.existsSync(sourcePath), `manifest module exists: ${group}/${moduleName}`);
    }
  }

  const versionStamp = fs.readFileSync(versionPath, 'utf8');
  assert.match(versionStamp, /CollectorCheck v2\.10/);
  assert.match(versionStamp, /Build: stable/);

  const changelog = fs.readFileSync(changelogPath, 'utf8');
  assert.match(changelog, /Version: 2\.10\.0/);
  assert.match(changelog, /system-wide stability orchestrator/i);

  return {
    ok: true,
    tests: [
      'Release artifacts exist',
      'Manifest version, build, and timestamp validate',
      'All manifest modules exist',
      'Version stamp and changelog match release'
    ]
  };
}