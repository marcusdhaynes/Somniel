import { readFile } from 'node:fs/promises';

// Production transpilation does not type-check JSX identifiers. A missing
// import here caused the PayScale route to crash despite a successful build.
const source = await readFile('src/pages/admin/PayScale.tsx', 'utf8');
const required = [
  ['EditableInput', '../../components/EditableInput'],
  ['PayscaleNumberInput', null],
];
for (const [component, modulePath] of required) {
  if (!source.includes('<' + component)) continue;
  if (modulePath) {
    const importLine = source.split('\n').find(line =>
      line.startsWith('import ') && line.includes(modulePath));
    if (!importLine || !new RegExp('\\b' + component + '\\b').test(importLine)) {
      throw new Error(component + ' used by PayScale without its import: ' + modulePath);
    }
  } else if (!source.includes('const ' + component + ':')) {
    throw new Error('PayScale number control is referenced but not declared');
  }
}
console.log('PASS PayScale: rendered controls have their required component declarations.');
