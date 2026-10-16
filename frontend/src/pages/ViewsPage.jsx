import React, { useState } from 'react';
import { deleteView, getViews } from '../utils/views.js';

function ViewsPage() {
  const [views, setViews] = useState(() => getViews());

  function remove(name) {
    deleteView(name);
    setViews(getViews());
  }

  const savedViews = Object.entries(views).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <main id="views-section" className="page">
      <h1>Saved Views</h1>
      {savedViews.length === 0 ? (
        <p>No saved views.</p>
      ) : (
        savedViews.map(([name, view]) => (
          <article key={name} className="card">
            <h2>{name}</h2>
            <pre style={{ overflowX: 'auto' }}>{JSON.stringify(view, null, 2)}</pre>
            <button type="button" className="danger" onClick={() => remove(name)}>
              Delete View
            </button>
          </article>
        ))
      )}
    </main>
  );
}

export default ViewsPage;