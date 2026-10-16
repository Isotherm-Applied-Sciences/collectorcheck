import React from 'react';

export default function DittoQuietBubble({ onClose }) {
  return (
    <aside
      id="ditto-quiet-bubble"
      role="region"
      aria-label="Ditto quiet mode"
      style={{
        position: 'fixed',
        bottom: '4.75rem',
        right: '1rem',
        zIndex: 9999,
        width: 'min(320px, calc(100vw - 2rem))'
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          color: 'var(--text)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <strong>Ditto</strong>
        <p>Hi! I’m here if you need help. Just ask.</p>
        <button type="button" className="button" onClick={onClose}>Close</button>
      </div>
    </aside>
  );
}