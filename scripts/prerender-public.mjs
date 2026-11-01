import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PUBLIC_DEFAULTS as data } from '../src/data/publicFallback.mjs';

// Static, meaningful HTML is available before React and Firebase execute.
// React remains authoritative for CMS updates and all interactive controls.
// These documents are build-generated snapshots of the same defaults used by
// the client, not a second content database and never contain private data.
const mode = process.argv[2];
if (!['dreamhost', 'pages'].includes(mode)) throw new Error('Expected dreamhost or pages');
const base = mode === 'pages' ? '/Somniel/' : '/';
const source = await readFile(join('dist', 'index.html'), 'utf8');
const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[ch]);
const safeUrl = value => {
  const url = String(value || '');
  return /^(https:\/\/|\/(?!\/)|#)/i.test(url) ? escape(url) : '#';
};

const style = '<style id="somniel-first-paint">' +
  'html.somniel-js #somniel-static-shell,#root:not(:empty)+#somniel-static-shell{display:none!important}' +
  '#somniel-static-shell{min-height:100vh;background:var(--bg,#f3f2ee);color:var(--fg,#1a1a1a);font-family:Inter,system-ui,sans-serif}' +
  '#somniel-static-shell nav{min-height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 3%;border-bottom:1px solid rgba(120,120,120,.16)}' +
  '#somniel-static-shell nav a{color:inherit;text-decoration:none;font-weight:650;font-size:12px}' +
  '#somniel-static-shell nav span{display:flex;gap:18px;flex-wrap:wrap}' +
  '#somniel-static-shell nav span a{font-size:11px;opacity:.78}' +
  '#somniel-static-shell main{max-width:1250px;margin:0 auto;padding:40px 20px 70px;text-align:center}' +
  '#somniel-static-shell h1{font-family:"Playfair Display",Georgia,serif;font-size:clamp(34px,5.4vw,70px);letter-spacing:-.05em;line-height:1.06;margin:8px auto 16px;max-width:1000px}' +
  '#somniel-static-shell p{font-size:clamp(13px,1.3vw,18px);line-height:1.65;color:var(--muted,#777);max-width:680px;margin:0 auto 22px}' +
  '#somniel-static-shell .eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.22em;color:var(--accent,#e8c48c)}' +
  '#somniel-static-shell .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),288px));justify-content:center;gap:12px;margin:30px auto 0;text-align:left}' +
  '#somniel-static-shell .tile{height:9rem;min-height:9rem;box-sizing:border-box;overflow:hidden}' +
  '#somniel-static-shell .tile{padding:12px;border-radius:12px;border:1px solid var(--border,#ddd);background:var(--surface,#fff);min-width:0}' +
  '#somniel-static-shell .tile h2{font-size:17px;margin:0 0 10px;font-family:Georgia,serif}' +
  '#somniel-static-shell .tile p{font-size:12px;margin:0;line-height:1.5}' +
  '#somniel-static-shell .tile img{width:70px;height:70px;object-fit:cover;border-radius:10px;float:left;margin:0 14px 8px 0}' +
  '#somniel-static-shell .cta{display:inline-flex;padding:12px 22px;border-radius:30px;background:var(--accent,#e8c48c);color:var(--bg,#111);text-decoration:none;font-size:12px;font-weight:bold}' +
  '@media(max-width:650px){#somniel-static-shell nav span{gap:9px}#somniel-static-shell nav span a{font-size:9px}#somniel-static-shell main{padding-top:28px}}' +
  '</style>';

const navigation = '<nav><a href="' + base + '">SOMNIEL</a><span>' +
  [['Subsidiaries', 'subsidiaries/'], ['Founders', 'founders/'], ['Projects', 'projects/']]
  .map(([title, url]) => '<a href="' + base + url + '">' + title + '</a>').join('') + '</span></nav>';
const card = (title, description, img, url) => '<article class="tile">' +
  (img ? '<img src="' + safeUrl(img) + '" alt="" width="70" height="70" decoding="async" loading="lazy">' : '') +
  '<h2>' + escape(title) + '</h2><p>' + escape(description) + '</p>' +
  (url ? '<a href="' + safeUrl(url) + '" rel="noopener noreferrer">Visit</a>' : '') + '</article>';
const apps = ['Calliopen','Calypso','Candlelight','ChatGPTBackup','Deltos',
  'MarmaladePlayer','Pheme','ProSeU','Sennet','Starborn','Subversion'];
const pages = {
  '': {
    title: 'Somniel Holdings LLC',
    eyebrow: 'The Architecture of Tomorrow',
    headline: data.hero.title,
    text: data.hero.subtitle,
    cards: [
      card('Global Reach','Operating across multiple continents.'),
      card('Enterprise Security','Robust governance and risk management.'),
      card('Rapid Innovation','Accelerating growth through R&D.'),
      card('Strategic Growth','Expanding through targeted acquisitions.')
    ].join(''),
    action: '<a class="cta" href="' + base + 'subsidiaries/">' + escape(data.hero.cta) + '</a>'
  },
  subsidiaries: {
    title: 'Subsidiaries | Somniel',
    eyebrow: 'Our Ecosystem',
    headline: 'Subsidiary Businesses',
    text: 'A diverse ecosystem of market-leading companies operating across multiple sectors.',
    cards: data.subsidiaries.map(x => card(x.name, x.description, x.logo, x.website)).join('')
  },
  founders: {
    title: 'Founders | Somniel',
    eyebrow: 'The Visionaries',
    headline: 'Meet the Founders',
    text: 'Visionary leaders committed to building the future of enterprise architecture.',
    cards: data.founders.map(x => card(x.name + ' — ' + x.role, x.bio, x.photo)).join('')
  },
  projects: {
    title: 'Projects | Somniel',
    eyebrow: 'Innovation Lab',
    headline: 'Future Initiatives',
    text: 'Experimental ventures and emerging technologies architected to redefine the boundaries of modern enterprise.',
    cards: apps.map(name => card(name, 'Somniel application', null,
      'https://marcusdhaynes.github.io/' + encodeURIComponent(name) + '/')).join('') +
      data.projects.map(x => card(x.name, x.description)).join('')
  }
};

if (!source.includes('<div id="root"></div>')) throw new Error('Missing empty React mount node');
for (const [route, page] of Object.entries(pages)) {
  const document = '<div id="somniel-static-shell">' + navigation +
    '<main><div class="eyebrow">' + escape(page.eyebrow) + '</div>' +
    '<h1>' + escape(page.headline) + '</h1><p>' + escape(page.text) + '</p>' +
    (page.action || '') + '<section class="grid">' + page.cards + '</section></main></div>';
  const output = source
    .replace(/<title>[\s\S]*?<\/title>/, '<title>' + escape(page.title) + '</title>')
    .replace('</head>', style + '</head>')
    .replace('<div id="root"></div>', '<div id="root"></div>' + document);
  const dest = join('dist', route);
  await mkdir(dest, { recursive: true });
  await writeFile(join(dest, 'index.html'), output);
}

// The non-public routes remain client-rendered and do not expose sensitive
// content in the build. On DreamHost, provide actual entry files for every
// deep URL so the server can return HTTP 200 without a redirect or 404.
if (mode === 'dreamhost') {
  const privateRoutes = [
    'login', 'auth-bridge', 'dashboard', 'dashboard/files', 'dashboard/settings',
    'admin', 'admin/employees', 'admin/payroll', 'admin/payscale',
    'admin/cms', 'admin/roadmap', 'admin/settings'
  ];
  for (const route of privateRoutes) {
    const dir = join('dist', route);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), source);
  }
}
console.log('Pre-rendered four public HTML pages and kept private routes client-only for ' + mode + '.');
