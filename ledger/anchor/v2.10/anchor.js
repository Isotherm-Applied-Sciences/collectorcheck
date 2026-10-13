import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const ledgerEntryPath = path.join(repositoryRoot, 'ledger', 'v2.10', 'entry.json');
const anchorDirectory = path.join(repositoryRoot, 'ledger', 'anchor', 'v2.10');
const anchorPath = path.join(anchorDirectory, 'anchor.sha256');

export function generateAnchor() {
  const entry = fs.readFileSync(ledgerEntryPath);
  return crypto.createHash('sha256').update(entry).digest('hex');
}

export function writeAnchor() {
  const anchor = generateAnchor();
  fs.mkdirSync(anchorDirectory, { recursive: true });
  fs.writeFileSync(anchorPath, `${anchor}\n`, 'utf8');
  return anchor;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeAnchor());
}