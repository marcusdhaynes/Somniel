import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

// Prevent a deployed CSS regression: all public cards must have the same
// small HEIGHT. Widths and action buttons intentionally retain their prior
// (pre-compact-width-change) layout.
const source = await readFile('src/index.css', 'utf8');
const cssCheck = [
  ['112px uniform banner height', /\.public-section-card\s*\{[^}]*height:\s*7rem\s*;/s],
  ['previous 288px max width', /\.public-section-card\s*\{[^}]*max-width:\s*18rem\s*;/s],
  ['original button size', /\.public-section-action\s*\{[^}]*width:\s*9rem\s*;/s],
  ['no forced 208px width', /--public-tile-width/],
];
for (const [label, pattern] of cssCheck) {
  const found = pattern.test(source);
  if (label === 'no forced 208px width' ? found : !found) {
    throw new Error('Public card geometry check failed: ' + label);
  }
}
const assets = await readdir('dist/assets');
const stylesheets = assets.filter(file => file.endsWith('.css'));
if (!stylesheets.length) throw new Error('No production CSS was generated');
const compiled = (await Promise.all(stylesheets.map(file => readFile(join('dist/assets',file),'utf8')))).join('\n');
if (!/\.public-section-card\s*\{[^}]*height:\s*7rem/s.test(compiled) ||
    !compiled.includes('.public-section-action')) {
  throw new Error('Uniform compact banner height missing from compiled production CSS');
}
for (const path of [
  'src/pages/public/Subsidiaries.tsx',
  'src/pages/public/Founders.tsx',
  'src/pages/public/Projects.tsx',
]) {
  const jsx = await readFile(path, 'utf8');
  if (!jsx.includes('public-section-card')) throw new Error('Unstyled banner: ' + path);
}
const gallery = await readFile('src/components/projects/GitHubAppGallery.tsx', 'utf8');
if (!gallery.includes('project-preview-card') ||
    !gallery.includes('aspect-[16/10]') ||
    !gallery.includes('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3') ||
    gallery.includes('style={{ height: 112') ||
    gallery.includes('public-section-card')) {
  throw new Error('Large 16:10 app thumbnails must remain independent from uniform-size content banners');
}
console.log('PASS: ordinary content banners remain 112px; Projects previews retain their original large 16:10 gallery.');
