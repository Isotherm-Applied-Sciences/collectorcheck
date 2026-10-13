import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const canonCertificatePath = path.join(repositoryRoot, 'canon', 'v2.10', 'certificate.json');
const monumentDirectory = path.join(repositoryRoot, 'monument', 'v2.10');
const monumentPath = path.join(monumentDirectory, 'monument.sha256');

export function generateMonumentHash() {
  const certificate = fs.readFileSync(canonCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(certificate, 'utf8').digest('hex');
}

export function writeMonumentHash() {
  const monument = generateMonumentHash();
  fs.mkdirSync(monumentDirectory, { recursive: true });
  fs.writeFileSync(monumentPath, `${monument}\n`, 'utf8');
  return monument;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeMonumentHash());
}