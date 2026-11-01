import { createServer } from 'node:http';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { spawn } from 'node:child_process';

const dist = join(process.cwd(), 'dist');
const marker = '__verify-rendered-card-height.html';
const sample = String.raw`<!doctype html><html lang="en"><head><meta charset="utf-8"></head>
<body><pre id="result" data-status="pending">Measuring...</pre>
<script>
(async () => {
  const pages = ['subsidiaries', 'founders', 'projects'];
  const results = [];
  const timeout = 16000;
  try {
    for (const page of pages) {
      const iframe = document.createElement('iframe');
      iframe.src = '/' + page + '/';
      iframe.style.cssText = 'position:absolute;top:10000px;left:0;width:1200px;height:1600px;opacity:0;pointer-events:none;border:0';
      document.body.append(iframe);
      const start = Date.now();
      let cards = [];
      while (Date.now() - start < timeout) {
        try {
          cards = [...iframe.contentDocument.querySelectorAll('.public-section-card')];
          if (cards.length) break;
        } catch {}
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (!cards.length) throw Error('No React-rendered cards at /' + page);
      const sizes = cards.map(card => ({
        height: Number(card.getBoundingClientRect().height.toFixed(2)),
        computedHeight: getComputedStyle(card).height,
        width: Number(card.getBoundingClientRect().width.toFixed(2)),
      }));
      if (sizes.some(card => Math.abs(card.height - 144) > 0.5)) {
        throw Error(page + ' mismatched height: ' + JSON.stringify(sizes));
      }
      results.push({ page, count: sizes.length, distinctHeights: [...new Set(sizes.map(c => c.height))], sizes: sizes.slice(0,3) });
      iframe.remove();
    }
    document.getElementById('result').dataset.status = 'pass';
    document.getElementById('result').textContent = JSON.stringify(results);
  } catch (error) {
    document.getElementById('result').dataset.status = 'fail';
    document.getElementById('result').textContent = String(error);
  }
})();
</script></body></html>`;

const file = join(dist, marker);
await writeFile(file, sample);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
};
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const path = normalize(join(dist, rel));
    if (!path.startsWith(dist + '/') && path !== dist) {
      response.writeHead(403).end();
      return;
    }
    let resolved = path;
    if (existsSync(join(path, 'index.html'))) resolved = join(path, 'index.html');
    else if (!existsSync(resolved)) resolved = join(dist, 'index.html');
    const data = await readFile(resolved);
    response.writeHead(200, { 'Content-Type': mime[extname(resolved)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(data);
  } catch (error) {
    response.writeHead(404).end(String(error));
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const browsers = [process.env.CHROME_BIN, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'].filter(Boolean);
const browser = browsers.find(p => existsSync(p));
if (!browser) throw Error('Chromium/Google Chrome unavailable for rendered-layout verification');
let out = '';
let err = '';
try {
  const chrome = spawn(browser, [
    '--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--no-first-run', '--no-default-browser-check',
    '--virtual-time-budget=55000', '--dump-dom',
    'http://127.0.0.1:' + port + '/' + marker,
  ], { stdio: ['ignore','pipe','pipe'] });
  chrome.stdout.on('data', b => { if (out.length < 6000000) out += String(b); });
  chrome.stderr.on('data', b => { if (err.length < 20000) err += String(b); });
  const exit = await new Promise(resolve => {
    chrome.on('exit', code => resolve(code));
    chrome.on('error', error => resolve(error));
  });
  const match = out.match(/<pre id="result" data-status="(pass|fail)">([^<]*)<\/pre>/);
  if (exit !== 0 || !match || match[1] !== 'pass') {
    throw Error('Rendered card-height check failed: ' +
      (match?.[2] || 'no browser result') + '; Chrome status: ' + exit +
      '; diagnostics: ' + err.slice(-850));
  }
  console.log('PASS: browser measured identical 144px outer card heights on Subsidiaries, Founders, and Projects.');
  console.log(match[2].replaceAll('&quot;', '"'));
} finally {
  await new Promise(resolve => server.close(resolve));
  await unlink(file).catch(() => {});
}
