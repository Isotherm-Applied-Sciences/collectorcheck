import React, { useEffect, useState } from 'react';
import {
  addTagToReceipt,
  getTagsForReceipt,
  removeTagsForReceipt
} from '../utils/tags.js';
import { recordTagAdded, recordTagRemoved, recordVendorCorrection } from '../utils/dittoMemory.js';
import { useData } from '../context/DataContext.jsx';
import { API_BASE_URL, fetchAPI } from '../utils/api.js';

function ReceiptDetailPage({ receiptId, onBack }) {
  const { setReceipts } = useData();
  const [receipt, setReceipt] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tags, setTags] = useState(() => getTagsForReceipt(receiptId));
  const [newTag, setNewTag] = useState('');
  const [vendorPattern, setVendorPattern] = useState('');
  const [correctedVendor, setCorrectedVendor] = useState('');
  const [vendorCorrectionMessage, setVendorCorrectionMessage] = useState('');

  useEffect(() => {
    setTags(getTagsForReceipt(receiptId));
    setNewTag('');
    setVendorCorrectionMessage('');
  }, [receiptId]);

  useEffect(() => {
    if (!receipt) return;
    setVendorPattern(receipt.vendor || '');
    setCorrectedVendor(receipt.vendor || '');
  }, [receipt?.id]);

  async function handleDelete() {
    const confirmed = window.confirm('Are you sure you want to delete this receipt?');
    if (!confirmed) return;

    try {
      await fetchAPI(`/receipts/${encodeURIComponent(receiptId)}`, {
        method: 'DELETE'
      });

      removeTagsForReceipt(receiptId);
      setReceipts((currentReceipts) => currentReceipts.filter((item) => String(item.id) !== String(receiptId)));
      onBack();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete receipt.'
      });
    }
  }

  useEffect(() => {
    let active = true;

    async function loadReceipt() {
      setReceipt(null);
      setStatus(null);
      setIsLoading(true);

      try {
        const data = await fetchAPI(`/receipts/${encodeURIComponent(receiptId)}`);
        if (active) {
          setReceipt(data);
          setTags(data.tags ?? []);
        }
      } catch (error) {
        if (active) {
          setStatus({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to load receipt.'
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadReceipt();
    return () => {
      active = false;
    };
  }, [receiptId]);

  async function saveReceipt(updates) {
    setIsSaving(true);
    setStatus(null);
    try {
      const updated = await fetchAPI(`/receipts/${encodeURIComponent(receiptId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setReceipt(updated);
      setTags(updated.tags);
      removeTagsForReceipt(receiptId);
      updated.tags.forEach((tag) => addTagToReceipt(receiptId, tag));
      setReceipts((currentReceipts) => currentReceipts.map((item) =>
        String(item.id) === String(receiptId) ? updated : item
      ));
      return updated;
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
      return null;
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page">
      <button type="button" onClick={onBack} style={{ marginBottom: '1rem' }}>
        ← Back to list
      </button>

      <h1>Receipt Details</h1>

      {status && (
        <p role="alert" style={{ color: '#b91c1c' }}>{status.message}</p>
      )}

      {isLoading ? (
        <p>Loading…</p>
      ) : receipt ? (
        <>
          <section aria-label="Receipt details" className="card">
            <p><strong>ID:</strong> {receipt.id}</p>
            <p><strong>Filename:</strong> {receipt.filename}</p>
            <p><strong>Vendor:</strong> {receipt.vendor || '(none)'}</p>
            <p><strong>Date:</strong> {receipt.date || '(none)'}</p>
            <p><strong>Amount:</strong> {receipt.amount ?? '(none)'}</p>
            <p><strong>Raw Metadata:</strong></p>
            <pre style={{ background: '#f7f7f7', padding: '0.75rem', borderRadius: '6px', overflowX: 'auto' }}>
              {receipt.raw_metadata || '(none)'}
            </pre>
            <a className="button" href={`${API_BASE_URL}/api/receipts/file/${encodeURIComponent(receipt.id)}`}>
              Download File
            </a>
            <button type="button" className="danger" onClick={handleDelete} style={{ marginLeft: '0.75rem' }}>
              Delete Receipt
            </button>
          </section>

          <section className="card" aria-labelledby="vendor-correction-heading">
            <h2 id="vendor-correction-heading">Remember a vendor correction</h2>
            <p>Save a text pattern and corrected vendor name for future suggestions.</p>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const pattern = vendorPattern.trim();
                const vendor = correctedVendor.trim();
                if (!pattern || !vendor) return;

                if (await saveReceipt({ vendor })) {
                  recordVendorCorrection(pattern, vendor);
                  setVendorCorrectionMessage(`Ditto will remember ${pattern} as ${vendor}.`);
                }
              }}
            >
              <label htmlFor="vendor-correction-pattern">Text pattern</label>
              <input
                id="vendor-correction-pattern"
                value={vendorPattern}
                onChange={(event) => setVendorPattern(event.target.value)}
                placeholder="Example: AMZN"
                required
              />
              <label htmlFor="vendor-correction-name">Correct vendor</label>
              <input
                id="vendor-correction-name"
                value={correctedVendor}
                onChange={(event) => setCorrectedVendor(event.target.value)}
                placeholder="Example: Amazon"
                required
              />
              <button type="submit" className="button" disabled={isSaving}>Remember correction</button>
            </form>
            {vendorCorrectionMessage && <p role="status">{vendorCorrectionMessage}</p>}
          </section>

          <section id="tag-editor" className="card" aria-labelledby="receipt-tags-heading">
            <h2 id="receipt-tags-heading">Tags</h2>
            <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
              {tags.length === 0 ? (
                <p>(no tags)</p>
              ) : (
                tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    disabled={isSaving}
                    onClick={async () => {
                      if (await saveReceipt({ tags: tags.filter((item) => item !== tag) })) recordTagRemoved(tag);
                    }}
                    style={{
                      display: 'inline-block',
                      background: 'var(--button-bg)',
                      color: '#ffffff',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '999px',
                      border: 'none',
                      marginRight: '0.5rem',
                      marginBottom: '0.5rem',
                      font: 'inherit'
                    }}
                  >
                    {tag} ×
                  </button>
                ))
              )}
            </div>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const tag = newTag.trim();
                if (!tag) return;
                if (await saveReceipt({ tags: [...new Set([...tags, tag])] })) {
                  recordTagAdded(tag, receipt);
                  setNewTag('');
                }
              }}
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
            >
              <input
                type="text"
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                placeholder="Add tag"
                aria-label="New tag"
              />
              <button type="submit" className="button" disabled={isSaving}>Add Tag</button>
            </form>
          </section>
        </>
      ) : null}
    </main>
  );
}

export default ReceiptDetailPage;
