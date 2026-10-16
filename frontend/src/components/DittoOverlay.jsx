import React from 'react';

export default function DittoOverlay({ targetRect, message, stepLabel, onClose, onNext }) {
  if (!targetRect) return null;

  const { top, left, width, height } = targetRect;
  const bubbleHeight = 150;
  const placeAbove = top + height + bubbleHeight + 24 > window.innerHeight;
  const bubbleTop = placeAbove
    ? Math.max(12, top - bubbleHeight - 16)
    : Math.min(window.innerHeight - bubbleHeight - 12, top + height + 16);
  const bubbleLeft = Math.max(12, Math.min(left, window.innerWidth - 292));

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        overflow: 'hidden'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top,
          left,
          width,
          height,
          border: '3px solid #4da6ff',
          borderRadius: '8px',
          boxShadow: '0 0 0 100vmax rgba(0,0,0,0.58), 0 0 20px rgba(77,166,255,0.8)',
          pointerEvents: 'none'
        }}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Ditto visual guide"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'fixed',
          top: bubbleTop,
          left: bubbleLeft,
          width: 'min(280px, calc(100vw - 1.5rem))',
          padding: '1rem',
          color: 'var(--text)',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
        }}
      >
        <span
          aria-hidden="true"
          style={placeAbove
            ? {
              position: 'absolute',
              bottom: '-9px',
              left: '1.25rem',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderTop: '10px solid var(--card-bg)'
            }
            : {
              position: 'absolute',
              top: '-9px',
              left: '1.25rem',
              width: 0,
              height: 0,
              borderLeft: '9px solid transparent',
              borderRight: '9px solid transparent',
              borderBottom: '10px solid var(--card-bg)'
            }}
        />
        <strong>Ditto</strong>
        {stepLabel && <p style={{ margin: '0.25rem 0' }}>{stepLabel}</p>}
        <p>{message}</p>
        <button type="button" className="button" onClick={onNext || onClose}>
          {onNext ? 'Next' : 'Got it'}
        </button>
        {onNext && (
            <button type="button" className="danger" onClick={onClose} style={{ marginLeft: '0.5rem' }}>
              End tour
            </button>
        )}
      </section>
    </div>
  );
}