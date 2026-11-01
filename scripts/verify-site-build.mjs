import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const mode = process.argv[2];
const expectedBase = mode === 'pages' ? '/Somniel/' : mode === 'dreamhost' ? '/' : mode === 'portable' ? './' : null;
if (!expectedBase) throw new Error('Specify pages or dreamhost');
const dir = 'dist';
const html = await readFile(join(dir, 'index.html'), 'utf8');
if (!/<div id="root"><\/div>/.test(html)) throw new Error('Missing React root in production index');
const assetUrls = [...html.matchAll(/(?:src|href)="([^"]*\/assets\/[^"]+)"/g)].map(m => m[1]);
if (!assetUrls.length) throw new Error('No entry asset URLs found in index.html');
for (const url of assetUrls) {
  if (!url.startsWith(expectedBase + 'assets/')) throw new Error('Incorrect asset URL for ' + mode + ': ' + url);
}
if (mode === 'dreamhost') {
  const conf = await readFile(join(dir, '.htaccess'), 'utf8');
  if (!/RewriteEngine On/.test(conf) || !/RewriteRule \^ index\.html \[L\]/.test(conf)) {
    throw new Error('No server-side SPA fallback for direct URL loads');
  }
}
for (const f of ['index.html','sw.js']) {
  if (!(await stat(join(dir, f))).isFile()) throw new Error('Missing ' + f);
}
console.log('PASS '+mode+': '+assetUrls.length+' absolute entry assets, React app shell, route infrastructure verified');
