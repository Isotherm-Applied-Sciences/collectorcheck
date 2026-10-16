import React from 'react';

export default function DittoQuietIcon({ onClick, expanded = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={expanded ? 'Close Ditto' : 'Open Ditto'}
      aria-expanded={expanded}
      aria-controls="ditto-quiet-bubble"
      title="Open Ditto"
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        width: '44px',
        height: '44px',
        padding: 0,
        borderRadius: '50%',
        background: 'var(--button-bg)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999
      }}
    >
      D
    </button>
  );
}