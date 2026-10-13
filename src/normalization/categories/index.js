// CollectorCheck v1 — Deterministic Category Normalization
// Maps free-text categories into a small canonical set.

const CANONICAL = {
	groceries: ['grocery', 'groceries', 'supermarket'],
	transport: ['transport', 'taxi', 'uber', 'lyft', 'bus', 'train'],
	housing: ['rent', 'mortgage', 'housing'],
	utilities: ['utilities', 'electric', 'water', 'gas', 'internet'],
	dining: ['restaurant', 'dining', 'takeout', 'delivery'],
	misc: []
};

export function normalizeCategory(input) {
	if (!input) return null;

	const v = input.toLowerCase().trim();

	for (const [canonical, variants] of Object.entries(CANONICAL)) {
		if (variants.includes(v)) {
			return canonical;
		}
	}

	// Deterministic fallback: if no match, return 'misc'
	return 'misc';
}
