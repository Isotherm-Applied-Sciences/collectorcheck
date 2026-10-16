import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { fetchAPI } from '../utils/api.js';

function TagsPage() {
  const { intel, receipts } = useData();
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadReceipts() {
      try {
        const data = await fetchAPI('/tags');
        if (active) {
          setTags(data);
          setStatus(null);
        }
      } catch (error) {
        if (active) setStatus({ type: 'error', message: error.message });
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadReceipts();
    return () => { active = false; };
  }, [receipts]);

  const clusters = Object.entries(intel?.clusters || {});

  return (
    <main id="tags-section" className="page">
      <h1>Tags</h1>
      {status && <p role="alert" style={{ color: '#b91c1c' }}>{status.message}</p>}
      {isLoading ? (
        <p>Loading tags…</p>
      ) : status ? null : tags.length === 0 && clusters.length === 0 ? (
        <p>No tags created yet.</p>
      ) : (
        <>
          {tags.map(({ name: tag, count }) => {
            const clusterCount = intel?.clusters?.[tag];
            return (
              <article
                key={tag}
                className="card"
                style={clusterCount
                  ? { background: 'rgba(37, 99, 235, 0.09)', borderColor: '#2563eb' }
                  : undefined}
              >
                <h2>{tag}</h2>
                <p>{count} receipt{count === 1 ? '' : 's'}</p>
                <Link className="button" to={`/tags/${encodeURIComponent(tag)}`}>
                  View receipts with this tag
                </Link>
              </article>
            );
          })}
          {clusters.length > 0 && (
            <section className="card" aria-labelledby="ditto-clusters-heading">
              <h2 id="ditto-clusters-heading">Ditto receipt clusters</h2>
              {clusters.map(([cluster, count]) => (
                <div
                  key={cluster}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: 'rgba(37, 99, 235, 0.09)',
                    borderLeft: '4px solid #2563eb'
                  }}
                >
                  <strong>{cluster}</strong>: {count} receipts
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default TagsPage;