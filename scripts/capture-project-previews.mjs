import { readFile, mkdir, stat, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

// Actual public pages, captured after their client JavaScript is given time
// to render. Unlike thum.io's instant snapshot, this captures the current
// application itself instead of a loading placeholder.
const source = await readFile('src/components/projects/GitHubAppGallery.tsx', 'utf8');
const catalog = source.slice(source.indexOf('const STARTER_APPS:'), source.indexOf('const EXCLUDED_REPOS'));
const apps = [...catalog.matchAll(/\{\s*repo:\s*'([^']+)'[^}]*?\burl:\s*'([^']+)'/g)].map(([, name, url]) => ({ name, url }));
const chrome = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
if (!chrome) {
  console.warn('Live screenshot capture skipped: Chrome unavailable.');
  process.exit(0);
}
const dir = join('dist', 'thumbnails', 'live');
await mkdir(dir, { recursive: true });
const manifest = {};
let cursor = 0;
async function capture({ name, url }) {
  const slug = name.toLowerCase();
  // The gallery URLs are curated and public; don't browse arbitrary network
  // hosts from metadata loaded through the GitHub API.
  if (!/^https:\/\/marcusdhaynes\.github\.io\/[A-Za-z0-9-]+\/?$/.test(url)) return;
  const filename = join(dir, slug + '.png');
  const args = [
    '--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
    '--disable-background-networking', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=1200,750',
    '--virtual-time-budget=10000', '--run-all-compositor-stages-before-draw',
    '--screenshot=' + filename, url
  ];
  const child = spawn(chrome, args, { stdio: 'ignore' });
  const result = await new Promise(resolve => {
    const timeout = setTimeout(() => { child.kill('SIGKILL'); resolve(false); }, 30000);
    child.on('exit', code => { clearTimeout(timeout); resolve(code === 0); });
    child.on('error', () => { clearTimeout(timeout); resolve(false); });
  });
  let size = 0;
  try { size = (await stat(filename)).size; } catch {}
  if (!result || size < 18000) {
    await rm(filename, { force: true });
    console.warn('Preview unavailable or uninformative for ' + name + '; UI will fall back to its existing thumbnail.');
    return;
  }
  manifest[slug] = 'thumbnails/live/' + slug + '.png';
  console.log('Captured live content: ' + name + ' (' + size + ' bytes)');
}
async function worker() {
  while (cursor < apps.length) await capture(apps[cursor++]);
}
await Promise.all([worker(), worker(), worker()]);
await writeFile(join('dist', 'thumbnails', 'manifest.json'), JSON.stringify(manifest));
console.log('Captured ' + Object.keys(manifest).length + ' / ' + apps.length + ' public application previews.');
