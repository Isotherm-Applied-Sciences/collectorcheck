import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const subsystemDefinitions = [
  {
    name: 'OCR',
    manifest: 'ocr.json',
    directory: 'ocr',
    modules: ['extraction-stability', 'normalization-stability', 'confidence-stability', 'multiblock-stability']
  },
  {
    name: 'Metadata',
    manifest: 'metadata.json',
    directory: 'metadata',
    modules: ['extraction-stability', 'normalization-stability', 'value-stability', 'crossfield-stability']
  },
  {
    name: 'Provenance',
    manifest: 'provenance.json',
    directory: 'provenance',
    modules: ['chain-stability', 'envelope-stability', 'tamper-stability', 'crossenvelope-stability']
  },
  {
    name: 'Cloud Adapter',
    manifest: 'cloud.json',
    directory: 'cloud',
    modules: ['request-stability', 'response-stability', 'retry-stability', 'timeout-stability', 'circuitbreaker-stability']
  },
  {
    name: 'System Integration',
    manifest: 'system.json',
    directory: 'integration',
    modules: ['system-stability']
  }
];

export async function runCertificationTests() {
  const certificationDirectory = path.join(root, 'certification', 'v2.10');
  const certifiedSubsystems = [];

  for (const definition of subsystemDefinitions) {
    const manifestPath = path.join(certificationDirectory, definition.manifest);
    assert.ok(fs.existsSync(manifestPath), `${definition.name} certification manifest exists`);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.equal(manifest.subsystem, definition.name);
    assert.equal(manifest.version, '2.10.0');
    assert.equal(manifest.certified, true);
    assert.ok(Array.isArray(manifest.criteria) && manifest.criteria.length > 0);

    for (const moduleName of definition.modules) {
      const sourcePath = definition.directory === 'integration'
        ? path.join(root, 'src', 'v2', 'integration', `${moduleName}.js`)
        : path.join(root, 'src', 'v2', definition.directory, 'robustness', `${moduleName}.js`);
      const testPath = path.join(root, 'tests', 'v2.10', definition.directory, `${moduleName}.test.js`);
      assert.ok(fs.existsSync(sourcePath), `certified source exists: ${definition.name}/${moduleName}`);
      assert.ok(fs.existsSync(testPath), `certification test exists: ${definition.name}/${moduleName}`);
    }

    certifiedSubsystems.push(manifest.subsystem);
  }

  const summaryPath = path.join(certificationDirectory, 'summary.json');
  assert.ok(fs.existsSync(summaryPath), 'summary certification manifest exists');
  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  assert.equal(summary.version, '2.10.0');
  assert.equal(summary.certified, true);
  assert.deepEqual(summary.subsystems, certifiedSubsystems);
  for (const auditStatus of Object.values(summary.audit)) {
    assert.equal(auditStatus, 'verified');
  }

  return {
    ok: true,
    tests: [
      'Five subsystem manifests and criteria',
      'Certified source modules and focused tests exist',
      'Summary coverage and audit statuses validate'
    ]
  };
}