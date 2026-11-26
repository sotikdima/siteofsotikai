const rand = (min: number, max: number): number => min + Math.random() * (max - min);

let sharedResizeObserver: ResizeObserver | null = null;
const observedContainers = new WeakSet<HTMLElement>();

function ensureResizeObserved(container: HTMLElement): void {
  if (typeof ResizeObserver === 'undefined' || observedContainers.has(container)) return;
  if (!sharedResizeObserver) {
    sharedResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement) {
          populateRain(entry.target);
        }
      }
    });
  }
  observedContainers.add(container);
  sharedResizeObserver.observe(container);
}

function populateRain(container: HTMLElement): void {
  const rainLayer = container.querySelector<HTMLElement>('.glass-rain');
  if (!rainLayer) return;

  ensureResizeObserved(container);

  const count = Number(container.dataset.rain) || 8;
  const width = container.clientWidth;
  const height = container.clientHeight;
  if (width === 0 || height === 0) {
    requestAnimationFrame(() => {
      if (container.isConnected && container.clientWidth > 0 && container.clientHeight > 0) {
        populateRain(container);
      }
    });
    return;
  }

  const prevW = Number(rainLayer.dataset.rainW || '0');
  const prevH = Number(rainLayer.dataset.rainH || '0');
  if (
    rainLayer.dataset.rainReady === '1' &&
    rainLayer.childElementCount > 0 &&
    Math.abs(width - prevW) <= 16 &&
    Math.abs(height - prevH) <= 16
  ) {
    return;
  }

  rainLayer.dataset.rainReady = '1';
  rainLayer.dataset.rainW = String(width);
  rainLayer.dataset.rainH = String(height);
  rainLayer.textContent = '';

  // Ensure every glass container visibly has multiple rolling drops in dev & published builds
  const runningTarget = Math.max(2, Math.round(count * 0.4));

  for (let i = 0; i < count; i++) {
    const shouldRun = i < runningTarget;
    const isLarge = shouldRun || Math.random() < 0.22;
    const size = isLarge ? rand(10.5, 17.5) : rand(3.5, 8.5);
    const drop = document.createElement('i');
    drop.className = 'drop';
    drop.style.cssText = `left:${rand(0, Math.max(0, width - size))}px;top:${rand(0, Math.max(0, height - size))}px;width:${size}px;height:${size * rand(1, 1.28)}px`;

    if (shouldRun) {
      drop.classList.add('run');
      drop.style.setProperty('--run', `${Math.max(48, Math.min(height * 0.65, rand(75, 175)))}px`);
      drop.style.setProperty('--dur', `${rand(8.5, 16)}s`);
      drop.style.setProperty('--delay', `${-rand(0, 12)}s`);
    }

    rainLayer.appendChild(drop);
  }
}

function bindGlassPointer(el: HTMLElement): void {
  if (el.dataset.glassBound === '1') return;
  el.dataset.glassBound = '1';

  el.addEventListener('pointermove', (event: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    el.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });

  el.addEventListener('pointerleave', () => {
    el.style.setProperty('--mx', '30%');
    el.style.setProperty('--my', '0%');
  });
}

export function refreshGlassRain(): void {
  if (typeof document === 'undefined') return;
  document.querySelectorAll<HTMLElement>('[data-rain]').forEach(populateRain);
  document.querySelectorAll<HTMLElement>('.glass').forEach(bindGlassPointer);
}

let initialized = false;

export function initGlassRain(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (initialized) {
    refreshGlassRain();
    return;
  }
  initialized = true;

  refreshGlassRain();
  setTimeout(refreshGlassRain, 250);

  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshGlassRain, 180);
  });

  let mutationScheduled = false;
  const scheduleRefresh = () => {
    if (mutationScheduled) return;
    mutationScheduled = true;
    requestAnimationFrame(() => {
      mutationScheduled = false;
      refreshGlassRain();
    });
  };

  const observer = new MutationObserver((mutations) => {
    const hasGlassChange = mutations.some(
      (m) =>
        m.type === 'childList' &&
        Array.from(m.addedNodes).some((node) =>
          node instanceof Element
            ? node.matches('[data-rain], .glass') || node.querySelector('[data-rain], .glass') !== null
            : false
        )
    );
    if (hasGlassChange) {
      scheduleRefresh();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
