import assert from 'node:assert/strict';
import { stableProvenanceChain } from '../../../src/v2/provenance/robustness/chain-stability.js';

export async function runProvenanceChainStabilityTests() {
  const nonArray = stableProvenanceChain(null);
  assert.deepEqual(nonArray.chain, []);
  assert.ok(nonArray.warnings.includes('non_array_chain'));

  const circular = [];
  circular.push(circular);
  const invalidJson = stableProvenanceChain(circular);
  assert.deepEqual(invalidJson.chain, []);
  assert.ok(invalidJson.warnings.includes('invalid_json_structure'));

  const normalized = stableProvenanceChain([
    { segmentId: ' A ', previousId: ' B ', createdAt: ' 2024-01-01 ' }
  ]);
  assert.equal(normalized.chain[0].id, 'A');
  assert.equal(normalized.chain[0].parent, 'B');
  assert.equal(normalized.chain[0].timestamp, '2024-01-01');

  const unordered = [
    { id: 'child', parent: 'root', timestamp: 't2' },
    { id: 'root', parent: '', timestamp: 't1' }
  ];
  const ordered = stableProvenanceChain(unordered);
  assert.deepEqual(ordered.chain.map(segment => segment.id), ['root', 'child']);
  assert.deepEqual(ordered.chain, stableProvenanceChain([...unordered].reverse()).chain);

  const cyclic = stableProvenanceChain([
    { id: 'A', parent: 'B', timestamp: 't1' },
    { id: 'B', parent: 'A', timestamp: 't2' },
    { id: 'child', parent: 'A', timestamp: 't3' }
  ]);
  assert.deepEqual(cyclic.chain.map(segment => segment.id), ['child']);
  assert.ok(cyclic.warnings.includes('circular_reference_A'));
  assert.ok(cyclic.warnings.includes('missing_parent_A'));

  const missingLinks = stableProvenanceChain([
    { id: 'orphan', parent: 'missing', timestamp: '' }
  ]);
  assert.ok(missingLinks.warnings.includes('missing_parent_missing'));
  assert.ok(missingLinks.warnings.includes('missing_timestamp_orphan'));

  const malformedSegment = stableProvenanceChain([null, { id: 'valid', timestamp: 't1' }]);
  assert.ok(malformedSegment.warnings.includes('malformed_segment'));
  assert.equal(malformedSegment.chain.some(segment => segment.id === 'valid'), true);

  return {
    ok: true,
    tests: [
      'Invalid chain input handling',
      'Provider field normalization',
      'Deterministic parent-first ordering',
      'Cycle removal and missing-parent reporting',
      'Malformed segment tolerance'
    ]
  };
}