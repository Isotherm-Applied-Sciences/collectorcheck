// CollectorCheck v1 — Minimal Deterministic Field Extraction
// Extracts amount, date, vendor from raw text using simple patterns.

import { normalizeCurrency } from '../../normalization/currency/index.js';
import { normalizeDate } from '../../normalization/dates/index.js';
import { normalizeVendor } from '../../normalization/vendors/index.js';

export function extractFields(rawText) {
	if (!rawText) {
		return {
			amount: null,
			date: null,
			vendor: null
		};
	}

	const text = rawText.toLowerCase();

	// Amount: first number with decimal
	const amountMatch = text.match(/\b\d+\.\d{2}\b/);
	const amount = amountMatch ? normalizeCurrency(amountMatch[0]) : null;

	// Date: ISO-like first match
	const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
	const date = dateMatch ? normalizeDate(dateMatch[0]) : null;

	// Vendor: first word-like token before amount/date
	const vendorMatch = text.match(/^[a-z0-9 ]{3,20}/);
	const vendor = vendorMatch ? normalizeVendor(vendorMatch[0]) : null;

	return { amount, date, vendor };
}
