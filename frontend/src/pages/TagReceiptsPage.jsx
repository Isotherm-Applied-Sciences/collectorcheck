import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createCSVBlob } from '../utils/csv.js';
import { createReceiptPDFBlob } from '../utils/pdf.js';
import { createZip } from '../utils/zip.js';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TagReceiptsPage() {
  const { tag = '' } = useParams();
  const { receipts: sharedReceipts } = useData();
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadReceipts() {
      try {
        const data = await fetchAPI(`/tags/${encodeURIComponent(tag)}`);
        if (active) setReceipts(data);
      } catch (error) {
        if (active) setStatus({ type: 'error', message: error.message });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    setIsLoading(true);
    setStatus(null);
    loadReceipts();
    return () => {
      active = false;
    };
  }, [tag, sharedReceipts]);

  async function handleExportZip() {
    setIsExporting(true);
    setStatus(null);

    try {
      const files = [{
        name: 'receipts.csv',
        blob: createCSVBlob([
          ['ID', 'Date', 'Vendor', 'Amount', 'Filename', 'Tags'],
          ...receipts.map((receipt) => [
            receipt.id,
            receipt.date || '',
            receipt.vendor || '',
            receipt.amount ?? '',
            receipt.filename,
            tag
          ])
        ])
      }];

      for (const receipt of receipts) {
        files.push({
          name: `receipt_${receipt.id}.pdf`,
          blob: await createReceiptPDFBlob(receipt)
        });
      }

      const zipBlob = await createZip(files);
      const safeTag = tag.replace(/[^a-z0-9_-]+/gi, '_');
      downloadBlob(`tag_${safeTag}_export.zip`, zipBlob);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsExporting(false);
    }
  }

  const safeTag = tag.replace(/[^a-z0-9_-]+/gi, '_');

  return (
    <main className="page">
      <h1>Receipts tagged “{tag}”</h1>
      <Link className="button" to="/tags" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Tags
      </Link>

      {status && <p role="alert" style={{ color: '#b91c1c' }}>{status.message}</p>}

      {!isLoading && !status && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button"
            onClick={() => downloadBlob(`tag_${safeTag}.csv`, createCSVBlob([
              ['ID', 'Date', 'Vendor', 'Amount', 'Filename', 'Tags'],
              ...receipts.map((receipt) => [
                receipt.id,
                receipt.date || '',
                receipt.vendor || '',
                receipt.amount ?? '',
                receipt.filename,
                tag
              ])
            ]))}
          >
            Export CSV
          </button>
          <button
            type="button"
            className="button"
            disabled={isExporting || receipts.length === 0}
            onClick={handleExportZip}
          >
            {isExporting ? 'Exporting…' : 'Export PDFs (ZIP)'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p>Loading receipts…</p>
      ) : status ? null : receipts.length === 0 ? (
        <p>No receipts found for this tag.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {receipts.map((receipt) => (
            <li key={receipt.id} className="receipt-item">
              <strong>ID:</strong> {receipt.id} <br />
              <strong>Date:</strong> {receipt.date || '(none)'} <br />
              <strong>Amount:</strong> {receipt.amount ?? '(none)'} <br />
              <Link
                className="button"
                to={`/receipts/${receipt.id}`}
                style={{ marginTop: '0.5rem', display: 'inline-block' }}
              >
                View details
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default TagReceiptsPage;