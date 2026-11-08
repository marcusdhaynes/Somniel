import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { catalogFromRepos, catalogSignature, safeHomepage } from './project-app-catalog.mjs';

const published = {
  name: 'NewApp', has_pages: true, private: false, archived: false,
  fork: false, size: 125, homepage: '', description: 'A new public app',
  pushed_at: '2026-11-07T18:00:00Z'
};
const discovered = catalogFromRepos([
  published,
  { ...published, name: 'PrivateApp', private: true },
  { ...published, name: 'Somniel' },
  { ...published, name: 'inbox-reborn' },
  { ...published, name: 'Empty', size: 0 },
  { ...published, name: 'ArchivedApp', archived: true },
  { ...published, name: 'NonDeployed', has_pages: false }
]);
assert.equal(discovered.length, 1, 'Only public deployed applications may be discovered');
assert.equal(discovered[0].repo, 'NewApp');
assert.equal(discovered[0].url, 'https://marcusdhaynes.github.io/NewApp/');
assert.equal(safeHomepage('javascript:alert(1)', 'NewApp'), discovered[0].url);
assert.notEqual(catalogSignature(discovered),
  catalogSignature([{ ...discovered[0], pushedAt: '2026-11-07T19:00:00Z' }]),
  'A new commit must change the deployment manifest signature');

const gallery = readFileSync('src/components/projects/GitHubAppGallery.tsx', 'utf8');
const capture = readFileSync('scripts/capture-project-previews.mjs', 'utf8');
const checker = readFileSync('scripts/check-project-updates.mjs', 'utf8');
const dreamhost = readFileSync('.github/workflows/deploy-dreamhost.yml', 'utf8');
const pages = readFileSync('.github/workflows/pages.yml', 'utf8');
for (const [label, source] of [['gallery', gallery], ['capture', capture],
  ['checker', checker], ['DreamHost', dreamhost], ['Pages', pages]]) {
  assert.ok(source.length > 400, label + ' integration is missing');
}
assert.ok(gallery.includes('setInterval') && gallery.includes('visibilitychange'),
  'Catalog must refresh while open and after tab focus');
assert.ok(gallery.includes('pushed_at') && gallery.includes('somnielPreviewVersion'),
  'Preview links must update when published code changes');
assert.ok(gallery.includes('aria-pressed') && gallery.includes('darkAvailable'),
  'Light/Dark controls must be accessible and displayed only for verified modes');
assert.ok(gallery.includes('manifest.schema === 2'),
  'Gallery must validate the versioned capture manifest');
assert.ok(capture.includes('catalogFromRepos') === false && capture.includes('fetchPublicApps'),
  'Build must discover new public applications dynamically');
assert.ok(capture.includes("createHash('sha256')") && capture.includes('imageDifference'),
  'Captures must use immutable version filenames and verify actual visual differences');
assert.ok(checker.includes('catalogSignature') && checker.includes('should_deploy='),
  'Scheduled update check must compare real published app versions');
assert.ok(dreamhost.includes('schedule:') && dreamhost.includes('project_updates:'),
  'Production preview refresh must run on a schedule');
assert.ok(pages.includes('schedule:') && pages.includes('project_updates:'),
  'GitHub Pages preview refresh must run on a schedule');
console.log('PASS projects: new public apps, push-driven updates, distinct light/dark previews and refresh schedule.');
