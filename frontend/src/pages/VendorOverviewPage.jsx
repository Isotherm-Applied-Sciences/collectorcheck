import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { downloadCSV } from '../utils/csv.js';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function VendorOverviewPage() {
  const { intel, receipts } = useData();
  const [vendors, setVendors] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadReceipts() {
      try {
        const data = await fetchAPI('/vendors');
        if (active) {
          setVendors(data);
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
  }, [receipts]);

  if (isLoading) {
    return (
      <main id="vendors-section" className="page">
        <h1>Vendor Overview</h1>
        <p>Loading vendors…</p>
      </main>
    );
  }

  if (status) {
    return (
      <main id="vendors-section" className="page">
        <h1>Vendor Overview</h1>
        <p style={{ color: '#b91c1c' }}>{status.message}</p>
      </main>
    );
  }

  if (vendors.length === 0) {
    return (
      <main id="vendors-section" className="page">
        <h1>Vendor Overview</h1>
        <button
          type="button"
          className="button"
          style={{ marginBottom: '1rem' }}
          onClick={() => downloadCSV('vendors.csv', [[
            'Vendor', 'Count', 'Total Amount', 'Average Amount', 'Earliest', 'Latest'
          ]])}
        >
          Export CSV
        </button>
        <p>No receipts stored yet.</p>
      </main>
    );
  }

  const vendorGroups = new Map();
  receipts.forEach((receipt) => {
    const vendor = String(receipt.vendor ?? '') || '(none)';
    const group = vendorGroups.get(vendor) || [];
    group.push(receipt);
    vendorGroups.set(vendor, group);
  });

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);

  const sortedVendors = [...vendors].sort((first, second) =>
    first.name.localeCompare(second.name)
  );
  const vendorSummaries = sortedVendors.map(({ name: vendor, count, total: totalAmount }) => {
    const list = vendorGroups.get(vendor) || [];
    const averageAmount = count ? totalAmount / count : 0;
    const dates = list
      .map((receipt) => receipt.date ? new Date(receipt.date).getTime() : NaN)
      .filter(Number.isFinite);

    return {
      vendor,
      list,
      count,
      totalAmount,
      averageAmount,
      earliest: dates.length
        ? new Date(Math.min(...dates)).toISOString().slice(0, 10)
        : '',
      latest: dates.length
        ? new Date(Math.max(...dates)).toISOString().slice(0, 10)
        : ''
    };
  });

  return (
    <main id="vendors-section" className="page">
      <h1>Vendor Overview</h1>

      <button
        type="button"
        className="button"
        style={{ marginBottom: '1rem' }}
        onClick={() => {
          const rows = [
            ['Vendor', 'Count', 'Total Amount', 'Average Amount', 'Earliest', 'Latest'],
            ...vendorSummaries.map(({ vendor, count, totalAmount, averageAmount, earliest, latest }) => [
              vendor,
              count,
              totalAmount.toFixed(2),
              averageAmount.toFixed(2),
              earliest,
              latest
            ])
          ];
          downloadCSV('vendors.csv', rows);
        }}
      >
        Export CSV
      </button>

      {vendorSummaries.map(({ vendor, list, count, totalAmount, averageAmount, earliest, latest }) => {
        const inferredReceipts = intel?.vendorHints.filter((hint) =>
          list.some((receipt) => receipt.id === hint.id)
        ) || [];

        return (
        <article
          key={vendor}
          className="card"
          style={inferredReceipts.length > 0
            ? { background: 'rgba(217, 119, 6, 0.12)', borderColor: '#d97706' }
            : undefined}
        >
          <h2>{vendor}</h2>
          {inferredReceipts.length > 0 && (
            <p><strong>Ditto vendor hints:</strong> {inferredReceipts.map((hint) => hint.vendor).join(', ')}</p>
          )}
          <p style={{ marginTop: '0.5rem' }}>
            <strong>Receipts:</strong> {count} <br />
            <strong>Total amount:</strong> {formatCurrency(totalAmount)} <br />
            <strong>Average amount:</strong> {formatCurrency(averageAmount)} <br />
            <strong>Earliest date:</strong> {earliest || '(none)'} <br />
            <strong>Latest date:</strong> {latest || '(none)'}
          </p>
          <Link className="button" to={`/vendors/${encodeURIComponent(vendor)}`}>
            View receipts from this vendor
          </Link>
        </article>
        );
      })}
    </main>
  );
}

export default VendorOverviewPage;