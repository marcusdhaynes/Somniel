import { readFile, appendFile } from 'node:fs/promises';
import { fetchPublicApps, catalogSignature } from './project-app-catalog.mjs';

async function needsRefresh() {
  const gallery = await readFile('src/components/projects/GitHubAppGallery.tsx', 'utf8');
  const block = gallery.slice(gallery.indexOf('const STARTER_APPS:'), gallery.indexOf('const EXCLUDED_REPOS'));
  const curated = [...block.matchAll(/\{\s*repo:\s*'([^']+)'[^}]*?\burl:\s*'([^']+)'/g)]
    .map(([, repo, url]) => ({ repo, url, pushedAt: '' }));
  // On GitHub API failure, run a fresh build rather than assuming no changes.
  const publicApps = await fetchPublicApps();
  const combined = new Map(curated.map(app => [app.repo.toLowerCase(), app]));
  for (const app of publicApps) {
    const key = app.repo.toLowerCase();
    combined.set(key, { ...(combined.get(key) || {}), ...app });
  }
  const signature = catalogSignature([...combined.values()]);
  const url = (process.env.SOMNIEL_PREVIEW_MANIFEST_URL ||
    'https://somniel.com/thumbnails/manifest.json') + '?check=' + Date.now();
  const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(18000) });
  if (!response.ok) return true;
  const live = await response.json();
  if (live.schema !== 2 || live.signature !== signature) {
    console.log('A new app, modified app or catalog format was detected.');
    return true;
  }
  // App deployments can finish AFTER the repository push. Compare the
  // published homepage's stable ETag so screenshots refresh when the actual
  // public application changes, even if the Git SHA did not change again.
  const monitored = Object.values(live.apps || {}).filter(app => {
    if (!app || !app.siteStamp) return false;
    try {
      const site = new URL(app.url);
      return site.protocol === 'https:' &&
        site.hostname === 'marcusdhaynes.github.io' &&
        /^\/[A-Za-z0-9_.-]+\/?$/.test(site.pathname);
    } catch { return false; }
  }).slice(0, 80);
  let next = 0;
  let deploymentChanged = false;
  async function check() {
    while (next < monitored.length && !deploymentChanged) {
      const app = monitored[next++];
      try {
        const res = await fetch(app.url, { method: 'HEAD', cache: 'no-store',
          signal: AbortSignal.timeout(7000) });
        if (!res.ok) continue;
        const currentStamp = res.headers.get('etag') ||
          res.headers.get('last-modified') || '';
        if (currentStamp && currentStamp !== app.siteStamp) {
          console.log('Deployed homepage updated:', app.repo);
          deploymentChanged = true;
        }
      } catch { /* Offline app: preserve the last usable capture. */ }
    }
  }
  await Promise.all([check(), check(), check(), check()]);
  if (deploymentChanged) return true;
  // Refresh unchanged apps daily as a safety net for deployed site changes
  // not represented by a fresh repository push.
  const age = Date.now() - Date.parse(live.generatedAt || '');
  return !Number.isFinite(age) || age > 24 * 60 * 60 * 1000;
}
let changed = true;
try { changed = await needsRefresh(); }
catch (error) { console.warn('Could not confirm current previews:', error.message); }
console.log(changed ? 'Project previews need regeneration.' : 'Project previews are up to date.');
if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, 'should_deploy=' + changed + '\n');
}
