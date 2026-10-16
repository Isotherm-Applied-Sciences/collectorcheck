import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentFile = fileURLToPath(import.meta.url);
const servicesDirectory = path.dirname(currentFile);
const backendDirectory = path.resolve(servicesDirectory, '..', '..');

export const uploadDirectory = path.join(backendDirectory, 'uploads');
