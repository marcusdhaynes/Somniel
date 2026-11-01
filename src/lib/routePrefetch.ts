// Vite emits each dynamic import as a separately cacheable, hashed chunk.
// Prefetch on intent rather than downloading every admin page at startup.
type ConnectionHint = { saveData?: boolean; effectiveType?: string };
type PrefetchableWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};
const loaders: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/public/Home'),
  '/subsidiaries': () => import('../pages/public/Subsidiaries'),
  '/founders': () => import('../pages/public/Founders'),
  '/projects': () => import('../pages/public/Projects'),
  '/login': () => import('../pages/public/Login'),
  '/dashboard': () => import('../pages/dashboard/UserDashboard'),
  '/dashboard/files': () => import('../pages/dashboard/FileExplorer'),
  '/dashboard/settings': () => import('../pages/admin/AdminSettings'),
  '/admin': () => import('../pages/admin/AdminOverview'),
  '/admin/employees': () => import('../pages/admin/EmployeeManagement'),
  '/admin/payroll': () => import('../pages/admin/PayrollManagement'),
  '/admin/payscale': () => import('../pages/admin/PayScale'),
  '/admin/cms': () => import('../pages/admin/CMSManagement'),
  '/admin/roadmap': () => import('../pages/admin/Roadmap'),
  '/admin/settings': () => import('../pages/admin/AdminSettings'),
};
const pending = new Map<string, Promise<unknown>>();
export function isDataConstrained(): boolean {
  const connection = (navigator as Navigator & { connection?: ConnectionHint }).connection;
  return !!connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType || '');
}
export function prefetchRoute(path: string): void {
  if (isDataConstrained() || !loaders[path] || pending.has(path)) return;
  const task = loaders[path]().catch(() => {
    // Transient failures should be retryable on the next navigation intent.
    pending.delete(path);
  });
  pending.set(path, task);
}
// Download one route at a time and only during idle time, so prewarming
// cannot block initial paint, user interaction, or slow/data-saving networks.
export function prefetchOnIdle(paths: string[]): () => void {
  if (isDataConstrained()) return () => {};
  const win = window as PrefetchableWindow;
  let cancelled = false;
  let next = 0;
  let idleId: number | undefined;
  let timerId: number | undefined;
  const schedule = () => {
    if (cancelled || next >= paths.length) return;
    const work = () => {
      if (cancelled) return;
      if (document.visibilityState === 'visible' && !isDataConstrained()) {
        prefetchRoute(paths[next++]);
      }
      timerId = window.setTimeout(schedule, 900);
    };
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(work, { timeout: 3000 });
    } else {
      timerId = window.setTimeout(work, 800);
    }
  };
  schedule();
  return () => {
    cancelled = true;
    if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
    if (timerId !== undefined) window.clearTimeout(timerId);
  };
}
