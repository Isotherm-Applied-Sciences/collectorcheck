import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import * as intelligence from '../src/utils/dittoIntelligence.js';
import * as automation from '../src/utils/dittoAutomation.js';
import * as intent from '../src/utils/dittoPredictive.js';
import { getDittoMemory, recordTagAdded } from '../src/utils/dittoMemory.js';
import { getEmotionalMoment } from '../src/utils/dittoEmotion.js';
import { getDittoSmartSuggestion } from '../src/utils/dittoSmartSuggestions.js';

beforeEach(() => {
  const storage = new Map();
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value))
  };
  globalThis.window = { dispatchEvent() {} };
});

const receipt = { id: 1, filename: 'medical.pdf', vendor: 'Medical Clinic', amount: 900, date: '2026-10-16', tags: [] };

test('receipt analysis exposes no tax inference', () => {
  const result = intelligence.analyzeReceipts([receipt]);
  assert.equal('taxHints' in result, false);
  assert.equal('inferTaxCategories' in intelligence, false);
  assert.equal('autoMarkTax' in automation, false);
  assert.ok(Array.isArray(result.vendorHints));
});

test('no history-based prediction API remains and commands stay bounded', () => {
  assert.equal('predictNextActions' in intent, false);
  for (const command of ['mark tax receipts', 'insurance receipts', 'compliance review']) {
    assert.equal(intent.parseDittoIntent(command), null);
  }
  assert.deepEqual(intent.parseDittoIntent('show timeline'), { action: 'timeline' });
  assert.deepEqual(intent.parseDittoIntent('organize tags'), { action: 'auto-tag' });
});

test('manual tags do not train tax patterns', () => {
  recordTagAdded('Tax: Manual', receipt);
  assert.equal('taxPatterns' in getDittoMemory(), false);
  assert.equal(getDittoMemory().lastTagAdded, 'Tax: Manual');
});

test('organization and light tone do not recommend regulated workflows', () => {
  const grouped = automation.autoGroupReceipts([receipt], { clusters: {}, vendorHints: [], patterns: {} });
  assert.deepEqual(grouped[0].tags, []);
  const moment = getEmotionalMoment(receipt);
  assert.doesNotMatch(moment.message, /tax|insurance|compliance/i);
  const suggestion = getDittoSmartSuggestion([receipt, { ...receipt, id: 2 }, { ...receipt, id: 3 }]);
  assert.doesNotMatch(suggestion.message, /tax|insurance|compliance/i);
});

test('UI callers do not expose removed inference actions', async () => {
  for (const filename of ['Ditto.jsx', 'DittoController.jsx']) {
    const source = await readFile(new URL(`../src/components/${filename}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /auto-tax|taxHints|predictNextActions|setPredictions/);
  }
});