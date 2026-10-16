import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { downloadCSV } from '../utils/csv.js';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function VendorReceiptsPage() {
  const { vendor = '' } = useParams();
  const { receipts: sharedReceipts } = useData();
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setStatus(null);
    async function loadReceipts() {
      try {
        const data = await fetchAPI(`/vendors/${encodeURIComponent(vendor)}`);
        if (active) setReceipts(data);
      } catch (error) {
        if (active) setStatus({ type: 'error', message: error.message });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadReceipts();
    return () => { active = false; };
  }, [vendor, sharedReceipts]);

  return (
    <main className="page">
      <h1>Receipts from {vendor}</h1>

      <Link className="button" to="/vendors" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        Back to Vendor Overview
      </Link>

      {!isLoading && !status && (
        <button
          type="button"
          className="button"
          style={{ marginBottom: '1rem' }}
          onClick={() => {
            const rows = [
              ['ID', 'Date', 'Amount', 'Filename'],
              ...receipts.map((receipt) => [
                receipt.id,
                receipt.date || '',
                receipt.amount ?? '',
                receipt.filename
              ])
            ];
            downloadCSV(`vendor_${vendor}.csv`, rows);
          }}
        >
          Export CSV
        </button>
      )}

      {isLoading ? (
        <p>Loading receipts…</p>
      ) : status ? (
        <p style={{ color: '#b91c1c' }}>{status.message}</p>
      ) : receipts.length === 0 ? (
        <p>No receipts found for this vendor.</p>
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

export default VendorReceiptsPage;