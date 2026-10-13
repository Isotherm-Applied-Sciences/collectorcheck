// CollectorCheck v1 — Deterministic Date Normalization
// Converts arbitrary date strings into canonical YYYY-MM-DD format.

export function normalizeDate(input) {
	if (!input) return null;

	// Attempt ISO first
	const iso = new Date(input);
	if (!isNaN(iso.getTime())) {
		return iso.toISOString().slice(0, 10); // YYYY-MM-DD
	}

	// Deterministic fallback: reject non-parseable dates
	return null;
}
