import React from 'react';
import { Link } from 'react-router-dom';

function UploadSuccessPage({ id }) {
  return (
    <main className="page">
      <h1>Receipt Uploaded</h1>
      <p>Your receipt has been stored successfully.</p>

      <div className="card">
        <strong>Stored Receipt ID:</strong> {id}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Link className="button" to={`/receipts/${encodeURIComponent(id)}`}>View this receipt</Link>
        <Link className="button" to="/receipts">View all receipts</Link>
        <Link className="button" to="/upload">Upload another receipt</Link>
      </div>
    </main>
  );
}

export default UploadSuccessPage;
