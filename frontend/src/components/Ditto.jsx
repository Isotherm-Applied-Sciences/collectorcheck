import React, { useState } from 'react';
import { useDitto } from '../context/DittoContext.jsx';
import { getDittoHelpForPage } from '../utils/dittoContextHelp.js';

const EMOTION_TONE_STYLES = {
  nostalgic: { color: '#b45309' },
  supportive: { color: '#2563eb' },
  warm: { color: '#c2410c' },
  reassuring: { color: '#047857' },
  celebratory: { color: '#a16207' }
};

function getMessage(reason, page, suggestion, emotion) {
  switch (reason) {
    case 'visit1-full-onboarding':
      return (
        <>
          <p><strong>Welcome to CollectorCheck!</strong></p>
          <p>I’m Ditto, your setup assistant. I can help you scan receipts, organize them, and get your dashboard ready.</p>
          <p>Would you like help getting started?</p>
        </>
      );
    case 'visit2-short-onboarding':
      return <p>Welcome back! Want me to scan your receipts or help organize them?</p>;
    case 'visit3-minimal-onboarding':
      return <p>Need help sorting or tagging receipts today?</p>;
    case 'visit4-micro-ditto':
      return <p>Quick tip: You can upload multiple receipts at once.</p>;
    case 'visit5-final':
      return <p>This is my last onboarding visit. You’re all set, but I’m here if you need me.</p>;
    case 'summoned':
      {
        const help = getDittoHelpForPage(page);
        return (
          <>
            <p><strong>{help.title}</strong></p>
            <p>{help.message}</p>
          </>
        );
      }
    case 'smart-suggestion':
      return suggestion ? (
        <>
          <p><strong>{suggestion.title}</strong></p>
          <p>{suggestion.message}</p>
        </>
      ) : null;
    case 'emotion':
      return emotion ? (
        <>
          <p><strong>{emotion.title}</strong></p>
          <p style={EMOTION_TONE_STYLES[emotion.tone] || {}}>{emotion.message}</p>
        </>
      ) : null;
    default:
      return null;
  }
}

export default function Ditto({
  reason,
  visit,
  page,
  suggestion,
  emotion,
  onAction,
  onDismiss,
  summoned = false
}) {
  const { skip } = useDitto();
  const [dismissed, setDismissed] = useState(false);

  function handle(action) {
    if (onAction) onAction(action);
  }

  function handleSuggestionAction(action) {
    if (onAction) onAction(action, suggestion);
  }

  if (dismissed) return null;

  return (
    <aside
      role="region"
      aria-label={`Ditto setup assistant, visit ${visit}`}
      style={{
        position: 'fixed',
        bottom: summoned ? '4.75rem' : '1rem',
        left: summoned ? '1rem' : undefined,
        right: summoned ? undefined : '1rem',
        zIndex: 9999,
        width: 'min(320px, calc(100vw - 2rem))'
      }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          color: 'var(--text)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <div style={{ marginBottom: '0.75rem' }}>
          <strong>Ditto</strong>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          {getMessage(reason, page, suggestion, emotion)}
        </div>

        {reason === 'smart-suggestion' ? (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button type="button" className="button" onClick={() => handleSuggestionAction(suggestion.action)}>
              Yes, help me
            </button>
            <button type="button" className="danger" onClick={() => handle('dismiss')}>
              Dismiss
            </button>
          </div>
        ) : reason === 'emotion' ? (
          <div style={{ marginBottom: '1rem' }}>
            {emotion?.tone === 'supportive' && (
              <button type="button" className="button" onClick={() => handle('help-organize')}>
                Help organize
              </button>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="button"
              style={{ marginBottom: '0.5rem', width: '100%' }}
              onClick={() => handle('scan-receipts')}
            >
              Scan receipts
            </button>
            <button
              type="button"
              className="button"
              style={{ marginBottom: '0.5rem', width: '100%' }}
              onClick={() => handle('scan-email')}
            >
              Scan email for receipts
            </button>
            <button
              type="button"
              className="button"
              style={{ marginBottom: '0.5rem', width: '100%' }}
              onClick={() => handle('show-around')}
            >
              Show me around
            </button>
            <button
              type="button"
              className="button"
              style={{ width: '100%' }}
              onClick={() => handle('help-organize')}
            >
              Help me organize
            </button>
            <details style={{ marginTop: '0.75rem' }}>
              <summary>Highlight a feature</summary>
              <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
                <button type="button" className="button" onClick={() => handle('overlay-upload')}>Upload receipts</button>
                <button type="button" className="button" onClick={() => handle('overlay-tags')}>Tags</button>
                <button type="button" className="button" onClick={() => handle('overlay-views')}>Saved Views</button>
                <button type="button" className="button" onClick={() => handle('overlay-vendors')}>Vendors</button>
                <button type="button" className="button" onClick={() => handle('overlay-stats')}>Stats</button>
                <button type="button" className="button" onClick={() => handle('overlay-timeline')}>Timeline</button>
                <button type="button" className="button" onClick={() => handle('arrow-upload-to-tags')}>Show upload → tags path</button>
                <button type="button" className="button" onClick={() => handle('arrow-tags-to-views')}>Show tags → views path</button>
                <button type="button" className="button" onClick={() => handle('arrow-views-to-stats')}>Show views → stats path</button>
                <button type="button" className="button" onClick={() => handle('arrow-stats-to-timeline')}>Show stats → timeline path</button>
              </div>
            </details>
            <details style={{ marginTop: '0.75rem' }}>
              <summary>Automate receipts</summary>
              <div style={{ display: 'grid', gap: '0.35rem', marginTop: '0.5rem' }}>
                <button type="button" className="button" onClick={() => handle('auto-tag')}>Auto-tag receipts</button>
                <button type="button" className="button" onClick={() => handle('auto-vendor')}>Auto-infer vendors</button>
                <button type="button" className="button" onClick={() => handle('auto-group')}>Auto-group receipts</button>
                <button type="button" className="button" onClick={() => handle('auto-views')}>Auto-create saved views</button>
                <button type="button" className="danger" onClick={() => handle('auto-dedupe')}>Review duplicates</button>
              </div>
            </details>
          </div>
        )}

        {reason !== 'smart-suggestion' && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="button"
              style={{ flex: 1 }}
              onClick={() => {
                setDismissed(true);
                if (onDismiss) onDismiss();
              }}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="danger"
              style={{ flex: 1 }}
              onClick={skip}
            >
              Skip Ditto
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}