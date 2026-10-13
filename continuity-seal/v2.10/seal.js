import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const survivabilityManifestPath = path.join(repositoryRoot, 'survivability', 'v2.10', 'manifest.json');
const sealDirectory = path.join(repositoryRoot, 'continuity-seal', 'v2.10');
const continuitySealPath = path.join(sealDirectory, 'continuity-seal.sha256');

export function generateContinuitySeal() {
  const manifest = fs.readFileSync(survivabilityManifestPath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(manifest, 'utf8').digest('hex');
}

export function writeContinuitySeal() {
  const seal = generateContinuitySeal();
  fs.mkdirSync(sealDirectory, { recursive: true });
  fs.writeFileSync(continuitySealPath, `${seal}\n`, 'utf8');
  return seal;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeContinuitySeal());
}