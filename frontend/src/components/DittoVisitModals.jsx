import React from 'react';
import { useDitto } from '../context/DittoContext.jsx';

export function Visit2Modal({ onComplete, onAction }) {
  return (
    <Modal>
      <h2>Ditto</h2>
      <p>Welcome back! Want me to help you scan receipts or organize them?</p>
      <button
        type="button"
        className="button"
        onClick={() => {
          onComplete();
          onAction('scan-receipts');
        }}
      >
        Scan receipts
      </button>
      <button type="button" className="button" style={{ marginLeft: '0.5rem' }} onClick={onComplete}>
        Not now
      </button>
      <SkipButton onComplete={onComplete} />
    </Modal>
  );
}

export function Visit3Modal({ onComplete, onAction }) {
  return (
    <Modal>
      <h2>Ditto</h2>
      <p>Need help sorting or tagging receipts today?</p>
      <button
        type="button"
        className="button"
        onClick={() => {
          onComplete();
          onAction('help-organize');
        }}
      >
        Help me organize
      </button>
      <button type="button" className="button" style={{ marginLeft: '0.5rem' }} onClick={onComplete}>
        Skip
      </button>
      <SkipButton onComplete={onComplete} />
    </Modal>
  );
}

export function Visit4Modal({ onComplete }) {
  return (
    <Modal>
      <h2>Ditto</h2>
      <p>Quick tip: You can upload multiple receipts at once.</p>
      <button type="button" className="button" onClick={onComplete}>Got it</button>
      <SkipButton onComplete={onComplete} />
    </Modal>
  );
}

export function Visit5Modal({ onComplete }) {
  return (
    <Modal>
      <h2>Ditto</h2>
      <p>This is my last onboarding visit. You’re all set, but I’m here if you need me.</p>
      <button type="button" className="button" onClick={onComplete}>Finish</button>
      <SkipButton onComplete={onComplete} />
    </Modal>
  );
}

function SkipButton({ onComplete }) {
  const { skip } = useDitto();

  return (
    <div>
      <button
        type="button"
        className="danger"
        style={{ marginTop: '1rem' }}
        onClick={() => {
          skip();
          onComplete({ skipped: true });
        }}
      >
        Skip Ditto
      </button>
    </div>
  );
}

function Modal({ children }) {
  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ditto-visit-title"
        style={{
          background: 'var(--card-bg)',
          color: 'var(--text)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '2rem',
          width: 'min(420px, 100%)',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
          boxShadow: '0 6px 20px rgba(0,0,0,0.25)'
        }}
      >
        <div id="ditto-visit-title" style={{ display: 'none' }}>Ditto</div>
        {children}
      </section>
    </div>
  );
}