import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Validate the card dimensions in both source AND compiled CSS, since a
// production-only cascade regression previously made deployed cards too wide.
const source = await readFile('src/index.css', 'utf8');
const expectations = [
  ['card width', /--public-tile-width:\s*13rem\s*;/],
  ['card height', /--public-tile-height:\s*9\.25rem\s*;/],
  ['action width', /\.public-section-action\s*\{[^}]*width:\s*7\.5rem\s*;/s],
  ['unlayered card selector', /^\.public-section-grid\s*>\s*\.public-section-card\s*\{/m],
];
for (const [label, pattern] of expectations) {
  if (!pattern.test(source)) throw new Error('Public geometry regression: ' + label);
}
const assets = await readdir('dist/assets');
const cssFiles = assets.filter(f => f.endsWith('.css'));
if (!cssFiles.length) throw new Error('No compiled production CSS');
const compiled = (await Promise.all(cssFiles.map(f => readFile(join('dist/assets', f), 'utf8')))).join('\n');
for (const token of ['--public-tile-width', '--public-tile-height', '.public-section-action', '.public-section-grid']) {
  if (!compiled.includes(token)) throw new Error('Missing public geometry in compiled CSS: ' + token);
}
for (const path of [
  'src/pages/public/Subsidiaries.tsx',
  'src/pages/public/Founders.tsx',
  'src/pages/public/Projects.tsx',
  'src/components/projects/GitHubAppGallery.tsx',
]) {
  const jsx = await readFile(path,'utf8');
  if (!jsx.includes('public-section-card')) throw new Error('Shared geometry missing from ' + path);
}
console.log('PASS: all public cards compile with shared 208x148px geometry and 120px actions.');
