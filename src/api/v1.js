import { processAll } from '../engine.js';
import { snapshot } from '../ingestion/watcher/index.js';
import { extractMetadata } from '../metadata/pipeline/index.js';
import { apiResult, apiError, validateApiResult } from './contract/index.js';

export const v1 = {
  async processAll() {
    try {
      const out = await processAll();
      return apiResult(true, out);
    } catch (e) {
      return apiError('API_PROCESS_FAILED', e.message || e);
    }
  },

  snapshot() {
    try {
      const out = snapshot();
      return apiResult(true, out);
    } catch (e) {
      return apiError('API_SNAPSHOT_FAILED', e.message || e);
    }
  },

  async extractMetadata(file) {
    try {
      const out = await extractMetadata(file);
      return apiResult(true, out);
    } catch (e) {
      return apiError('API_METADATA_FAILED', e.message || e);
    }
  },

  validateApiResult
};