import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { uploadReceipt } from '../utils/api.js';

function UploadPage() {
  const { setReceipts } = useData();
  const [file, setFile] = useState(null);
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setStatus({ type: 'error', message: 'Please select a receipt file.' });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const result = await uploadReceipt(file, { vendor, date, amount });

      if (result.id === undefined || result.id === null) {
        throw new Error('Upload response did not include a receipt ID.');
      }

      setReceipts((currentReceipts) => [
        result,
        ...currentReceipts.filter((receipt) => String(receipt.id) !== String(result.id))
      ]);
      navigate(`/upload/success/${encodeURIComponent(result.id)}`);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed.'
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
      <h1>CollectorCheck Receipts U.S.A.</h1>
      <p>Upload a receipt with basic metadata.</p>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <div>
            <label htmlFor="receipt-file">Receipt file</label>
            <br />
            <input
              id="receipt-file"
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setStatus(null);
              }}
            />
          </div>

          <div>
            <label htmlFor="vendor">Vendor</label>
            <br />
            <input id="vendor" type="text" value={vendor} onChange={(event) => setVendor(event.target.value)} />
          </div>

          <div>
            <label htmlFor="date">Date</label>
            <br />
            <input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div>
            <label htmlFor="amount">Amount</label>
            <br />
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          <button id="upload-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Uploading…' : 'Upload receipt'}
          </button>
        </div>
      </form>

      {status && (
        <p role="status" aria-live="polite" style={{ marginTop: '1rem', color: status.type === 'error' ? '#b91c1c' : '#15803d' }}>
          {status.message}
        </p>
      )}
    </main>
  );
}

export default UploadPage;
