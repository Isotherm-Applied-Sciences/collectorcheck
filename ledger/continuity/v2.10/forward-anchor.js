import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const anchorPath = path.join(repositoryRoot, 'ledger', 'anchor', 'v2.10', 'anchor.sha256');
const continuityDirectory = path.join(repositoryRoot, 'ledger', 'continuity', 'v2.10');
const forwardAnchorPath = path.join(continuityDirectory, 'forward-anchor.sha256');

export function generateForwardAnchor() {
  const anchor = fs.readFileSync(anchorPath, 'utf8').trim();
  if (!/^[a-f0-9]{64}$/.test(anchor)) throw new Error('Invalid v2.10 anchor digest');
  return crypto.createHash('sha256').update(anchor, 'utf8').digest('hex');
}

export function writeForwardAnchor() {
  const forwardAnchor = generateForwardAnchor();
  fs.mkdirSync(continuityDirectory, { recursive: true });
  fs.writeFileSync(forwardAnchorPath, `${forwardAnchor}\n`, 'utf8');
  return forwardAnchor;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeForwardAnchor());
}