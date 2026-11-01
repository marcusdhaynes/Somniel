import { readFile, appendFile } from 'node:fs/promises';
const names = ['home','projects','founders'];
const lines = [
  '## Lighthouse mobile lab measurements',
  '',
  'These are simulated mobile lab measurements, not real-user Core Web Vitals. ' +
  'Lighthouse TBT is only a proxy for responsiveness; it is not INP.',
  '',
  '| Page | Performance | LCP | CLS | TBT |',
  '| --- | ---: | ---: | ---: |'
];
let count = 0;
for (const name of names) {
  try {
    const report = JSON.parse(await readFile('lighthouse-results/'+name+'.json','utf8'));
    const a = report.audits || {};
    const fmt = key => a[key]?.displayValue ?? 'n/a';
    lines.push('| '+name+' | '+Math.round((report.categories?.performance?.score ?? 0)*100) +
      '/100 | '+fmt('largest-contentful-paint')+' | '+fmt('cumulative-layout-shift')+
      ' | '+fmt('total-blocking-time')+' |');
    count++;
  } catch {
    lines.push('| '+name+' | unavailable | — | — | — |');
  }
}
if (!count) lines.push('', 'No measurements collected; the site remains deployed.');
lines.push('', 'Targets: LCP ≤2.5 s, CLS ≤0.1, TBT ≤200 ms (lab proxy). ' +
  'Compare consistent repeat runs before attributing changes to a code commit.');
console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) {
  await appendFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n')+'\n');
}
