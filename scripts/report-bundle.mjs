// Report actual production transfer sizes so future perf changes are measurable.
// This runs after Vite builds and does not require external services or API keys.
import { readdir, readFile, appendFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
const root = new URL('../dist/assets/', import.meta.url);
let files = [];
try { files = await readdir(root); }
catch { console.error('No production dist/assets directory; run npm run build first.'); process.exit(1); }
const assets = [];
for (const filename of files) {
  if (!/\.(js|css)$/.test(filename)) continue;
  const data = await readFile(new URL(filename, root));
  assets.push({ file: filename, kb: data.byteLength / 1024, gzip: gzipSync(data, { level: 6 }).byteLength / 1024, kind: filename.endsWith('.css') ? 'CSS' : 'JS' });
}
assets.sort((a,b) => b.gzip-a.gzip);
const human = n => n.toFixed(1) + ' KiB';
const total = kind => assets.filter(x => x.kind === kind).reduce((s,x)=>s+x.gzip,0);
const lines = [
  '## Somniel production asset sizes',
  '',
  'Hashed, page-specific chunks are **not** all downloaded on initial load.',
  '',
  '| Asset | Uncompressed | Gzip transfer |',
  '| --- | ---: | ---: |',
  ...assets.slice(0,16).map(x => '| `' + x.file + '` | ' + human(x.kb) + ' | ' + human(x.gzip) + ' |'),
  '',
  '**All JS chunks combined:** ' + human(total('JS')) + '. **All CSS:** ' + human(total('CSS')) + '.',
  '',
  'Inspect the initial-entry dependency graph separately in browser DevTools; this total is not initial download.',
];
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
