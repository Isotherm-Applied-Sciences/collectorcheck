import fs from 'fs';
import path from 'path';

const REMOTE_ROOT = process.env.COLLECTORCHECK_REMOTE_ROOT ||
  path.join(process.cwd(), 'collectorcheck-remote-sim');

export function ensureRemoteRoot() {
  if (!fs.existsSync(REMOTE_ROOT)) fs.mkdirSync(REMOTE_ROOT, { recursive: true });
  return REMOTE_ROOT;
}

export async function uploadJson(relativePath, data) {
  const root = ensureRemoteRoot();
  const full = path.join(root, relativePath);
  const dir = path.dirname(full);

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2), 'utf8');

  return {
    target: 'remote-sim',
    path: full,
    ok: true
  };
}
