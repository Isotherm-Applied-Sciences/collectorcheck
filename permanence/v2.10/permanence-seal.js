import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const continuityCertificatePath = path.join(repositoryRoot, 'continuity-seal', 'v2.10', 'certificate.json');
const permanenceDirectory = path.join(repositoryRoot, 'permanence', 'v2.10');
const permanenceSealPath = path.join(permanenceDirectory, 'permanence-seal.sha256');

export function generatePermanenceSeal() {
  const certificate = fs.readFileSync(continuityCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(certificate, 'utf8').digest('hex');
}

export function writePermanenceSeal() {
  const seal = generatePermanenceSeal();
  fs.mkdirSync(permanenceDirectory, { recursive: true });
  fs.writeFileSync(permanenceSealPath, `${seal}\n`, 'utf8');
  return seal;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writePermanenceSeal());
}