import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDitto } from '../context/DittoContext.jsx';
import {
  getDittoState,
  resetDitto,
  resetQuietMode,
  resetSkip,
  resetVisitCounter
} from '../utils/ditto.js';

function DittoSettingsPage() {
  const { state, update, enable, disable } = useDitto();
  const navigate = useNavigate();

  function applyReset(resetAction, returnToUpload = false) {
    resetAction();
    update(getDittoState());
    if (returnToUpload) navigate('/upload');
  }

  const isEnabled = state.enabled && !state.skipped;

  return (
    <main className="page">
      <h1>Ditto Settings</h1>

      <section className="card" aria-labelledby="ditto-current-state-heading">
        <h2 id="ditto-current-state-heading">Current Ditto State</h2>
        <pre style={{ marginTop: '1rem', overflowX: 'auto' }}>
          {JSON.stringify(state, null, 2)}
        </pre>
      </section>

      <section className="card" aria-labelledby="ditto-enable-heading">
        <h2 id="ditto-enable-heading">Enable / Disable Ditto</h2>
        <p>Quiet Mode keeps Ditto available from its icon without showing onboarding automatically.</p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button type="button" className="button" disabled={isEnabled} onClick={enable}>
            Re-enable Ditto
          </button>
          <button type="button" className="danger" disabled={!isEnabled} onClick={disable}>
            Disable Ditto
          </button>
        </div>
      </section>

      <section className="card" aria-labelledby="ditto-reset-heading">
        <h2 id="ditto-reset-heading">Reset Ditto</h2>
        <p>Restore all Ditto settings and visit state to their defaults.</p>
        <button type="button" className="button" onClick={() => applyReset(resetDitto)}>
          Reset Ditto
        </button>
      </section>

      <section className="card" aria-labelledby="ditto-onboarding-heading">
        <h2 id="ditto-onboarding-heading">Restart onboarding</h2>
        <p>Reset Ditto and open the Visit 1 onboarding flow.</p>
        <button type="button" className="button" onClick={() => applyReset(resetDitto, true)}>
          Restart onboarding
        </button>
      </section>

      <section className="card" aria-labelledby="ditto-visit-heading">
        <h2 id="ditto-visit-heading">Reset visit counter</h2>
        <p>Set the visit number to 1 without changing other Ditto settings.</p>
        <button type="button" className="button" onClick={() => applyReset(resetVisitCounter)}>
          Reset visit counter
        </button>
      </section>

      <section className="card" aria-labelledby="ditto-quiet-heading">
        <h2 id="ditto-quiet-heading">Clear quiet mode</h2>
        <p>Allow Ditto to appear again after onboarding has completed.</p>
        <button type="button" className="button" onClick={() => applyReset(resetQuietMode, true)}>
          Clear quiet mode
        </button>
      </section>

      <section className="card" aria-labelledby="ditto-skip-heading">
        <h2 id="ditto-skip-heading">Clear skip state</h2>
        <p>Remove the saved Skip Ditto choice. Re-enable Ditto separately if it remains disabled.</p>
        <button type="button" className="button" onClick={() => applyReset(resetSkip)}>
          Clear skip state
        </button>
      </section>
    </main>
  );
}

export default DittoSettingsPage;