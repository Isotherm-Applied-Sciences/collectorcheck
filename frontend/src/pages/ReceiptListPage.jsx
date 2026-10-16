import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { downloadCSV } from '../utils/csv.js';
import { getTagsForReceipt } from '../utils/tags.js';
import { getViews, loadView, saveView } from '../utils/views.js';
import { useData, useReceiptUpdates } from '../context/DataContext.jsx';
import { recordViewOpened } from '../utils/dittoMemory.js';
import { fetchAPI } from '../utils/api.js';

function ReceiptListPage() {
  const { setReceipts: setSharedReceipts, intel } = useData();
  const location = useLocation();
  const [receipts, setReceipts] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [views, setViews] = useState(() => getViews());
  const [selectedView, setSelectedView] = useState('');
  const [viewName, setViewName] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const skipNextPageReset = useRef(false);
  const pageSize = 10;

  useReceiptUpdates(setReceipts);

  const searchText = search.trim().toLowerCase();
  const tagFilterText = tagFilter.trim().toLowerCase();
  const filteredReceipts = receipts.filter((receipt) => {
    const searchableFields = [
      receipt.id,
      receipt.filename,
      receipt.vendor,
      receipt.date,
      receipt.amount
    ];

    const matchesSearch = searchableFields.some((value) =>
      String(value ?? '').toLowerCase().includes(searchText)
    );

    const matchesTag = !tagFilterText || (receipt.tags ?? getTagsForReceipt(receipt.id)).some((tag) =>
      tag.toLowerCase() === tagFilterText
    );

    return matchesSearch && matchesTag;
  });

  function sortReceipts(list) {
    const sorted = [...list];

    sorted.sort((a, b) => {
      let x = a[sortField];
      let y = b[sortField];

      if (x === null || x === undefined) x = '';
      if (y === null || y === undefined) y = '';

      if (sortField === 'amount' || sortField === 'id') {
        x = Number(x);
        y = Number(y);
      }

      if (sortField === 'date') {
        x = x ? new Date(x).getTime() : 0;
        y = y ? new Date(y).getTime() : 0;
      }

      if (x < y) return sortDir === 'asc' ? -1 : 1;
      if (x > y) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  const filteredSorted = sortReceipts(filteredReceipts);
  const totalPages = Math.ceil(filteredSorted.length / pageSize);
  const paginated = filteredSorted.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    if (skipNextPageReset.current) {
      skipNextPageReset.current = false;
      return;
    }
    setPage(1);
  }, [search, sortField, sortDir, tagFilter]);

  useEffect(() => {
    const lastPage = Math.max(1, totalPages);
    if (page > lastPage) setPage(lastPage);
  }, [page, totalPages]);

  useEffect(() => {
    const viewName = new URLSearchParams(location.search).get('view');
    if (!viewName) return;
    const view = loadView(viewName);
    if (!view) return;

    recordViewOpened(viewName);
    setSearch(typeof view.search === 'string' ? view.search : '');
    setSortField(['id', 'filename', 'vendor', 'date', 'amount'].includes(view.sortField)
      ? view.sortField
      : 'id');
    setSortDir(view.sortDir === 'desc' ? 'desc' : 'asc');
    setTagFilter(typeof view.tagFilter === 'string' ? view.tagFilter : '');
    setPage(Number.isInteger(view.page) && view.page > 0 ? view.page : 1);
  }, [location.search]);

  useEffect(() => {
    let active = true;
    async function loadReceipts() {
      try {
        setIsLoading(true);
        setStatus(null);
        const data = await fetchAPI('/receipts');
        if (active) {
          setReceipts(data);
          setSharedReceipts(data);
        }
      } catch (error) {
        if (active) setStatus({ type: 'error', message: error.message });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadReceipts();
    return () => { active = false; };
  }, [setSharedReceipts]);

  function getReceiptStyle(receipt) {
    if (!intel) return {};

    const hasAnomaly = intel.anomalies.some((anomaly) =>
      anomaly.id === receipt.id || anomaly.ids?.includes(receipt.id)
    );
    if (hasAnomaly) {
      return { border: '2px solid #dc2626', background: 'rgba(220, 38, 38, 0.08)' };
    }

    if (intel.vendorHints.some((hint) => hint.id === receipt.id)) {
      return { border: '2px solid #d97706', background: 'rgba(217, 119, 6, 0.1)' };
    }

    return {};
  }

  return (
    <main className="page">
      <h1>Stored Receipts</h1>
      <p>All receipts currently saved in CollectorCheck.</p>

      {status && (
        <p style={{ color: '#b91c1c' }}>{status.message}</p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const name = viewName.trim();
            if (!name) return;
            saveView(name, { search, sortField, sortDir, tagFilter, page });
            setViews(getViews());
            setSelectedView('');
            setViewName('');
            setSaveMessage(`Saved view: ${name}`);
          }}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            value={viewName}
            onChange={(event) => setViewName(event.target.value)}
            aria-label="Saved view name"
            placeholder="Name this view"
            required
          />
          <button type="submit" className="button">Save View</button>
        </form>
        <label>
          <span className="visually-hidden">Load saved view</span>
          <select
            aria-label="Load saved view"
            value={selectedView}
            onChange={(event) => {
              const name = event.target.value;
              setSelectedView('');
              if (!name) return;

              const view = loadView(name);
              if (!view) return;
              recordViewOpened(name);

              const nextSearch = typeof view.search === 'string' ? view.search : '';
              const nextSortField = ['id', 'filename', 'vendor', 'date', 'amount'].includes(view.sortField)
                ? view.sortField
                : 'id';
              const nextSortDir = view.sortDir === 'desc' ? 'desc' : 'asc';
              const nextTagFilter = typeof view.tagFilter === 'string' ? view.tagFilter : '';
              const nextPage = Number.isInteger(view.page) && view.page > 0 ? view.page : 1;
              const filtersChanged = search !== nextSearch || sortField !== nextSortField ||
                sortDir !== nextSortDir || tagFilter !== nextTagFilter;

              skipNextPageReset.current = filtersChanged;
              setSearch(nextSearch);
              setSortField(nextSortField);
              setSortDir(nextSortDir);
              setTagFilter(nextTagFilter);
              setPage(nextPage);
            }}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid var(--card-border)',
              background: 'var(--card-bg)',
              color: 'var(--text)'
            }}
          >
            <option value="">Load Saved View…</option>
            {Object.keys(views).sort((a, b) => a.localeCompare(b)).map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      {saveMessage && <p role="status">{saveMessage}</p>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="receipt-search"><strong>Search receipts</strong></label>
        <input
          id="receipt-search"
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by vendor, date, amount, filename, or ID"
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--text)'
          }}
        />
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="receipt-tag-filter"><strong>Filter by tag</strong></label>
        <input
          id="receipt-tag-filter"
          type="text"
          value={tagFilter}
          onChange={(event) => setTagFilter(event.target.value)}
          placeholder="Tag name"
          style={{
            width: '100%',
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '6px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--text)'
          }}
        />
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <strong>Sort receipts</strong>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
          <label>
            <span className="visually-hidden">Sort field</span>
            <select
              aria-label="Sort field"
              value={sortField}
              onChange={(event) => setSortField(event.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text)'
              }}
            >
              <option value="id">ID</option>
              <option value="filename">Filename</option>
              <option value="vendor">Vendor</option>
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </label>
          <label>
            <span className="visually-hidden">Sort direction</span>
            <select
              aria-label="Sort direction"
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
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <strong>Page {page} of {totalPages || 1}</strong>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {!isLoading && !status && (
        <button
          type="button"
          className="button"
          style={{ marginBottom: '1rem' }}
          onClick={() => {
            const rows = [
              ['ID', 'Filename', 'Vendor', 'Date', 'Amount'],
              ...filteredSorted.map((receipt) => [
                receipt.id,
                receipt.filename,
                receipt.vendor || '',
                receipt.date || '',
                receipt.amount ?? ''
              ])
            ];
            downloadCSV('receipts.csv', rows);
          }}
        >
          Export CSV
        </button>
      )}

      {isLoading ? (
        <p>Loading receipts…</p>
      ) : receipts.length === 0 ? (
        <p>No receipts stored yet.</p>
      ) : paginated.length === 0 ? (
        <p>No matching receipts.</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {paginated.map((receipt) => (
            <li
              key={receipt.id}
              className="receipt-item"
              style={getReceiptStyle(receipt)}
            >
              <Link
                to={`/receipts/${receipt.id}`}
                aria-label={`View receipt ${receipt.id}`}
                style={{ display: 'block', color: 'inherit', textDecoration: 'none' }}
              >
                <strong>ID:</strong> {receipt.id} <br />
                <strong>File:</strong> {receipt.filename} <br />
                <strong>Vendor:</strong> {receipt.vendor || '(none)'} <br />
                <strong>Date:</strong> {receipt.date || '(none)'} <br />
                <strong>Amount:</strong> {receipt.amount ?? '(none)'}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default ReceiptListPage;
