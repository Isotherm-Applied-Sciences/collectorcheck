import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const lineageSealPath = path.join(repositoryRoot, 'lineage', 'v2.10', 'lineage-seal.sha256');
const lockDirectory = path.join(repositoryRoot, 'lineage', 'v2.10', 'lock');
const lockPath = path.join(lockDirectory, 'lineage-lock.sha256');

export function generateLineageLock() {
  const seal = fs.readFileSync(lineageSealPath, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(seal)) throw new Error('Invalid v2.10 lineage seal');
  return crypto.createHash('sha256').update(seal, 'utf8').digest('hex');
}

export function writeLineageLock() {
  const lock = generateLineageLock();
  fs.mkdirSync(lockDirectory, { recursive: true });
  fs.writeFileSync(lockPath, `${lock}\n`, 'utf8');
  return lock;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeLineageLock());
}