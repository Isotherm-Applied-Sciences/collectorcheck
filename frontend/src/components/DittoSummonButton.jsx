import React from 'react';

export default function DittoSummonButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="button"
      aria-label="Ask Ditto"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        zIndex: 9998,
        padding: '0.5rem 0.875rem',
        borderRadius: '8px'
      }}
    >
      Ask Ditto
    </button>
  );
}