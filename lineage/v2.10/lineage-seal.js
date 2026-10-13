import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const forwardAnchorPath = path.join(
  repositoryRoot,
  'ledger',
  'continuity',
  'v2.10',
  'forward-anchor.sha256'
);
const lineageDirectory = path.join(repositoryRoot, 'lineage', 'v2.10');
const lineageSealPath = path.join(lineageDirectory, 'lineage-seal.sha256');

export function generateLineageSeal() {
  const forwardAnchor = fs.readFileSync(forwardAnchorPath, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(forwardAnchor)) throw new Error('Invalid v2.10 forward anchor');
  return crypto.createHash('sha256').update(forwardAnchor, 'utf8').digest('hex');
}

export function writeLineageSeal() {
  const seal = generateLineageSeal();
  fs.mkdirSync(lineageDirectory, { recursive: true });
  fs.writeFileSync(lineageSealPath, `${seal}\n`, 'utf8');
  return seal;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeLineageSeal());
}