import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const permanenceCertificatePath = path.join(repositoryRoot, 'permanence', 'v2.10', 'certificate.json');
const canonDirectory = path.join(repositoryRoot, 'canon', 'v2.10');
const canonicalRecordPath = path.join(canonDirectory, 'canonical-record.sha256');

export function generateCanonicalRecord() {
  const certificate = fs.readFileSync(permanenceCertificatePath, 'utf8').replace(/\r\n?/g, '\n');
  return crypto.createHash('sha256').update(certificate, 'utf8').digest('hex');
}

export function writeCanonicalRecord() {
  const record = generateCanonicalRecord();
  fs.mkdirSync(canonDirectory, { recursive: true });
  fs.writeFileSync(canonicalRecordPath, `${record}\n`, 'utf8');
  return record;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(writeCanonicalRecord());
}