// Keep hashed JS/CSS reusable between visits without caching authenticated
// API traffic or any HTML document. Registration happens off the critical path.
export function registerAssetCache(): void {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  const scope = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;
  const start = () => {
    const scriptUrl = new URL(scope + 'sw.js', window.location.origin);
    void navigator.serviceWorker.register(scriptUrl.href, { scope, updateViaCache: 'none' })
      .catch(error => console.warn('Optional static asset cache unavailable:', error));
  };
  const run = () => {
    const idleWindow = window as Window & { requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => void };
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(start, { timeout: 3500 });
    } else {
      window.setTimeout(start, 1200);
    }
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}
