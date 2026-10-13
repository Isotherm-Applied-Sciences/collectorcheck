// CollectorCheck v1 — Deterministic Currency Normalization
// Converts arbitrary currency strings into canonical numeric form (string).

export function normalizeCurrency(input) {
	if (!input) return null;

	// Remove currency symbols and commas
	let v = input.replace(/[$€£,]/g, '').trim();

	// Convert to float deterministically
	const num = Number(v);
	if (isNaN(num)) return null;

	// Always return fixed 2-decimal string
	return num.toFixed(2);
}
