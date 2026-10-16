import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getDittoState,
  saveDittoState,
  advanceDittoVisit,
  skipDitto,
  enableDitto,
  disableDitto,
  markDittoShown
} from '../utils/ditto.js';

const DittoContext = createContext(null);

export function DittoProvider({ children }) {
  const [state, setState] = useState(getDittoState);

  useEffect(() => {
    setState(getDittoState());
  }, []);

  function update(newState) {
    saveDittoState(newState);
    setState(newState);
  }

  function doAdvanceVisit() {
    advanceDittoVisit();
    setState(getDittoState());
  }

  function doSkip() {
    skipDitto();
    setState(getDittoState());
  }

  function doEnable() {
    enableDitto();
    setState(getDittoState());
  }

  function doDisable() {
    disableDitto();
    setState(getDittoState());
  }

  function doMarkShown() {
    markDittoShown();
    setState(getDittoState());
  }

  return (
    <DittoContext.Provider
      value={{
        state,
        update,
        advanceVisit: doAdvanceVisit,
        skip: doSkip,
        enable: doEnable,
        disable: doDisable,
        markShown: doMarkShown
      }}
    >
      {children}
    </DittoContext.Provider>
  );
}

export function useDitto() {
  return useContext(DittoContext);
}