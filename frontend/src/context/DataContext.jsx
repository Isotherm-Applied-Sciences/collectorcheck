import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getViews, saveViews } from '../utils/views.js';
import { fetchAPI } from '../utils/api.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [receipts, setReceiptState] = useState([]);
  const [intel, setIntel] = useState(null);
  const [views, setViewState] = useState(() => getViews());
  const receiptsRef = useRef(receipts);

  useEffect(() => {
    receiptsRef.current = receipts;
  }, [receipts]);

  const setReceipts = useCallback((nextReceipts) => {
    const updated = typeof nextReceipts === 'function'
      ? nextReceipts(receiptsRef.current)
      : nextReceipts;
    receiptsRef.current = updated;
    setReceiptState(updated);
    window.dispatchEvent(new CustomEvent('collectorcheck:receipts-updated', {
      detail: { receipts: updated }
    }));
  }, []);

  const setViews = useCallback((nextViews) => {
    setViewState((currentViews) => {
      const updated = typeof nextViews === 'function' ? nextViews(currentViews) : nextViews;
      saveViews(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function loadReceipts() {
      try {
        const data = await fetchAPI('/receipts');
        if (active) setReceipts(data);
      } catch {
        if (active) setReceipts([]);
      }
    }

    loadReceipts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DataContext.Provider value={{ receipts, setReceipts, intel, setIntel, views, setViews }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider.');
  return context;
}

export function useReceiptUpdates(setReceipts) {
  useEffect(() => {
    function handleReceiptUpdate(event) {
      if (Array.isArray(event.detail?.receipts)) setReceipts(event.detail.receipts);
    }

    window.addEventListener('collectorcheck:receipts-updated', handleReceiptUpdate);
    return () => window.removeEventListener('collectorcheck:receipts-updated', handleReceiptUpdate);
  }, [setReceipts]);
}