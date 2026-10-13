import fs from 'fs';
import path from 'path';
import { cloudResult } from '../contract.js';

const ROOT = process.env.COLLECTORCHECK_LOCAL_ROOT || path.join(process.cwd(), 'collectorcheck-local');

export function ensureRoot() {
  if (!fs.existsSync(ROOT)) fs.mkdirSync(ROOT, { recursive: true });
  return ROOT;
}

export function saveJson(relativePath, data) {
  ensureRoot();
  const full = path.join(ROOT, relativePath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');
  return cloudResult('local', full, true);
}
