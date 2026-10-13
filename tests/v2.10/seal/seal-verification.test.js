import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runSystemStability } from '../../../src/v2/integration/system-stability.js';
import { runCertificationTests } from '../certification/certification.test.js';

const root = fileURLToPath(new URL('../../../', import.meta.url));

export async function runSealVerificationTests() {
  const sealPath = path.join(root, 'seal', 'v2.10', 'SEAL.txt');
  const certificatePath = path.join(root, 'seal', 'v2.10', 'certificate.json');
  const summaryPath = path.join(root, 'certification', 'v2.10', 'summary.json');
  const buildManifestPath = path.join(root, 'release', 'v2.10', 'build-manifest.json');
  const publishManifestPath = path.join(root, 'release', 'v2.10', 'final', 'publish.json');

  assert.ok(fs.existsSync(sealPath), 'seal file exists');
  assert.ok(fs.existsSync(certificatePath), 'certificate exists');

  const sealText = fs.readFileSync(sealPath, 'utf8');
  assert.match(sealText, /Status: SEALED/);
  assert.match(sealText, /Version: 2\.10\.0/);

  const certificate = JSON.parse(fs.readFileSync(certificatePath, 'utf8'));
  assert.equal(certificate.version, '2.10.0');
  assert.equal(certificate.sealed, true);
  assert.ok(Number.isFinite(Date.parse(certificate.issued_at)));
  assert.equal(certificate.issuer, 'Isotherm Applied Sciences - Stability Authority');
  for (const criterion of Object.values(certificate.criteria)) {
    assert.equal(criterion, 'verified');
  }

  const certificationSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const buildManifest = JSON.parse(fs.readFileSync(buildManifestPath, 'utf8'));
  const publishManifest = JSON.parse(fs.readFileSync(publishManifestPath, 'utf8'));
  assert.equal(certificationSummary.version, certificate.version);
  assert.equal(certificationSummary.certified, true);
  assert.equal(buildManifest.version, certificate.version);
  assert.equal(publishManifest.version, certificate.version);
  assert.equal(publishManifest.ready_for_publish, true);

  const certification = await runCertificationTests();
  assert.equal(certification.ok, true);
  const integration = runSystemStability({});
  assert.deepEqual(Object.keys(integration), ['ocr', 'metadata', 'provenance', 'cloud', 'warnings']);

  return {
    ok: true,
    tests: [
      'Seal artifact and issued certificate',
      'Certificate criteria and release evidence consistency',
      'Subsystem certification verification',
      'System integration smoke verification'
    ]
  };
}