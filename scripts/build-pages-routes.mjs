import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const routes = [
  'login', 'projects', 'founders', 'subsidiaries', 'auth-bridge',
  'dashboard', 'dashboard/files', 'dashboard/settings',
  'admin', 'admin/employees', 'admin/payroll', 'admin/payscale',
  'admin/cms', 'admin/roadmap', 'admin/settings',
];
const root = 'dist';
const source = join(root, 'index.html');
const html = await readFile(source, 'utf8');
if (!html.includes('/Somniel/assets/')) throw new Error('GitHub Pages SPA routes require /Somniel/ asset base');
for (const route of routes) {
  const path = join(root, route);
  await mkdir(path, { recursive: true });
  await copyFile(source, join(path, 'index.html'));
}
console.log('Created '+routes.length+' direct deep-link routes for GitHub Pages (HTTP 200).');
