#!/usr/bin/env node
import { processAll } from '../src/engine.js';
import { snapshot } from '../src/ingestion/watcher/index.js';
import { extractMetadata } from '../src/metadata/pipeline/index.js';
import { logInfo, logError } from '../src/logging/index.js';
import { CCError, err } from '../src/errors/index.js';

async function main() {
  const cmd = process.argv[2];
  logInfo('cli.start', { cmd });

  try {
    if (cmd === 'process') {
      const out = await processAll();
      console.log(JSON.stringify(out, null, 2));
    } else if (cmd === 'snapshot') {
      const out = snapshot();
      console.log(JSON.stringify(out, null, 2));
    } else if (cmd === 'meta') {
      const file = process.argv[3];
      if (!file) throw err('CLI_META_MISSING_PATH', 'meta requires a file path');
      const out = await extractMetadata(file);
      console.log(JSON.stringify(out, null, 2));
    } else {
      console.log('collectorcheck-cli commands: process | snapshot | meta <file>');
    }

    logInfo('cli.complete', { cmd });
    process.exit(0);
  } catch (e) {
    const wrapped = e instanceof CCError
      ? e
      : err('CLI_UNKNOWN', e?.message || 'Unknown error', { raw: e });
    logError('cli.error', wrapped.toJSON());
    console.error(JSON.stringify(wrapped.toJSON(), null, 2));
    process.exit(1);
  }
}

main();
