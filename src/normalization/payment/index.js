// CollectorCheck v1 — Deterministic Payment Method Normalization
// Maps free-text payment methods into canonical set.

const CANONICAL = {
	cash: ['cash'],
	credit: ['credit', 'visa', 'mastercard', 'amex'],
	debit: ['debit'],
	transfer: ['transfer', 'bank', 'ach'],
	mobile: ['apple pay', 'google pay', 'samsung pay'],
	unknown: []
};

export function normalizePayment(input) {
	if (!input) return 'unknown';

	const v = input.toLowerCase().trim();

	for (const [canonical, variants] of Object.entries(CANONICAL)) {
		if (variants.includes(v)) {
			return canonical;
		}
	}

	return 'unknown';
}
