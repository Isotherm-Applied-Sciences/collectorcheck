import React, { useEffect, useState } from 'react';
import { createCSVBlob } from '../utils/csv.js';
import { createReceiptPDFBlob } from '../utils/pdf.js';
import { createZip } from '../utils/zip.js';
import { useReceiptUpdates } from '../context/DataContext.jsx';
import { API_BASE_URL } from '../utils/api.js';

function BulkExportPage() {
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useReceiptUpdates(setReceipts);

  useEffect(() => {
    async function loadReceipts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/receipts/list`);
        if (!response.ok) {
          throw new Error('Failed to load receipts.');
        }
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        setStatus({ type: 'error', message: error.message });
      } finally {
        setIsLoading(false);
      }
    }

    loadReceipts();
  }, []);

  async function handleExport() {
    setBusy(true);
    setStatus(null);

    try {
      const csvRows = [
        ['ID', 'Filename', 'Vendor', 'Date', 'Amount', 'Raw Metadata'],
        ...receipts.map((receipt) => [
          receipt.id,
          receipt.filename,
          receipt.vendor || '',
          receipt.date || '',
          receipt.amount ?? '',
          receipt.raw_metadata || ''
        ])
      ];
      const files = [{ name: 'receipts.csv', blob: createCSVBlob(csvRows) }];

      for (const receipt of receipts) {
        files.push({
          name: `receipt_${receipt.id}.pdf`,
          blob: await createReceiptPDFBlob(receipt)
        });
      }

      const zipBlob = await createZip(files);
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'collectorcheck_bulk_export.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <h1>Bulk Export</h1>
      {status && <p style={{ color: '#b91c1c' }}>{status.message}</p>}
      {isLoading ? (
        <p>Loading receipts…</p>
      ) : (
        <>
          <p>{receipts.length} receipt{receipts.length === 1 ? '' : 's'} available.</p>
          <button
            type="button"
            className="button"
            disabled={busy || receipts.length === 0}
            onClick={handleExport}
          >
            {busy ? 'Exporting…' : 'Download ZIP (CSV + PDFs)'}
          </button>
        </>
      )}
    </main>
  );
}

export default BulkExportPage;