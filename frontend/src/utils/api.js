export const API_BASE_URL = 'http://localhost:4000';

export async function fetchAPI(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api${path}`, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error?.message || result.error || 'Request failed.');
  }
  return result;
}

export async function uploadReceipt(file, metadata = {}) {
  if (!file) throw new Error('Select a receipt file before uploading.');

  const formData = new FormData();
  formData.append('file', file);
  if (metadata.vendor !== undefined) formData.append('vendor', metadata.vendor);
  if (metadata.date !== undefined) formData.append('date', metadata.date);
  if (metadata.amount !== undefined) formData.append('amount', metadata.amount);

  return fetchAPI('/upload', {
    method: 'POST',
    body: formData
  });
}