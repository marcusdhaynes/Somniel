import { readFile, mkdir, stat, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fetchPublicApps, catalogSignature, slug } from './project-app-catalog.mjs';
import { imageDifference } from './png-preview-contrast.mjs';

// Build-time captures are taken from real, public app deployments. Every new
// app and every new GitHub push gets a distinct immutable screenshot filename.
const source = await readFile('src/components/projects/GitHubAppGallery.tsx', 'utf8');
const block = source.slice(source.indexOf('const STARTER_APPS:'), source.indexOf('const EXCLUDED_REPOS'));
const curated = [...block.matchAll(/\{\s*repo:\s*'([^']+)'[^}]*?\burl:\s*'([^']+)'/g)]
  .map(([, repo, url]) => ({ repo, url, name: repo.replace(/[_-]/g, ' '),
    description: 'Explore this application.', pushedAt: '' }));
let publicApps = [];
try { publicApps = await fetchPublicApps(); }
catch (error) { console.warn('Public app discovery failed:', error.message, 'Using known catalog.'); }
const appMap = new Map(curated.map(app => [app.repo.toLowerCase(), app]));
for (const app of publicApps) {
  const key = app.repo.toLowerCase();
  appMap.set(key, { ...(appMap.get(key) || {}), ...app });
}
const apps = [...appMap.values()].sort((a, b) => a.name.localeCompare(b.name));
const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium'].filter(Boolean).find(existsSync);
const dir = join('dist', 'thumbnails', 'live');
await mkdir(dir, { recursive: true });
const manifest = { schema: 2, generatedAt: new Date().toISOString(),
  signature: catalogSignature(apps), apps: {} };
let cursor = 0;

function deployedGithubPage(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'marcusdhaynes.github.io' &&
      /^\/[A-Za-z0-9_.-]+\/?$/.test(url.pathname) && !url.search && !url.hash;
  } catch { return false; }
}
async function probeSite(site) {
  try {
    const response = await fetch(site, { method: 'HEAD', redirect: 'follow', cache: 'no-store',
      signal: AbortSignal.timeout(12000), headers: { 'User-Agent': 'Somniel-Preview-Check' } });
    if (!response.ok || (response.headers.get('content-type') &&
      !response.headers.get('content-type').includes('text/html'))) return { ok: false };
    return { ok: true, siteStamp: response.headers.get('etag') ||
      response.headers.get('last-modified') || '' };
  } catch { return { ok: false }; }
}
async function screenshot(site, filename, dark) {
  const args = [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-networking', '--hide-scrollbars',
    '--disable-extensions', '--disable-features=TranslateUI',
    '--force-color-profile=srgb', '--force-device-scale-factor=1',
    '--window-size=1200,750', '--virtual-time-budget=12000',
    '--run-all-compositor-stages-before-draw',
    ...(dark ? ['--force-dark-mode'] : []),
    '--screenshot=' + filename, site
  ];
  const child = spawn(chrome, args, { stdio: 'ignore' });
  const completed = await new Promise(resolve => {
    const timeout = setTimeout(() => { child.kill('SIGKILL'); resolve(false); }, 30000);
    child.on('exit', code => { clearTimeout(timeout); resolve(code === 0); });
    child.on('error', () => { clearTimeout(timeout); resolve(false); });
  });
  const size = await stat(filename).then(file => file.size).catch(() => 0);
  // Small legitimate app homepages often compress below 18 KB. Never
  // reject a real PNG merely because it is visually simple.
  if (!completed || size < 1200) {
    await rm(filename, { force: true });
    return false;
  }
  return true;
}

async function capture(app) {
  const key = slug(app.repo);
  const entry = { repo: app.repo, name: app.name, description: app.description,
    url: app.url, pushedAt: app.pushedAt, modes: {} };
  manifest.apps[key] = entry;
  // Build jobs can only navigate verified public GitHub Pages sites; avoid SSRF
  // through arbitrary homepage values returned by a repository API.
  if (!deployedGithubPage(app.url)) return;
  const deployment = await probeSite(app.url);
  if (!deployment.ok) console.warn('Homepage HEAD check unavailable for ' + app.repo + '; trying Chrome directly.');
  entry.siteStamp = deployment.siteStamp || '';
  if (!chrome) return;
  const version = createHash('sha256').update(app.url + '|' + app.pushedAt +
    '|' + entry.siteStamp + '|' + manifest.generatedAt).digest('hex').slice(0, 12);
  const lightName = key + '-' + version + '-light.png';
  const darkName = key + '-' + version + '-dark.png';
  const lightFile = join(dir, lightName), darkFile = join(dir, darkName);
  if (!(await screenshot(app.url, lightFile, false))) {
    console.warn('Could not capture live site:', app.repo);
    return;
  }
  entry.modes.light = 'thumbnails/live/' + lightName;
  if (await screenshot(app.url, darkFile, true)) {
    const contrast = await imageDifference(lightFile, darkFile);
    // Advertise a second mode only if the rendered application actually
    // changes visually; avoid a fake Dark button for one-theme-only sites.
    if (contrast >= 13) entry.modes.dark = 'thumbnails/live/' + darkName;
    else await rm(darkFile, { force: true });
  }
  entry.capturedAt = manifest.generatedAt;
  console.log('Captured ' + app.repo + ' (' + Object.keys(entry.modes).join('/') +
    ', source version ' + (app.pushedAt || 'unversioned') + ')');
}
async function worker() {
  while (cursor < apps.length) await capture(apps[cursor++]);
}
await Promise.all([worker(), worker(), worker()]);
await writeFile(join('dist', 'thumbnails', 'manifest.json'), JSON.stringify(manifest));
const count = Object.values(manifest.apps).filter(app => app.modes.light).length;
const dual = Object.values(manifest.apps).filter(app => app.modes.dark).length;
console.log('Somniel catalog: ' + apps.length + ' public apps, ' + count +
  ' real homepage captures, ' + dual + ' distinct two-theme captures.');
