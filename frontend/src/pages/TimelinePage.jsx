import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadCSV } from '../utils/csv.js';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function TimelinePage() {
  const { receipts: sharedReceipts } = useData();
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    let active = true;
    async function loadReceipts() {
      try {
        const data = await fetchAPI(`/timeline?sort=${sortDir}`);
        if (active) {
          setReceipts(data);
          setStatus(null);
        }
      } catch (error) {
        if (active) setStatus({ type: 'error', message: error.message });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadReceipts();
    return () => { active = false; };
  }, [sortDir, sharedReceipts]);

  if (isLoading) {
    return (
      <main id="timeline-section" className="page">
        <h1>Receipt Timeline</h1>
        <p>Loading receipts…</p>
      </main>
    );
  }

  if (status) {
    return (
      <main id="timeline-section" className="page">
        <h1>Receipt Timeline</h1>
        <p style={{ color: '#b91c1c' }}>{status.message}</p>
      </main>
    );
  }

  if (receipts.length === 0) {
    return (
      <main id="timeline-section" className="page">
        <h1>Receipt Timeline</h1>
        <button
          type="button"
          className="button"
          style={{ marginBottom: '1rem' }}
          onClick={() => downloadCSV('timeline.csv', [
            ['ID', 'Date', 'Vendor', 'Amount', 'Filename']
          ])}
        >
          Export CSV
        </button>
        <p>No receipts stored yet.</p>
      </main>
    );
  }

  const sortedReceipts = receipts;

  return (
    <main id="timeline-section" className="page">
      <h1>Receipt Timeline</h1>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="timeline-sort"><strong>Sort by date</strong></label>
        <div style={{ marginTop: '0.75rem' }}>
          <select
            id="timeline-sort"
            value={sortDir}
            onChange={(event) => setSortDir(event.target.value)}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text)'
            }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        className="button"
        style={{ marginBottom: '1rem' }}
        onClick={() => {
          const rows = [
            ['ID', 'Date', 'Vendor', 'Amount', 'Filename'],
            ...sortedReceipts.map((receipt) => [
              receipt.id,
              receipt.date || '',
              receipt.vendor || '',
              receipt.amount ?? '',
              receipt.filename
            ])
          ];
          downloadCSV('timeline.csv', rows);
        }}
      >
        Export CSV
      </button>

      <div>
        {sortedReceipts.map((receipt) => (
          <article
            key={receipt.id}
            className="card"
            style={{
              borderLeft: '4px solid var(--button-bg)',
              marginBottom: '1rem'
            }}
          >
            <strong>{receipt.date || '(no date)'}</strong>
            <p style={{ marginTop: '0.5rem' }}>
              <strong>Vendor:</strong> {receipt.vendor || '(none)'} <br />
              <strong>Amount:</strong> {receipt.amount ?? '(none)'} <br />
              <strong>File:</strong> {receipt.filename}
            </p>
            <Link className="button" to={`/receipts/${receipt.id}`}>
              View details
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

export default TimelinePage;