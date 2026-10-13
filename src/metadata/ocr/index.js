// CollectorCheck v1 — Minimal OCR Stub
// Placeholder that returns a deterministic structure without real OCR.

export async function extractTextFromImage(filePath) {
	// In v1, we do not perform real OCR.
	// Deterministic placeholder: echo file path as 'text'.
	return {
		filePath,
		text: '',
		engine: 'stub-ocr',
		confidence: 0
	};
}
