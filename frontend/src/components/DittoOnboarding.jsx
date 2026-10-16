import React, { useState } from 'react';
import { useDitto } from '../context/DittoContext.jsx';

export default function DittoOnboarding({ onComplete, onAction }) {
  const { skip } = useDitto();
  const [step, setStep] = useState(1);

  function next() {
    setStep((currentStep) => Math.min(currentStep + 1, 5));
  }

  function finish() {
    onComplete();
  }

  function doSkip() {
    skip();
    onComplete({ skipped: true });
  }

  function chooseAction(action) {
    onComplete();
    onAction(action);
  }

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
        aria-labelledby="ditto-onboarding-title"
        aria-describedby="ditto-onboarding-content"
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
        <h2 id="ditto-onboarding-title" style={{ marginBottom: '1rem' }}>Ditto</h2>
        <div id="ditto-onboarding-content" aria-live="polite">
          {step === 1 && (
            <>
              <p><strong>Welcome to CollectorCheck!</strong></p>
              <p>I’m Ditto, your setup assistant. I’ll help you get started quickly.</p>
              <button type="button" className="button" onClick={next}>Continue</button>
            </>
          )}

          {step === 2 && (
            <>
              <p>Would you like me to scan your receipts now?</p>
              <button type="button" className="button" onClick={() => chooseAction('scan-receipts')}>
                Scan receipts
              </button>
              <button type="button" className="button" style={{ marginLeft: '0.5rem' }} onClick={next}>
                Not now
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <p>Do you want me to scan your email for receipts?</p>
              <button type="button" className="button" onClick={() => chooseAction('scan-email')}>
                Scan email
              </button>
              <button type="button" className="button" style={{ marginLeft: '0.5rem' }} onClick={next}>
                Skip
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <p>I can show you around the app if you’d like.</p>
              <button
                type="button"
                className="button"
                onClick={() => {
                  onAction('show-around');
                  next();
                }}
              >
                Show me around
              </button>
              <button type="button" className="button" style={{ marginLeft: '0.5rem' }} onClick={next}>
                Skip
              </button>
            </>
          )}

          {step === 5 && (
            <>
              <p>You’re all set! I’ll appear a few more times to help, then stay quiet.</p>
              <button type="button" className="button" onClick={finish}>Finish onboarding</button>
            </>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span aria-label={`Step ${step} of 5`}>Step {step} of 5</span>
          <button type="button" className="danger" onClick={doSkip}>Skip Ditto</button>
        </div>
      </section>
    </div>
  );
}