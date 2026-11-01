import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Github, ImageOff, RefreshCw } from 'lucide-react';

type App = {
  repo: string;
  name: string;
  description: string;
  url: string;
  /** Static thumbnail path relative to the site base (e.g. 'thumbnails/deltos.png').
      When set, it is used instead of the live thum.io screenshot. */
  thumbnail?: string;
};

type PublicRepo = {
  name: string;
  description: string | null;
  homepage: string | null;
  has_pages: boolean;
  archived: boolean;
  fork: boolean;
  size: number;
};

// These verified public GitHub Pages repositories render immediately, even if
// GitHub's public API is rate-limited or unavailable to a visitor.
// Note: 'inbox-reborn' (retired predecessor of Deltos) and 'Somniel' (this
// site itself) are intentionally NOT listed here.
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

// Repositories that must never appear in the gallery, even if GitHub reports
// them as having Pages: inbox-reborn is Deltos's retired predecessor, and
// Somniel is this website itself.
const EXCLUDED_REPOS = new Set(['inbox-reborn', 'somniel']);

const APP_CACHE_KEY = 'somniel-public-app-catalog-v1';
const APP_CACHE_TTL_MS = 5 * 60 * 1000;
// Cache public, non-sensitive repository metadata for repeat visits. New
// public GitHub Pages apps are rediscovered after the short TTL.
function getCachedApps(): App[] | null {
  try {
    const raw = sessionStorage.getItem(APP_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { fetchedAt?: number; apps?: App[] };
    if (!data.fetchedAt || Date.now() - data.fetchedAt > APP_CACHE_TTL_MS) return null;
    if (!Array.isArray(data.apps) || data.apps.length > 150) return null;
    return data.apps.every(app =>
      typeof app.name === 'string' && typeof app.repo === 'string' &&
      typeof app.url === 'string' && /^https:\/\//.test(app.url)
    ) ? data.apps : null;
  } catch {
    return null;
  }
}
function saveCachedApps(apps: App[]): void {
  try {
    sessionStorage.setItem(APP_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), apps }));
  } catch {
    // Private browsing and disabled storage must still work normally.
  }
}

function previewUrl(siteUrl: string, refresh: number, width = 480): string {
  // A new snapshot is requested from the live public homepage when needed.
  // Thumbnails are cached for at most an hour and only fetched near viewport.
  const target = refresh === 0 ? siteUrl : siteUrl + (siteUrl.includes('?') ? '&' : '?') + 'previewRefresh=' + refresh;
  return `https://image.thum.io/get/width/${width}/crop/${Math.round(width * 0.625)}/maxAge/1/noanimate/` + target;
}

const AppCard: React.FC<{ app: App }> = ({ app }) => {
  const [failed, setFailed] = useState(false);
  const [refresh, setRefresh] = useState(0);
  // Curated static thumbnails (dark mode, key visuals) take precedence over
  // the live thum.io screenshot, which cannot do dark mode and often captures
  // loading states.
  const staticSource = app.thumbnail ? import.meta.env.BASE_URL + app.thumbnail : null;
  const source = staticSource ?? previewUrl(app.url, refresh);
  const responsiveSources = staticSource ? undefined : `${previewUrl(app.url, refresh, 320)} 320w, ${previewUrl(app.url, refresh, 480)} 480w, ${previewUrl(app.url, refresh, 720)} 720w`;
  const codeUrl = 'https://github.com/marcusdhaynes/' + encodeURIComponent(app.repo);

  return (
    <article className="public-section-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface/70 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-accent/50 hover:shadow-lg">
      <a
        href={app.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={'Open ' + app.name + ' live site'}
        className="relative block h-10 shrink-0 overflow-hidden bg-subtle"
      >
        {failed ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted">
            <ImageOff className="h-8 w-8 opacity-60" aria-hidden="true" />
            <span className="px-4 text-center text-xs">Live preview unavailable</span>
            <span className="text-[10px]">Open the app to view its homepage</span>
          </div>
        ) : (
          <img
            src={source}
            srcSet={responsiveSources}
            sizes="(max-width: 640px) calc(100vw - 3rem), (max-width: 1280px) 45vw, 31vw"
            alt={'Live homepage screenshot of ' + app.name}
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            width="480"
            height="300"
            loading="lazy"
            fetchPriority="low"
            decoding="async"
            onError={() => setFailed(true)}
          />
        )}
        <span className="absolute bottom-1 left-2 rounded-full border border-white/20 bg-black/75 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white">
          Homepage preview
        </span>
      </a>
      <div className="flex min-h-0 flex-col p-2">
        <h3 className="truncate font-serif text-sm font-semibold tracking-tight text-fg">{app.name}</h3>
        <p className="mt-0.5 min-h-0 line-clamp-2 overflow-hidden text-[10px] leading-4 text-muted">{app.description}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="public-section-action rounded-md bg-accent px-2 text-[10px] font-bold text-bg transition-opacity hover:opacity-85"
          >
            Open App <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          <a
            href={codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={'View ' + app.name + ' on GitHub'}
            aria-label={'View ' + app.name + ' repository on GitHub'}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-fg transition-colors hover:border-accent hover:text-accent"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            onClick={() => { setFailed(false); setRefresh(Date.now()); }}
            title={'Refresh ' + app.name + ' screenshot'}
            aria-label={'Refresh ' + app.name + ' live homepage screenshot'}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-fg transition-colors hover:border-accent hover:text-accent"
            style={staticSource ? { display: 'none' } : undefined}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

const GitHubAppGallery: React.FC = () => {
  const [apps, setApps] = useState<App[]>(() => getCachedApps() ?? STARTER_APPS);

  useEffect(() => {
    if (getCachedApps()) return;
    const controller = new AbortController();

    // Automatically add newly published public apps in this GitHub account.
    // No GitHub credentials are exposed in the public website.
    fetch('https://api.github.com/users/marcusdhaynes/repos?per_page=100&type=owner', {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    })
      .then(response => {
        if (!response.ok) throw new Error('Unable to refresh public repository list');
        return response.json() as Promise<PublicRepo[]>;
      })
      .then(repos => {
        if (controller.signal.aborted || !Array.isArray(repos)) return;
        const combined = new Map(STARTER_APPS.map(app => [app.repo.toLowerCase(), app]));
        for (const repo of repos) {
          if (!repo.has_pages || repo.archived || repo.fork || repo.size === 0) continue;
          const key = repo.name.toLowerCase();
          if (combined.has(key) || EXCLUDED_REPOS.has(key)) continue;
          const fallbackUrl = 'https://marcusdhaynes.github.io/' + encodeURIComponent(repo.name) + '/';
          const homepage = repo.homepage?.trim();
          const url = homepage && /^https?:\/\/[^\s]+/i.test(homepage) ? homepage : fallbackUrl;
          combined.set(key, {
            repo: repo.name,
            name: repo.name.replace(/[_-]/g, ' '),
            description: repo.description || 'Explore this application.',
            url,
          });
        }
        const latest = Array.from(combined.values()).sort((a, b) => a.name.localeCompare(b.name));
        setApps(latest);
        saveCachedApps(latest);
      })
      .catch(() => {
        // Use the known app catalog when GitHub is unavailable or rate-limited.
      });

    return () => controller.abort();
  }, []);

  return (
    <section aria-labelledby="github-apps-heading" className="relative mx-auto max-w-[1600px] px-6 pb-12 pt-8 lg:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">Built by Somniel</p>
          <h2 id="github-apps-heading" className="mt-2 font-serif text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Our Applications
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted">
            Live homepage screenshots of published GitHub applications. Select an image or Open App to visit the site.
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted">
          {apps.length} applications
        </span>
      </div>
      <div className="public-section-grid">
        {apps.map(app => <AppCard key={app.repo} app={app} />)}
      </div>
    </section>
  );
};

export default GitHubAppGallery;
