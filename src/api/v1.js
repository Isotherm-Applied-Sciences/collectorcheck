import { processAll } from '../engine.js';
import { snapshot } from '../ingestion/watcher/index.js';
import { extractMetadata } from '../metadata/pipeline/index.js';

export const v1 = {
  processAll,
  snapshot,
  extractMetadata
};