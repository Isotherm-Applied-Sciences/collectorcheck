// CollectorCheck v1 — Deterministic Vendor Normalization
// Lowercase, trim, remove punctuation, collapse whitespace.

export function normalizeVendor(input) {
	if (!input) return null;

	let v = input.toLowerCase().trim();

	// Remove punctuation deterministically
	v = v.replace(/[.,;:!?]/g, '');

	// Collapse multiple spaces
	v = v.replace(/\s+/g, ' ');

	return v;
}
