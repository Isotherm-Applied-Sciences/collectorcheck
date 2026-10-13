// CollectorCheck v1 — Ingestion Folder Watcher
// Minimal deterministic watcher for a single receipts directory.

import fs from 'fs';
import path from 'path';

const RECEIPTS_DIR = process.env.COLLECTORCHECK_RECEIPTS_DIR || path.join(process.cwd(), 'receipts');

export function getWatchedDirectory() {
	return RECEIPTS_DIR;
}

export function listCurrentFiles() {
	try {
		const entries = fs.readdirSync(RECEIPTS_DIR, { withFileTypes: true });
		return entries
			.filter(e => e.isFile())
			.map(e => path.join(RECEIPTS_DIR, e.name))
			.sort();
	} catch (err) {
		// Deterministic failure mode: return empty list on missing directory
		return [];
	}
}

// Placeholder for future real-time watching; currently deterministic snapshot only.
export function snapshot() {
	return {
		directory: RECEIPTS_DIR,
		files: listCurrentFiles(),
		generatedAt: new Date().toISOString()
	};
}
