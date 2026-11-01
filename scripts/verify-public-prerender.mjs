import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const mode = process.argv[2];
if (!['pages','dreamhost'].includes(mode)) throw new Error('Mode required');
const prefix = mode === 'pages' ? '/Somniel/assets/' : '/assets/';
for (const [route,title] of [
  ['','The Architecture of Tomorrow'], ['projects','Future Initiatives'],
  ['founders','Meet the Founders'], ['subsidiaries','Subsidiary Businesses']
]) {
  const file = join('dist',route,'index.html');
  const html = await readFile(file,'utf8');
  if (!html.includes('<div id="somniel-static-shell">') || !html.includes(title) ||
    !html.includes(prefix) || !html.includes('id="root"')) {
    throw new Error('Broken pre-rendered page '+file);
  }
}
console.log('PASS '+mode+': four public routes have initial HTML, JS assets and a React mount.');
