import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initGlassRain } from './utils/glassRain.ts';

const EXTERNAL_RELOAD_KEY = 'sotik_ext_reloaded_v1';
const TRACKING_PARAMS = new Set([
  'fbclid',
  'yclid',
  'ysclid',
  'gclid',
  'ttclid',
  'from',
  'ref',
  '_openstat',
  'etext',
  'igshid',
  'si',
]);

function isTrackingParam(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.startsWith('utm_') || lower.startsWith('vk_') || TRACKING_PARAMS.has(lower);
}

function stripTrackingParams(url: URL): boolean {
  let changed = false;
  for (const key of Array.from(url.searchParams.keys())) {
    if (isTrackingParam(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  return changed;
}

function handleExternalEntryOneTimeReload(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (window.sessionStorage.getItem(EXTERNAL_RELOAD_KEY) === '1') {
      return false;
    }
  } catch {
    // Without working sessionStorage, avoid reload loops; only clean URL query in place.
    try {
      const u = new URL(window.location.href);
      if (stripTrackingParams(u)) {
        window.history.replaceState(null, '', u.pathname + u.search + u.hash);
      }
    } catch {}
    return false;
  }

  let enteredFromExternalSite = false;
  try {
    if (document.referrer) {
      const refHost = new URL(document.referrer).hostname.toLowerCase();
      const ownHost = (window.location.hostname || '').toLowerCase();
      if (refHost && ownHost && refHost !== ownHost) {
        enteredFromExternalSite = true;
      }
    }
  } catch {}

  let hasTrackingParams = false;
  let cleanUrl = window.location.href;
  try {
    const u = new URL(window.location.href);
    hasTrackingParams = stripTrackingParams(u);
    cleanUrl = u.toString();
  } catch {}

  if (!enteredFromExternalSite && !hasTrackingParams) {
    return false;
  }

  try {
    window.sessionStorage.setItem(EXTERNAL_RELOAD_KEY, '1');
    if (window.sessionStorage.getItem(EXTERNAL_RELOAD_KEY) !== '1') {
      return false;
    }
  } catch {
    return false;
  }

  if (cleanUrl !== window.location.href) {
    window.location.replace(cleanUrl);
  } else {
    window.location.reload();
  }
  return true;
}

if (typeof window !== 'undefined' && window.location.pathname === '/index.html') {
  let hasSavedSpaPath = false;
  try {
    hasSavedSpaPath = window.sessionStorage.getItem('sotik_spa_path') !== null;
  } catch {}
  if (!hasSavedSpaPath) {
    window.history.replaceState(
      window.history.state,
      '',
      `/${window.location.search}${window.location.hash}`
    );
  }
}

const isReloadingFromExternalEntry = handleExternalEntryOneTimeReload();

if (!isReloadingFromExternalEntry) {
  createRoot(document.getElementById('root')!).render(<App />);

  requestAnimationFrame(() => {
    setTimeout(initGlassRain, 60);
  });
}
