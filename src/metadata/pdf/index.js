// CollectorCheck v1 — Minimal PDF Parser Stub
// Placeholder that returns a deterministic structure without real PDF parsing.

export async function extractTextFromPdf(filePath) {
	// In v1, we do not perform real PDF parsing.
	// Deterministic placeholder: echo file path as 'text'.
	return {
		filePath,
		text: '',
		engine: 'stub-pdf',
		confidence: 0
	};
}
