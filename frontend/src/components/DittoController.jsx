import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDitto } from '../context/DittoContext.jsx';
import Ditto from './Ditto.jsx';
import DittoOnboarding from './DittoOnboarding.jsx';
import {
  Visit2Modal,
  Visit3Modal,
  Visit4Modal,
  Visit5Modal
} from './DittoVisitModals.jsx';
import DittoQuietIcon from './DittoQuietIcon.jsx';
import DittoQuietBubble from './DittoQuietBubble.jsx';
import DittoSummonButton from './DittoSummonButton.jsx';
import DittoOverlay from './DittoOverlay.jsx';
import DittoArrow from './DittoArrow.jsx';
import {
  getDittoSmartSuggestion,
  shouldShowDittoSmartSuggestion
} from '../utils/dittoSmartSuggestions.js';
import { analyzeReceipts } from '../utils/dittoIntelligence.js';
import { useData } from '../context/DataContext.jsx';
import {
  getDittoMemory,
  recordAutomationUsed,
  updateDittoMemory
} from '../utils/dittoMemory.js';
import { parseDittoIntent } from '../utils/dittoPredictive.js';
import { getEmotionalMoment } from '../utils/dittoEmotion.js';
import {
  autoCreateViews,
  autoGroupReceipts,
  autoInferVendors,
  autoRemoveDuplicates,
  autoTagReceipts,
  getDuplicateReceiptIds
} from '../utils/dittoAutomation.js';
import { getTagsForReceipt, removeTagsForReceipt } from '../utils/tags.js';
import { API_BASE_URL } from '../utils/api.js';

const PENDING_OVERLAY_KEY = 'collectorcheck_pending_overlay';
const AUTOMATION_ACTIONS = new Set([
  'auto-tag', 'auto-tag-high-value', 'auto-vendor', 'auto-group', 'auto-views', 'auto-dedupe'
]);

const OVERLAY_ACTIONS = {
  'overlay-upload': {
    selector: '#upload-button',
    page: 'upload',
    navigateAction: 'scan-receipts',
    message: 'This is where you upload receipts.'
  },
  'overlay-tags': {
    selector: '#tag-editor, #tags-section',
    page: 'tags',
    navigateAction: 'help-organize',
    message: 'Tags help you organize receipts into groups.'
  },
  'overlay-views': {
    selector: '#views-section',
    page: 'views',
    navigateAction: 'views',
    message: 'Saved Views let you store useful search and sorting presets.'
  },
  'overlay-vendors': {
    selector: '#vendors-section',
    page: 'vendors',
    navigateAction: 'vendors',
    message: 'Your vendor list groups receipts so you can review spending by merchant.'
  },
  'overlay-stats': {
    selector: '#stats-section',
    page: 'stats',
    navigateAction: 'stats',
    message: 'Stats summarize totals, monthly spending, and vendor frequency.'
  },
  'overlay-timeline': {
    selector: '#timeline-section',
    page: 'timeline',
    navigateAction: 'timeline',
    message: 'The timeline lays receipts out by date.'
  }
};

const TOUR_STEPS = [
  { selector: 'nav a[href="/upload"]', message: 'Upload receipt images or PDFs here.' },
  { selector: 'nav a[href="/receipts"]', message: 'Open your receipt list to search, filter, and sort.' },
  { selector: 'nav a[href="/tags"]', message: 'Use tags to organize receipts into groups.' },
  { selector: 'nav a[href="/views"]', message: 'Saved Views keep useful filters and sorting presets.' },
  { selector: 'nav a[href="/stats"]', message: 'Review totals and monthly spending in Stats.' },
  { selector: 'nav a[href="/timeline"]', message: 'Browse receipts in date order on the Timeline.' },
  { selector: 'nav a[href="/vendors"]', message: 'Compare receipts grouped by vendor.' }
];

const ARROW_ACTIONS = {
  'arrow-upload-to-tags': ['nav a[href="/upload"]', 'nav a[href="/tags"]'],
  'arrow-tags-to-views': ['nav a[href="/tags"]', 'nav a[href="/views"]'],
  'arrow-views-to-stats': ['nav a[href="/views"]', 'nav a[href="/stats"]'],
  'arrow-stats-to-timeline': ['nav a[href="/stats"]', 'nav a[href="/timeline"]']
};

function getIntelligenceSuggestion(intel, receipts) {
  if (
    !intel ||
    !Array.isArray(intel.vendorHints) ||
    !Array.isArray(intel.anomalies) ||
    !intel.clusters ||
    !intel.patterns
  ) {
    return null;
  }

  if (intel.vendorHints.length >= 3) {
    return {
      id: 'intelligence-vendor-hints',
      title: 'Vendor Cleanup',
      message: `I can fill in ${intel.vendorHints.length} missing vendor names.`,
      action: 'auto-vendor'
    };
  }

  if (intel.clusters['High Value'] >= 5) {
    return {
      id: 'intelligence-high-value-tags',
      title: 'High Value Group',
      message: 'I can auto-tag high-value receipts.',
      action: 'auto-tag'
    };
  }

  if (autoCreateViews(receipts).length > 0) {
    return {
      id: 'intelligence-saved-views',
      title: 'Saved Views',
      message: 'I can create helpful Saved Views automatically.',
      action: 'auto-views'
    };
  }

  if (intel.anomalies.length >= 1) {
    return {
      id: 'intelligence-anomalies',
      title: 'Possible Anomalies',
      message: `I found ${intel.anomalies.length} unusual receipts.`,
      action: 'detail'
    };
  }

  if (Object.keys(intel.clusters).length >= 2) {
    return {
      id: 'intelligence-clusters',
      title: 'Natural Groups',
      message: 'Your receipts form natural clusters. Want help tagging them?',
      action: 'help-organize'
    };
  }

  if (intel.patterns.recurringVendors.length > 0 || intel.patterns.monthOverMonth.length > 0) {
    return {
      id: 'intelligence-spending-patterns',
      title: 'Spending Patterns',
      message: 'I noticed recurring vendors or month-to-month spending changes. Want to review your stats?',
      action: 'stats'
    };
  }

  return null;
}

function getPageDecision(visit, page) {
  switch (visit) {
    case 1:
      return { shouldAppear: true, reason: 'visit1-full-onboarding' };
    case 2:
      return {
        shouldAppear: page === 'upload' || page === 'list',
        reason: 'visit2-short-onboarding'
      };
    case 3:
      return {
        shouldAppear: page === 'list',
        reason: 'visit3-minimal-onboarding'
      };
    case 4:
      return {
        shouldAppear: page === 'upload',
        reason: 'visit4-micro-ditto'
      };
    case 5:
      return { shouldAppear: true, reason: 'visit5-final' };
    default:
      return { shouldAppear: false, reason: null };
  }
}

export default function DittoController({ page, children, onAction = () => {} }) {
  const { id: routeReceiptId } = useParams();
  const { state, markShown, advanceVisit } = useDitto();
  const { receipts, setReceipts, intel, setIntel, views, setViews } = useData();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitModalType, setVisitModalType] = useState(null);
  const [quietOpen, setQuietOpen] = useState(false);
  const [summoned, setSummoned] = useState(false);
  const [smartSuggestion, setSmartSuggestion] = useState(null);
  const [emotion, setEmotion] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [arrow, setArrow] = useState(null);
  const [automationNotice, setAutomationNotice] = useState('');
  const [duplicateReceipts, setDuplicateReceipts] = useState([]);
  const [isRemovingDuplicates, setIsRemovingDuplicates] = useState(false);
  const [memory, setMemory] = useState(getDittoMemory);
  const [decision, setDecision] = useState({
    page: null,
    shouldAppear: false,
    reason: null,
    visit: state.visit
  });
  const pageDecisionRef = useRef(null);
  const smartSuggestionRef = useRef(null);
  const arrowTimerRef = useRef(null);
  const quietMode = state.onboardingComplete && state.enabled && !state.skipped;
  const currentReceipt = page === 'detail'
    ? receipts.find((receipt) => String(receipt.id) === String(routeReceiptId))
    : null;

  useEffect(() => {
    setIntel(receipts.length > 0 ? analyzeReceipts(receipts) : null);
  }, [receipts, setIntel]);

  useEffect(() => {
    const visitModalExpected = !state.onboardingComplete &&
      getPageDecision(state.visit, page).shouldAppear;
    const allowed = page === 'detail' && currentReceipt && state.enabled && !state.skipped &&
      !showOnboarding && !showVisitModal && !visitModalExpected && (!quietMode || summoned);
    if (!allowed) {
      setEmotion(null);
      return;
    }

    const moment = getEmotionalMoment(currentReceipt);
    if (!moment) {
      setEmotion(null);
      return;
    }

    const sessionKey = `ditto_emotion_seen_${moment.id}`;
    try {
      if (sessionStorage.getItem(sessionKey)) {
        setEmotion(null);
        return;
      }
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Show the moment even when session storage is unavailable.
    }
    setEmotion(moment);
  }, [
    currentReceipt?.id,
    currentReceipt?.vendor,
    currentReceipt?.amount,
    page,
    quietMode,
    showOnboarding,
    showVisitModal,
    state.enabled,
    state.skipped,
    state.visit,
    summoned
  ]);

  useEffect(() => {
    function syncMemory() {
      setMemory(getDittoMemory());
    }
    window.addEventListener('ditto-memory-updated', syncMemory);
    return () => window.removeEventListener('ditto-memory-updated', syncMemory);
  }, []);

  useEffect(() => () => window.clearTimeout(arrowTimerRef.current), []);

  function showArrowBetween(selectorA, selectorB) {
    const elementA = document.querySelector(selectorA);
    const elementB = document.querySelector(selectorB);
    if (!elementA || !elementB) return false;

    const rectA = elementA.getBoundingClientRect();
    const rectB = elementB.getBoundingClientRect();
    setArrow({
      from: { left: rectA.left, top: rectA.top, width: rectA.width, height: rectA.height },
      to: { left: rectB.left, top: rectB.top, width: rectB.width, height: rectB.height }
    });
    window.clearTimeout(arrowTimerRef.current);
    arrowTimerRef.current = window.setTimeout(() => setArrow(null), 3500);
    return true;
  }

  function showOverlayForElement(selector, message, stepLabel, onNext) {
    const target = document.querySelector(selector);
    if (!target) return false;

    target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    window.requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect();
      setOverlay({
        targetRect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        message,
        stepLabel,
        onNext
      });
    });
    return true;
  }

  function showTourStep(index) {
    if (index >= TOUR_STEPS.length) {
      setOverlay(null);
      return;
    }

    const step = TOUR_STEPS[index];
    const next = () => {
      const nextStep = TOUR_STEPS[index + 1];
      if (nextStep) showArrowBetween(step.selector, nextStep.selector);
      showTourStep(index + 1);
    };
    const stepLabel = `Step ${index + 1} of ${TOUR_STEPS.length}`;
    if (!showOverlayForElement(step.selector, step.message, stepLabel, next)) next();
  }

  function remember(updates) {
    const updatedMemory = updateDittoMemory(updates);
    setMemory(updatedMemory);
    return updatedMemory;
  }

  function handleAction(action, payload) {
    if (action && typeof action === 'object' && action.type === 'nlp') {
      const text = String(action.text ?? '');
      const previousAction = memory.lastNLPAction
        ? { action: memory.lastNLPAction, payload: memory.lastNLPActionPayload }
        : parseDittoIntent(memory.lastNLP);
      remember({
        lastNLP: text,
        lastNLPAction: action.action || memory.lastNLPAction,
        lastNLPActionPayload: action.payload || memory.lastNLPActionPayload
      });
      if (/\bagain\b/i.test(text) && previousAction?.action) {
        handleAction(previousAction.action, previousAction.payload);
      }
      return;
    }
    if (typeof action !== 'string') return;

    const viewName = payload?.viewName || payload?.payload?.viewName;
    if (action === 'open-view' && viewName) {
      onAction('open-view', { viewName });
      return;
    }

    if (action.startsWith('auto-')) {
      if (!AUTOMATION_ACTIONS.has(action)) {
        setAutomationNotice('This action is unavailable in the frozen MVP assistant.');
        return;
      }
      recordAutomationUsed(action);
      setMemory(getDittoMemory());
      runAutomation(action);
      return;
    }

    const arrowAction = ARROW_ACTIONS[action];
    if (arrowAction) {
      showArrowBetween(...arrowAction);
      return;
    }

    if (action === 'show-around') {
      showTourStep(0);
      return;
    }

    const overlayAction = OVERLAY_ACTIONS[action];
    if (!overlayAction) {
      onAction(action);
      return;
    }

    let message = overlayAction.message;
    if (action === 'overlay-tags' && Object.keys(intel?.clusters || {}).length > 0) {
      message = `Ditto found ${Object.entries(intel.clusters)
        .map(([name, count]) => `${name}: ${count}`)
        .join(', ')}. Tags can help organize these groups.`;
    }
    if (action === 'overlay-vendors' && intel?.vendorHints.length > 0) {
      message = `Ditto found ${intel.vendorHints.length} receipts with recognizable vendor text.`;
    }
    if (action === 'overlay-stats' && intel?.patterns?.monthOverMonth.length > 0) {
      const latestChange = intel.patterns.monthOverMonth[intel.patterns.monthOverMonth.length - 1];
      message = `Spending changed ${latestChange.percentChange.toFixed(0)}% from ${latestChange.previousMonth} to ${latestChange.month}.`;
    }

    if (showOverlayForElement(overlayAction.selector, message)) return;

    try {
      sessionStorage.setItem(PENDING_OVERLAY_KEY, JSON.stringify({ ...overlayAction, message }));
    } catch {
      // Continue with navigation even when session storage is unavailable.
    }
    onAction(overlayAction.navigateAction);
  }

  function runAutomation(action) {
    if (action === 'auto-tag' || action === 'auto-tag-high-value') {
      const currentTags = new Map(receipts.map((receipt) => [
        String(receipt.id),
        new Set([
          ...getTagsForReceipt(receipt.id),
          ...(Array.isArray(receipt.tags) ? receipt.tags : [])
        ])
      ]));
      const updated = autoTagReceipts(
        receipts,
        action === 'auto-tag-high-value' ? { 'High Value': true } : intel?.clusters || {},
        intel?.patterns || {}
      );
      const changedCount = updated.filter((receipt) => {
        const previousTags = currentTags.get(String(receipt.id)) || new Set();
        return receipt.tags.some((tag) => !previousTags.has(tag));
      }).length;
      setReceipts(updated);
      setAutomationNotice(`Applied automatic tags to ${changedCount} receipts.`);
      return;
    }

    if (action === 'auto-vendor') {
      const updated = autoInferVendors(receipts, intel?.vendorHints || []);
      const changedCount = updated.filter((receipt, index) =>
        receipt.vendor !== receipts[index].vendor
      ).length;
      setReceipts(updated);
      setAutomationNotice(`Inferred vendor names for ${changedCount} receipts.`);
      return;
    }

    if (action === 'auto-group') {
      const updated = autoGroupReceipts(receipts, intel);
      setReceipts(updated);
      setAutomationNotice('Grouped receipts with tags based on value, vendor, and date.');
      return;
    }

    if (action === 'auto-views') {
      const candidates = autoCreateViews(receipts);
      const additions = candidates.filter(({ name }) => !views[name]);
      if (additions.length === 0) {
        setAutomationNotice('No new saved views matched your receipts.');
        return;
      }
      setViews({
        ...views,
        ...Object.fromEntries(additions.map(({ name, state: viewState }) => [name, viewState]))
      });
      setAutomationNotice(`Created ${additions.length} saved view${additions.length === 1 ? '' : 's'}.`);
      return;
    }

    if (action === 'auto-dedupe') {
      const cleaned = autoRemoveDuplicates(receipts);
      const retainedIds = new Set(cleaned.map((receipt) => String(receipt.id)));
      const candidates = receipts.filter((receipt) => !retainedIds.has(String(receipt.id)));
      if (candidates.length === 0) {
        setAutomationNotice('No exact duplicates were found.');
        return;
      }
      setDuplicateReceipts(candidates);
      setAutomationNotice(`Found ${candidates.length} exact duplicate receipt${candidates.length === 1 ? '' : 's'}. Review before removal.`);
    }
  }

  async function confirmDuplicateRemoval() {
    setIsRemovingDuplicates(true);
    const removedIds = [];

    for (const receipt of duplicateReceipts) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/receipts/receipt/${encodeURIComponent(receipt.id)}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          removedIds.push(String(receipt.id));
          removeTagsForReceipt(receipt.id);
        }
      } catch {
        // Keep receipts whose delete request failed.
      }
    }

    setReceipts((currentReceipts) =>
      currentReceipts.filter((receipt) => !removedIds.includes(String(receipt.id)))
    );
    setDuplicateReceipts([]);
    setIsRemovingDuplicates(false);
    setAutomationNotice(`Removed ${removedIds.length} duplicate receipt${removedIds.length === 1 ? '' : 's'}.`);
  }

  useEffect(() => {
    let pending;
    try {
      pending = JSON.parse(sessionStorage.getItem(PENDING_OVERLAY_KEY) || 'null');
    } catch {
      pending = null;
    }
    if (!pending || pending.page !== page) return;

    sessionStorage.removeItem(PENDING_OVERLAY_KEY);
    window.requestAnimationFrame(() => {
      showOverlayForElement(pending.selector, pending.message);
    });
  }, [page]);

  useEffect(() => {
    if (!state.enabled || state.skipped) {
      setSummoned(false);
      setSmartSuggestion(null);
      smartSuggestionRef.current = null;
    }
  }, [state.enabled, state.skipped]);

  useEffect(() => {
    if (!state.enabled || state.skipped) {
      setShowOnboarding(false);
      setShowVisitModal(false);
      const disabledDecision = {
        page,
        shouldAppear: false,
        reason: null,
        visit: state.visit
      };
      pageDecisionRef.current = disabledDecision;
      setDecision(disabledDecision);
      return;
    }

    if (pageDecisionRef.current?.page === page) {
      setDecision(pageDecisionRef.current);
      return;
    }

    if (state.onboardingComplete) {
      setShowOnboarding(false);
      setShowVisitModal(false);
      const completeDecision = {
        page,
        shouldAppear: false,
        reason: null,
        visit: state.visit
      };
      pageDecisionRef.current = completeDecision;
      setDecision(completeDecision);
      return;
    }

    const pageDecision = getPageDecision(state.visit, page);
    const nextDecision = {
      page,
      ...pageDecision,
      visit: state.visit
    };
    pageDecisionRef.current = nextDecision;
    setDecision(nextDecision);

    if (nextDecision.shouldAppear) {
      if (nextDecision.reason === 'visit1-full-onboarding') {
        setShowOnboarding(true);
      } else {
        const modalType = `visit${state.visit}`;
        if (['visit2', 'visit3', 'visit4', 'visit5'].includes(modalType)) {
          setVisitModalType(modalType);
          setShowVisitModal(true);
        } else {
          markShown();
          advanceVisit();
        }
      }
    }
  }, [
    advanceVisit,
    markShown,
    page,
    state.enabled,
    state.onboardingComplete,
    state.skipped,
    state.visit
  ]);

  useEffect(() => {
    const visitModalExpected = getPageDecision(state.visit, page).shouldAppear;
    if (
      quietMode || summoned || showVisitModal || showOnboarding ||
      !state.enabled || state.skipped || page !== 'list' || visitModalExpected
    ) {
      setSmartSuggestion(null);
      smartSuggestionRef.current = null;
      return;
    }

    if (receipts.length > 0 && !intel) return;

    const suggestion = getDittoSmartSuggestion(receipts) ||
      getIntelligenceSuggestion(intel, receipts);
    if (!suggestion) {
      setSmartSuggestion(null);
      smartSuggestionRef.current = null;
      return;
    }

    if (smartSuggestionRef.current) return;
    if (shouldShowDittoSmartSuggestion(suggestion)) {
      smartSuggestionRef.current = suggestion;
      setSmartSuggestion(suggestion);
    } else {
      setSmartSuggestion(null);
    }
  }, [
    page,
    quietMode,
    summoned,
    showVisitModal,
    showOnboarding,
    state.enabled,
    state.skipped,
    state.visit,
    receipts,
    intel,
    memory,
    views
  ]);

  function completeOnboarding({ skipped = false } = {}) {
    markShown();
    if (!skipped) advanceVisit();
    setShowOnboarding(false);
    setShowVisitModal(false);

    const completedDecision = {
      page,
      shouldAppear: false,
      reason: decision.reason,
      visit: decision.visit
    };
    pageDecisionRef.current = completedDecision;
    setDecision(completedDecision);
  }

  function completeVisitModal({ skipped = false } = {}) {
    markShown();
    if (!skipped) advanceVisit();
    setShowVisitModal(false);

    const completedDecision = {
      page,
      shouldAppear: false,
      reason: decision.reason,
      visit: decision.visit
    };
    pageDecisionRef.current = completedDecision;
    setDecision(completedDecision);
  }

  let visitModal = null;
  const visitModalProps = {
    onComplete: completeVisitModal,
    onAction: handleAction
  };
  if (showVisitModal) {
    if (visitModalType === 'visit2') visitModal = <Visit2Modal {...visitModalProps} />;
    if (visitModalType === 'visit3') visitModal = <Visit3Modal {...visitModalProps} />;
    if (visitModalType === 'visit4') visitModal = <Visit4Modal {...visitModalProps} />;
    if (visitModalType === 'visit5') visitModal = <Visit5Modal {...visitModalProps} />;
  }

  const currentDecision = decision.page === page
    ? decision
    : { shouldAppear: false, reason: null, visit: state.visit };

  const automationNoticeNode = automationNotice && (
    <aside
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: '1rem',
        bottom: quietMode ? '4.5rem' : '1rem',
        zIndex: 10003,
        width: 'min(340px, calc(100vw - 2rem))',
        padding: '1rem',
        color: 'var(--text)',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
      }}
    >
      <p>{automationNotice}</p>
      {duplicateReceipts.length > 0 ? (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="danger" disabled={isRemovingDuplicates} onClick={confirmDuplicateRemoval}>
            {isRemovingDuplicates ? 'Removing…' : `Remove ${duplicateReceipts.length} duplicates`}
          </button>
          <button
            type="button"
            className="button"
            disabled={isRemovingDuplicates}
            onClick={() => {
              setDuplicateReceipts([]);
              setAutomationNotice('Duplicate cleanup canceled.');
            }}
          >
            Keep receipts
          </button>
        </div>
      ) : (
        <button type="button" className="button" onClick={() => setAutomationNotice('')}>
          Close
        </button>
      )}
    </aside>
  );

  function summonDitto() {
    setQuietOpen(false);
    setSummoned(true);
  }

  function handleSummonedAction(action) {
    setSummoned(false);
    handleAction(action);
  }

  function handleSmartSuggestionAction(action, payload) {
    setSmartSuggestion(null);
    smartSuggestionRef.current = null;
    if (action !== 'dismiss') handleAction(action, payload);
  }

  const summonedBubble = summoned && state.enabled && !state.skipped ? (
    <Ditto
      reason={quietMode && emotion ? 'emotion' : 'summoned'}
      visit={state.visit}
      page={page}
      emotion={quietMode ? emotion : null}
      summoned
      onDismiss={() => setSummoned(false)}
      onAction={(action) => {
        setEmotion(null);
        handleSummonedAction(action);
      }}
    />
  ) : null;

  const emotionBubble = emotion && !quietMode && !summoned ? (
    <Ditto
      reason="emotion"
      visit={state.visit}
      page={page}
      emotion={emotion}
      onDismiss={() => setEmotion(null)}
      onAction={(action) => {
        setEmotion(null);
        handleAction(action);
      }}
    />
  ) : null;

  const smartSuggestionBubble = smartSuggestion && !quietMode && !summoned &&
    !showOnboarding && !showVisitModal ? (
      <Ditto
        reason="smart-suggestion"
        visit={state.visit}
        page={page}
        suggestion={smartSuggestion}
        summoned
        onAction={handleSmartSuggestionAction}
      />
    ) : null;

  if (quietMode) {
    return (
      <>
        {quietOpen && <DittoQuietBubble onClose={() => setQuietOpen(false)} />}
        {summonedBubble}
        {automationNoticeNode}
        {arrow && <DittoArrow fromRect={arrow.from} toRect={arrow.to} />}
        {overlay && (
          <DittoOverlay
            targetRect={overlay.targetRect}
            message={overlay.message}
            stepLabel={overlay.stepLabel}
            onNext={overlay.onNext}
            onClose={() => setOverlay(null)}
          />
        )}
        <DittoQuietIcon
          expanded={quietOpen}
          onClick={() => setQuietOpen((isOpen) => !isOpen)}
        />
        <DittoSummonButton onClick={summonDitto} />
        {children({ shouldAppear: false, reason: null, visit: state.visit })}
      </>
    );
  }

  return (
    <>
      {showOnboarding && (
        <DittoOnboarding
          onComplete={completeOnboarding}
          onAction={handleAction}
        />
      )}
      {visitModal}
      {state.enabled && !state.skipped && !showOnboarding && !showVisitModal && (
        <DittoSummonButton onClick={summonDitto} />
      )}
      {summonedBubble}
      {emotionBubble}
      {smartSuggestionBubble}
      {automationNoticeNode}
      {arrow && <DittoArrow fromRect={arrow.from} toRect={arrow.to} />}
      {overlay && (
        <DittoOverlay
          targetRect={overlay.targetRect}
          message={overlay.message}
          stepLabel={overlay.stepLabel}
          onNext={overlay.onNext}
          onClose={() => setOverlay(null)}
        />
      )}
      {children({
        shouldAppear: currentDecision.shouldAppear && !showOnboarding && !showVisitModal &&
          !summoned && !smartSuggestion && !overlay,
        reason: currentDecision.reason,
        visit: currentDecision.visit,
        onAction: handleAction
      })}
    </>
  );
}