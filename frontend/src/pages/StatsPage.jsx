import React, { useEffect, useState } from 'react';
import { downloadCSV } from '../utils/csv.js';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function StatsPage() {
  const { receipts } = useData();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadReceipts() {
      try {
        const data = await fetchAPI('/stats');
        if (active) {
          setStats(data);
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
      <main id="stats-section" className="page">
        <h1>Receipt Stats</h1>
        <p>Loading receipt stats…</p>
      </main>
    );
  }

  if (status) {
    return (
      <main id="stats-section" className="page">
        <h1>Receipt Stats</h1>
        <p style={{ color: '#b91c1c' }}>{status.message}</p>
      </main>
    );
  }

  if (!stats || stats.totalReceipts === 0) {
    return (
      <main id="stats-section" className="page">
        <h1>Receipt Stats</h1>
        <button
          type="button"
          className="button"
          style={{ marginBottom: '1rem' }}
          onClick={() => downloadCSV('receipt_stats.csv', [
            ['Metric', 'Value'],
            ['Total receipts', 0],
            ['Total amount', '0.00'],
            ['Average amount', '0.00'],
            ['Earliest date', '(none)'],
            ['Latest date', '(none)']
          ])}
        >
          Export CSV
        </button>
        <p>No receipts stored yet.</p>
      </main>
    );
  }

  const { totalAmount, averageAmount } = stats;
  const earliestDate = stats.earliestDate || '(none)';
  const latestDate = stats.latestDate || '(none)';
  const vendorCounts = new Map();

  receipts.forEach((receipt) => {
    const vendor = String(receipt.vendor ?? '').trim() || '(none)';
    vendorCounts.set(vendor, (vendorCounts.get(vendor) || 0) + 1);
  });

  const sortedVendors = [...vendorCounts.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  const monthlySpending = Object.entries(stats.monthlyTotals || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  const highestMonthlySpend = monthlySpending.reduce(
    (maximum, [, amount]) => Math.max(maximum, amount),
    0
  );

  return (
    <main id="stats-section" className="page">
      <h1>Receipt Stats</h1>

      <button
        type="button"
        className="button"
        style={{ marginBottom: '1rem' }}
        onClick={() => {
          const rows = [
            ['Metric', 'Value'],
            ['Total receipts', stats.totalReceipts],
            ['Total amount', totalAmount.toFixed(2)],
            ['Average amount', averageAmount.toFixed(2)],
            ['Earliest date', earliestDate],
            ['Latest date', latestDate]
          ];
          downloadCSV('receipt_stats.csv', rows);
        }}
      >
        Export CSV
      </button>

      <section className="card" aria-label="Summary statistics">
        <strong>Total receipts:</strong> {stats.totalReceipts} <br />
        <strong>Total amount:</strong> {formatCurrency(totalAmount)} <br />
        <strong>Average amount:</strong> {formatCurrency(averageAmount)} <br />
        <strong>Earliest date:</strong> {earliestDate} <br />
        <strong>Latest date:</strong> {latestDate}
      </section>

      {monthlySpending.length > 0 && (
        <section className="card" aria-labelledby="monthly-spending-heading">
          <h2 id="monthly-spending-heading">Monthly spending</h2>
          {monthlySpending.map(([month, amount]) => (
            <div
              key={month}
              className="month-stat"
              style={{
                padding: '0.75rem',
                marginBottom: '0.5rem',
                background: amount === highestMonthlySpend
                  ? 'rgba(220, 38, 38, 0.1)'
                  : 'transparent',
                borderLeft: amount === highestMonthlySpend ? '4px solid #dc2626' : '4px solid transparent'
              }}
            >
              <strong>{month}</strong>: {formatCurrency(amount)}
              {amount === highestMonthlySpend && <span> · Highest month</span>}
            </div>
          ))}
        </section>
      )}

      {Object.keys(stats.categoryTotals || {}).length > 0 && (
        <section className="card" aria-labelledby="category-totals-heading">
          <h2 id="category-totals-heading">Spending by tag</h2>
          {Object.entries(stats.categoryTotals).sort(([first], [second]) => first.localeCompare(second)).map(([tag, amount]) => (
            <p key={tag}><strong>{tag}</strong>: {formatCurrency(amount)}</p>
          ))}
        </section>
      )}

      <section className="card" aria-labelledby="vendor-frequency-heading">
        <h2 id="vendor-frequency-heading">Vendor frequency</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr>
              <th scope="col" style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>Vendor</th>
              <th scope="col" style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {sortedVendors.map(([vendor, count]) => (
              <tr key={vendor}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>{vendor}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default StatsPage;