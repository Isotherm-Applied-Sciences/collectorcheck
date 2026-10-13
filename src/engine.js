import { snapshot } from './ingestion/watcher/index.js';
import { extractMetadata } from './metadata/pipeline/index.js';
import { saveJson } from './cloud/local/index.js';
import { makeStorageKey } from './cloud/interfaces/index.js';
import { logInfo, logError } from './logging/index.js';
import { err } from './errors/index.js';

export async function processAll() {
  logInfo('engine.start');

  const snap = snapshot();
  logInfo('engine.snapshot', { count: snap.files.length });

  const results = [];

  for (const file of snap.files) {
    try {
      logInfo('engine.process.file', { file });
      const meta = await extractMetadata(file);
      const key = makeStorageKey(file) + '.json';
      const saved = saveJson(key, meta);
      results.push({ file, saved });
      logInfo('engine.process.success', { file, saved });
    } catch (e) {
      const wrapped = err('ENGINE_PROCESS_FAILED', e.message || e, { file });
      logError('engine.process.error', wrapped.toJSON());
      results.push({ file, error: wrapped.toJSON() });
    }
  }

  logInfo('engine.complete', { count: results.length });

  return {
    count: results.length,
    results
  };
}
