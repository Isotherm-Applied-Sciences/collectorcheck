let tourTimer;

function showTour(selectors, message) {
  const highlighted = selectors.flatMap((selector) =>
    Array.from(document.querySelectorAll(selector))
  );

  highlighted.forEach((element) => element.classList.add('ditto-tour-highlight'));
  document.getElementById('ditto-tour-notice')?.remove();
  window.clearTimeout(tourTimer);

  const notice = document.createElement('div');
  notice.id = 'ditto-tour-notice';
  notice.setAttribute('role', 'status');
  notice.setAttribute('aria-live', 'polite');
  const text = document.createElement('p');
  text.textContent = message;
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Got it';
  notice.append(text, close);
  document.body.appendChild(notice);

  function finishTour() {
    highlighted.forEach((element) => element.classList.remove('ditto-tour-highlight'));
    notice.remove();
    window.clearTimeout(tourTimer);
  }

  close.addEventListener('click', finishTour);
  tourTimer = window.setTimeout(finishTour, 8000);
}

export function handleDittoAction(action, navigate, payload = {}) {
  switch (action) {
    case 'scan-receipts':
      navigate('/upload');
      break;

    case 'scan-email':
      navigate('/email-scan');
      break;

    case 'show-around':
      showTour(
        [
          'nav a[href="/upload"]',
          'nav a[href="/receipts"]',
          'nav a[href="/tags"]',
          'nav a[href="/views"]',
          'nav a[href="/bulk-export"]'
        ],
        'Quick tour: Upload receipts, view your list, organize with Tags or Saved Views, and use Bulk Export for your records.'
      );
      break;

    case 'help-organize':
      navigate('/tags');
      showTour(
        ['nav a[href="/tags"]', 'nav a[href="/views"]'],
        'Organize receipts with Tags. Use Saved Views to keep useful search and sorting presets.'
      );
      break;

    case 'vendors':
      navigate('/vendors');
      break;

    case 'detail':
      navigate('/receipts');
      break;

    case 'stats':
      navigate('/stats');
      break;

    case 'views':
      navigate('/views');
      break;

    case 'open-view':
      if (payload.viewName) {
        navigate(`/receipts?view=${encodeURIComponent(payload.viewName)}`);
      }
      break;

    case 'timeline':
      navigate('/timeline');
      break;

    case 'vendors':
      navigate('/vendors');
      break;

    default:
      console.warn('Unknown Ditto action:', action);
      break;
  }
}