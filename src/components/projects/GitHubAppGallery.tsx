import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Github, ImageOff, RefreshCw, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

type App = {
  repo: string;
  name: string;
  description: string;
  url: string;
  thumbnail?: string;
  pushedAt?: string;
};
type PublicRepo = {
  name: string; description: string | null; homepage: string | null;
  has_pages: boolean; archived: boolean; fork: boolean; private: boolean;
  size: number; pushed_at: string;
};
type Capture = {
  pushedAt?: string;
  capturedAt?: string;
  modes: { light?: string; dark?: string };
};
type ManifestApp = {
  repo: string; name: string; description: string; url: string;
  pushedAt?: string; capturedAt?: string;
  modes?: { light?: string; dark?: string };
};
type Manifest = { schema: number; apps: Record<string, ManifestApp> };

const STARTER_APPS: App[] = [
  { repo: 'Calliopen', name: 'Calliopen', description: 'Creative application workspace.', url: 'https://marcusdhaynes.github.io/Calliopen/' },
  { repo: 'Calypso', name: 'Calypso', description: 'Workspace for teams, agents, projects, and automation.', url: 'https://marcusdhaynes.github.io/Calypso/' },
  { repo: 'Candlelight', name: 'Candlelight', description: 'Trading charts, paper trading, orders, and journal.', url: 'https://marcusdhaynes.github.io/Candlelight/' },
  { repo: 'ChatGPTBackup', name: 'ChatGPT Backup', description: 'ChatGPT backup application.', url: 'https://marcusdhaynes.github.io/ChatGPTBackup/' },
  { repo: 'Deltos', name: 'Deltos', description: 'Email triage and organization.', url: 'https://marcusdhaynes.github.io/Deltos/', thumbnail: 'thumbnails/deltos.png' },
  { repo: 'MarmaladePlayer', name: 'Marmalade Player', description: 'Video playback application.', url: 'https://marcusdhaynes.github.io/MarmaladePlayer/' },
  { repo: 'Pheme', name: 'PHEME', description: 'Digital newspaper and news platform.', url: 'https://marcusdhaynes.github.io/Pheme/' },
  { repo: 'ProSeU', name: 'ProSeU', description: 'Legal education and curriculum platform.', url: 'https://marcusdhaynes.github.io/ProSeU/' },
  { repo: 'Sennet', name: 'Sennet', description: 'Web application.', url: 'https://marcusdhaynes.github.io/Sennet/', thumbnail: 'thumbnails/sennet.png' },
  { repo: 'Starborn', name: 'Starborn', description: 'Interactive entertainment application.', url: 'https://marcusdhaynes.github.io/Starborn/', thumbnail: 'thumbnails/starborn.png' },
  { repo: 'Subversion', name: 'Subversion', description: 'Web application.', url: 'https://marcusdhaynes.github.io/Subversion/' },
];
// Public, deployed apps only: never expose private repositories or retired products.
const EXCLUDED_REPOS = new Set(['inbox-reborn', 'somniel', 'somniel-holdings']);
const CACHE_KEY = 'somniel-public-app-catalog-v2';
const POLL_INTERVAL = 90_000;
const safeRepo = (name: string) => /^[A-Za-z0-9_.-]+$/.test(name);
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
const safePath = (path: unknown): path is string =>
  typeof path === 'string' && /^thumbnails\/live\/[a-z0-9-]+\.png$/.test(path);
const safeWebsite = (url: unknown): url is string => {
  if (typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && !!parsed.hostname && !parsed.username &&
      !parsed.password && !['localhost','127.0.0.1'].includes(parsed.hostname) &&
      !parsed.hostname.endsWith('.local');
  } catch { return false; }
};
function cachedApps(): App[] | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
    if (!value || Date.now() - value.time > POLL_INTERVAL || !Array.isArray(value.apps)) return null;
    return value.apps.length <= 250 && value.apps.every((app: App) =>
      app && safeRepo(app.repo) && safeWebsite(app.url)) ? value.apps : null;
  } catch { return null; }
}
function cacheApps(apps: App[]) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), apps })); }
  catch { /* Private browsing still works. */ }
}
function previewUrl(site: string, version: string, refresh: number, width = 480) {
  const target = new URL(site);
  // A changed GitHub push produces a fresh remote capture URL, not the stale
  // static image associated with the original application version.
  target.searchParams.set('somnielPreviewVersion', String(refresh || version || 'current'));
  return 'https://image.thum.io/get/width/' + width + '/crop/' +
    Math.round(width * 0.625) + '/maxAge/1/noanimate/' + target.toString();
}
function elapsed(iso?: string) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return '';
  const diff = Math.max(0, Date.now() - Date.parse(iso));
  if (diff < 60_000) return 'Updated just now';
  if (diff < 3_600_000) return 'Updated ' + Math.floor(diff / 60_000) + 'm ago';
  if (diff < 86_400_000) return 'Updated ' + Math.floor(diff / 3_600_000) + 'h ago';
  return 'Updated ' + Math.floor(diff / 86_400_000) + 'd ago';
}

const AppCard: React.FC<{ app: App; captured?: Capture }> = ({ app, captured }) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>(() => theme === 'dark' ? 'dark' : 'light');
  const [fallback, setFallback] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const pushVersion = app.pushedAt || '';
  const fresh = captured && (!pushVersion || captured.pushedAt === pushVersion);
  const darkAvailable = !!fresh && !!captured?.modes.dark && !!captured?.modes.light;
  const shownMode = mode === 'dark' && darkAvailable ? 'dark' : 'light';
  const capturedPath = fresh && !refresh ? captured?.modes[shownMode] : undefined;
  const screenshot = capturedPath && safePath(capturedPath) ?
    import.meta.env.BASE_URL + capturedPath : undefined;
  const remoteScreenshot = previewUrl(app.url, pushVersion, refresh);
  const staticScreenshot = app.thumbnail ? import.meta.env.BASE_URL + app.thumbnail : undefined;
  const sources = [screenshot, remoteScreenshot, staticScreenshot].filter((x): x is string => !!x);
  const source = sources[fallback];
  const repoUrl = 'https://github.com/marcusdhaynes/' + encodeURIComponent(app.repo);
  useEffect(() => {
    setFallback(0); setFailed(false); setImageReady(false); setRefresh(0);
  }, [app.url, app.pushedAt, captured?.capturedAt]);
  const chooseMode = (next: 'light' | 'dark') => {
    setMode(next); setFallback(0); setFailed(false); setImageReady(false);
    setRefresh(0);
  };
  const captureError = () => {
    setImageReady(false);
    if (shownMode === 'dark' && screenshot && fallback === 0) {
      setMode('light'); setFallback(0); return;
    }
    if (fallback + 1 < sources.length) setFallback(level => level + 1);
    else setFailed(true);
  };
  const refreshImage = () => {
    setFallback(0); setFailed(false); setImageReady(false);
    setMode('light'); setRefresh(Date.now());
  };
  return (
    <article className="project-preview-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
      <div className="relative aspect-[16/10] overflow-hidden bg-subtle">
        <a href={app.url} target="_blank" rel="noopener noreferrer"
          aria-label={'Open ' + app.name + ' live site'}
          className="absolute inset-0 block">
          {failed || !source ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted">
              <ImageOff className="h-8 w-8 opacity-60" aria-hidden="true"/>
              <span className="px-4 text-center text-xs">{app.name} Preview Unavailable</span>
              <span className="text-[10px]">Open the live application</span>
            </div>
          ) : (
            <>
              {!imageReady && <div className="absolute inset-0 flex items-center justify-center bg-subtle">
                <span className="font-serif text-xl font-bold text-fg/75">{app.name}</span>
              </div>}
              <img src={source} key={source} alt={app.name + ' ' + shownMode + ' homepage preview'}
                className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                width="480" height="300" loading="lazy" decoding="async"
                onLoad={() => setImageReady(true)} onError={captureError}/>
            </>
          )}
        </a>
        {darkAvailable && (
          <div className="absolute left-2 top-2 z-10 flex gap-0.5 rounded-lg border border-white/15 bg-black/75 p-1 backdrop-blur-md"
            role="group" aria-label={app.name + ' Preview Theme'}>
            <button type="button" aria-pressed={shownMode === 'light'} onClick={() => chooseMode('light')}
              className={'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ' +
                (shownMode === 'light' ? 'bg-white text-black' : 'text-white hover:bg-white/15')}>
              <Sun size={12}/> Light
            </button>
            <button type="button" aria-pressed={shownMode === 'dark'} onClick={() => chooseMode('dark')}
              className={'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ' +
                (shownMode === 'dark' ? 'bg-white text-black' : 'text-white hover:bg-white/15')}>
              <Moon size={12}/> Dark
            </button>
          </div>
        )}
        <span className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-black/75 px-2.5 py-1 text-[10px] font-semibold text-white">
          {screenshot && fallback === 0 ? 'Captured Homepage' : 'Live Site Preview'}
        </span>
        {captured && !fresh && (
          <span className="absolute bottom-2 right-2 rounded-full bg-accent px-2 py-1 text-[9px] font-semibold text-bg">
            Updating Preview
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="truncate font-serif text-lg font-semibold tracking-tight text-fg">{app.name}</h3>
        <p className="mt-2 min-h-10 flex-1 text-xs leading-relaxed text-muted">{app.description}</p>
        <p className="mt-1 text-[10px] text-muted/70">{elapsed(app.pushedAt) || 'Published Application'}</p>
        <div className="mt-4 flex items-center gap-2">
          <a href={app.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-bg transition-opacity hover:opacity-85">
            Open App <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true"/>
          </a>
          <a href={repoUrl} target="_blank" rel="noopener noreferrer"
            title={'View ' + app.name + ' on GitHub'} aria-label={'View ' + app.name + ' repository'}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-fg transition-colors hover:border-accent hover:text-accent">
            <Github className="h-4 w-4" aria-hidden="true"/>
          </a>
          <button type="button" onClick={refreshImage}
            aria-label={'Refresh ' + app.name + ' live screenshot'} title="Refresh Homepage Screenshot"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-fg transition-colors hover:border-accent hover:text-accent">
            <RefreshCw className="h-4 w-4" aria-hidden="true"/>
          </button>
        </div>
      </div>
    </article>
  );
};

const GitHubAppGallery: React.FC = () => {
  const [apps, setApps] = useState<App[]>(() => cachedApps() ?? STARTER_APPS);
  const [captures, setCaptures] = useState<Record<string, Capture>>({});
  const [syncedAt, setSyncedAt] = useState<string>('');
  const lastFetch = useRef(0);
  const busy = useRef(false);

  const refreshCatalog = useCallback(async (force = false) => {
    if (busy.current || (!force && Date.now() - lastFetch.current < POLL_INTERVAL - 4000)) return;
    busy.current = true; lastFetch.current = Date.now();
    try {
      // Both sources are useful: the build's first-party catalog includes apps
      // past the GitHub anonymous API limit; the live API notices new pushes now.
      const [manifestResult, githubResult] = await Promise.allSettled([
        fetch(import.meta.env.BASE_URL + 'thumbnails/manifest.json?at=' + Date.now(),
          { cache: 'no-store' }).then(res => {
            if (!res.ok) throw Error('Catalog unavailable');
            return res.json() as Promise<Manifest>;
          }),
        fetch('https://api.github.com/users/marcusdhaynes/repos?per_page=100&type=owner&sort=pushed',
          { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-store' }).then(res => {
            if (!res.ok) throw Error('GitHub public API unavailable');
            return res.json() as Promise<PublicRepo[]>;
          })
      ]);
      const combined = new Map(STARTER_APPS.map(app => [app.repo.toLowerCase(), app]));
      if (manifestResult.status === 'fulfilled') {
        const manifest = manifestResult.value;
        const nextCaptures: Record<string, Capture> = {};
        if (manifest.schema === 2 && manifest.apps && typeof manifest.apps === 'object') {
          for (const [id, item] of Object.entries(manifest.apps)) {
            if (!item || !safeRepo(item.repo) || EXCLUDED_REPOS.has(item.repo.toLowerCase()) ||
              !safeWebsite(item.url) || slug(item.repo) !== id) continue;
            const light = safePath(item.modes?.light) ? item.modes?.light : undefined;
            const dark = safePath(item.modes?.dark) ? item.modes?.dark : undefined;
            if (light) nextCaptures[id] = { pushedAt: item.pushedAt || '',
              capturedAt: item.capturedAt, modes: { light, dark } };
            const key = item.repo.toLowerCase();
            const prior = combined.get(key);
            combined.set(key, {
              ...prior, repo: item.repo, name: prior?.name || item.name || item.repo,
              description: prior?.description || item.description || 'Explore this application.',
              url: item.url || prior?.url || '', pushedAt: item.pushedAt
            });
          }
          setCaptures(nextCaptures);
        }
      }
      if (githubResult.status === 'fulfilled' && Array.isArray(githubResult.value)) {
        for (const repo of githubResult.value) {
          if (!repo?.has_pages || repo.archived || repo.fork || repo.private ||
            repo.size <= 0 || !safeRepo(repo.name)) continue;
          const key = repo.name.toLowerCase();
          if (EXCLUDED_REPOS.has(key)) continue;
          const prior = combined.get(key);
          const fallback = 'https://marcusdhaynes.github.io/' + encodeURIComponent(repo.name) + '/';
          const homepage = safeWebsite(repo.homepage) ? repo.homepage : fallback;
          combined.set(key, {
            repo: repo.name, name: prior?.name || repo.name.replace(/[_-]/g, ' '),
            description: prior?.description || repo.description || 'Explore this application.',
            url: homepage, thumbnail: prior?.thumbnail,
            pushedAt: repo.pushed_at || prior?.pushedAt
          });
        }
      }
      const latest = [...combined.values()].sort((a, b) => a.name.localeCompare(b.name));
      setApps(latest); cacheApps(latest);
      setSyncedAt(new Date().toISOString());
    } catch {
      // Retain the previous verified catalog; never replace with an empty list.
    } finally {
      busy.current = false;
    }
  }, []);
  useEffect(() => {
    void refreshCatalog(true);
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refreshCatalog();
    }, POLL_INTERVAL);
    const onFocus = () => { if (document.visibilityState === 'visible') void refreshCatalog(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    window.addEventListener('online', onFocus);
    return () => {
      window.clearInterval(timer); window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.removeEventListener('online', onFocus);
    };
  }, [refreshCatalog]);

  return (
    <section aria-labelledby="github-apps-heading" className="relative mx-auto max-w-[1600px] px-6 pb-12 pt-8 lg:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Built by Somniel</p>
          <h2 id="github-apps-heading" className="mt-2 font-serif text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Our Applications
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Published apps are added automatically. Their previews refresh after source changes, with light and dark views where available.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
            {apps.length} Applications
          </span>
          <button type="button" title="Check For New Apps" aria-label="Check For New Applications"
            onClick={() => void refreshCatalog(true)}
            className="rounded-full border border-border bg-surface p-2 text-fg hover:border-accent hover:text-accent">
            <RefreshCw className="h-3.5 w-3.5"/>
          </button>
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {syncedAt ? 'Application catalog updated ' + new Date(syncedAt).toLocaleTimeString() : 'Loading application catalog'}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {apps.map(app => <AppCard key={app.repo} app={app} captured={captures[slug(app.repo)]}/>)}
      </div>
    </section>
  );
};
export default GitHubAppGallery;
