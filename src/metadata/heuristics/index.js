// CollectorCheck v1 — Minimal Deterministic Heuristics
// Simple rule-based helpers for metadata confidence scoring.

export function scoreMetadata(fields) {
	let score = 0;

	if (fields.amount) score += 0.4;
	if (fields.date) score += 0.3;
	if (fields.vendor) score += 0.3;

	return Number(score.toFixed(2));
}

export function isLikelyReceipt(fields) {
	// Deterministic rule: amount + vendor OR amount + date
	if (fields.amount && (fields.vendor || fields.date)) {
		return true;
	}
	return false;
}
