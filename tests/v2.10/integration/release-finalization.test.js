import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runReleaseFinalizationTests() {
  const notesPath = path.join(root, 'release', 'v2.10', 'final', 'RELEASE_NOTES.md');
  const publishPath = path.join(root, 'release', 'v2.10', 'final', 'publish.json');
  const tagPath = path.join(root, 'release', 'v2.10', 'final', 'git-tag.txt');

  assert.ok(fs.existsSync(notesPath), 'final release notes exist');
  assert.ok(fs.existsSync(publishPath), 'publish manifest exists');
  assert.ok(fs.existsSync(tagPath), 'git tag metadata exists');

  const publish = JSON.parse(fs.readFileSync(publishPath, 'utf8'));
  assert.equal(publish.version, '2.10.0');
  assert.equal(publish.tag, 'v2.10.0');
  assert.equal(publish.ready_for_publish, true);
  for (const artifactPath of Object.values(publish.artifacts)) {
    assert.ok(fs.existsSync(path.join(root, artifactPath)), `publish artifact exists: ${artifactPath}`);
  }

  const packageManifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(packageManifest.version, publish.version);
  assert.equal(fs.readFileSync(tagPath, 'utf8').split(/\r?\n/)[0], publish.tag);

  const releaseNotes = fs.readFileSync(notesPath, 'utf8');
  assert.match(releaseNotes, /tag metadata prepared/i);
  assert.match(releaseNotes, /actual tag creation is external/i);

  return {
    ok: true,
    tests: [
      'Release notes and tag metadata exist',
      'Publish manifest metadata and referenced artifacts validate',
      'Package version matches final release',
      'Final notes accurately describe external tag creation'
    ]
  };
}