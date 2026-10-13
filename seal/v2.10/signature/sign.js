import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const sealPath = path.join(repositoryRoot, 'seal', 'v2.10', 'SEAL.txt');
const signatureDirectory = path.join(repositoryRoot, 'seal', 'v2.10', 'signature');
const signaturePath = path.join(signatureDirectory, 'signature.sha256');

export function generateSignature() {
  const seal = fs.readFileSync(sealPath);
  const digest = crypto.createHash('sha256').update(seal).digest('hex');
  fs.mkdirSync(signatureDirectory, { recursive: true });
  fs.writeFileSync(signaturePath, `${digest}\n`, 'utf8');
  return digest;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  console.log(generateSignature());
}