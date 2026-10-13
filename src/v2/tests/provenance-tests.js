import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createCanvas } from '@napi-rs/canvas';
import { extractText } from '../ocr/index.js';
import { processFileWithProvenance } from '../provenance/index.js';
import { hashFileSha256, hashTextSha256 } from '../provenance/hash.js';
import { validateProvenanceResult } from '../provenance/contract.js';
import { runProvenanceChainStabilityTests } from '../../../tests/v2.10/provenance/chain-stability.test.js';
import { runEnvelopeStabilityTests } from '../../../tests/v2.10/provenance/envelope-stability.test.js';
import { runTamperStabilityTests } from '../../../tests/v2.10/provenance/tamper-stability.test.js';
import { runCrossEnvelopeStabilityTests } from '../../../tests/v2.10/provenance/crossenvelope-stability.test.js';

export async function runProvenanceTests() {
  const file = path.join(os.tmpdir(), `collectorcheck-prov-${Date.now()}.png`);
  const canvas = createCanvas(2200, 800);
  const context = canvas.getContext('2d');
  context.fillStyle = 'white';
  context.fillRect(0, 0, 2200, 800);
  context.fillStyle = 'black';
  context.font = '64px Arial';
  context.fillText('SUPERSTORE', 100, 180);
  context.fillText('2024-11-05', 100, 360);
  context.fillText('TOTAL 12.34', 100, 540);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));

  try {
    const ocr = await extractText(file);
    assert.equal(ocr.ok, true);

    const result = await processFileWithProvenance(file);
    assert.equal(result.ok, true);
    assert.equal(result.provenance.metadata.merchant, 'SUPERSTORE');
    assert.equal(result.provenance.metadata.date, '2024-11-05');
    assert.equal(result.provenance.metadata.total, '12.34');
    assert.equal(result.provenance.fileHash, hashFileSha256(file));
    assert.equal(result.provenance.textHash, hashTextSha256(ocr.text));
    assert.equal(
      hashTextSha256('CollectorCheck'),
      crypto.createHash('sha256').update('CollectorCheck', 'utf8').digest('hex')
    );
    assert.equal(Number.isNaN(Date.parse(result.provenance.timestamp)), false);
    assert.equal(validateProvenanceResult(result), true);
  } finally {
    fs.rmSync(file, { force: true });
  }

  const chainTests = await runProvenanceChainStabilityTests();
  const envelopeTests = await runEnvelopeStabilityTests();
  const tamperTests = await runTamperStabilityTests();
  const crossEnvelopeTests = await runCrossEnvelopeStabilityTests();

  return {
    ok: true,
    tests: [
      'Provenance chain (file + text + metadata + timestamp)',
      ...chainTests.tests,
      ...envelopeTests.tests,
      ...tamperTests.tests,
      ...crossEnvelopeTests.tests
    ]
  };
}