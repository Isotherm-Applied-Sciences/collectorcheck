import React from 'react';
import { useDitto } from '../context/DittoContext.jsx';

function SettingsPage() {
  const { state, enable, disable } = useDitto();
  const isDittoEnabled = state.enabled && !state.skipped;

  return (
    <main className="page">
      <h1>Settings</h1>
      <section className="card" aria-labelledby="ditto-settings-heading">
        <h2 id="ditto-settings-heading">Ditto</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <input
            type="checkbox"
            checked={isDittoEnabled}
            onChange={(event) => {
              if (event.target.checked) enable();
              else disable();
            }}
          />
          Enable Ditto
        </label>
        <p>When onboarding is complete, Ditto stays quiet until you open the Ditto icon.</p>
      </section>
    </main>
  );
}

export default SettingsPage;