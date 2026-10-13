// CollectorCheck v1 — Deterministic Filename Normalization
// Strips directory components, normalizes case, and removes unsafe characters.

import path from 'path';

export function normalizeFilename(input) {
	if (!input) return null;

	const base = path.basename(input);
	if (!base) return null;

	// Lowercase and trim
	let f = base.toLowerCase().trim();

	// Replace spaces with underscores
	f = f.replace(/\s+/g, '_');

	// Remove characters that are clearly unsafe for simple storage keys
	f = f.replace(/[^a-z0-9._-]/g, '');

	return f || null;
}
