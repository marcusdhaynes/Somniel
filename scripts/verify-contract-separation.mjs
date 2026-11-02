import { readFile } from 'node:fs/promises';
const read = path => readFile(path, 'utf8');
const [defaults, original, migration, editor, employee] = await Promise.all([
  read('src/data/defaultContracts.ts'),
  read('src/data/legacyHiringContract.ts'),
  read('src/context/CMSContext.tsx'),
  read('src/pages/admin/CMSManagement.tsx'),
  read('src/pages/admin/EmployeeManagement.tsx')
]);
const ensure = (ok, message) => { if (!ok) throw Error('Contract isolation test: ' + message); };
ensure(defaults.includes('hiring: LEGACY_STOCK_HIRING_TEMPLATE'), 'Standard agreement must reference exact original');
ensure(original.includes('Employment Agreement') && !original.includes('Conditional International'),
  'Original agreement was altered');
ensure(defaults.includes('internationalStudentHiring: `'), 'Missing independent international default');
const start = defaults.indexOf('    internationalStudentHiring: `');
const end = defaults.indexOf('    changeOfPosition: `', start);
ensure(start >= 0 && end > start, 'International template keys are not separate');
const intl = defaults.slice(start, end);
const sections = [...intl.matchAll(/class="legal-clause"/g)].length;
const annexes = [...intl.matchAll(/class="legal-annex-heading"/g)].length;
ensure(sections === 38, 'Expected 38 complete contract clauses (' + sections + ')');
ensure(annexes === 6, 'Expected six consolidated annexes (' + annexes + ')');
const controls = [...intl.matchAll(/data-contract-field="/g)].length;

const wordCount = intl.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
ensure(wordCount >= 5500, 'Contract must contain substantive obligations (' + wordCount + ' words)');
ensure(!/Annex [G-Z]\b|\{\{startDate\}\}/.test(intl), 'Stale annex or duplicate date reference');
ensure([...intl.matchAll(/class="legal-initials"/g)].length === 4,
  'Only four major-part acknowledgment areas should remain');
ensure(!/data-contract-field="clause_\d+/.test(intl),
  'Repetitive initials for each clause must not return');
for (const key of ['party_name','service_country','services_scope','approval_confirmed',
                   'approval_start_date','signature_company_date','signature_party_date']) {
  ensure(intl.includes('data-contract-field="' + key + '"'), 'Essential field missing: ' + key);
}

ensure(controls === 39, 'Expected exactly 39 essential fields, found ' + controls);
for (const key of ['legal-field-grid','legal-initials','signature_company_typed','signature_party_typed','approval_reviewer','Start Approval Record']) {
  ensure(intl.includes(key), 'Missing contract field or approval: ' + key);
}
for (const term of ['Contractor','SOW','Sanctions','Annex E','tax','privacy','salary','employment','local']) {
  ensure(intl.toLowerCase().includes(term.toLowerCase()), 'Missing required term: ' + term);
}
ensure(!/\bvisa\b|immigra|E30B|E33G|\bF-1\b|\bCPT\b|\bOPT\b|\bstudent\b|\bacademic\b|\bscholarship\b/i.test(intl),
 'Circumstance-specific content is not allowed in the agreement');

const minorWords = new Set(['a','an','and','as','at','but','by','for','from','in','into','nor','of','on','onto','or','over','per','the','to','via','vs','with','without']);
const abbreviations = new Set(['AI','IP','HR','ID','LLC','MFA','SOW','PDF','US','UK','A','I','II','III','IV','Q']);
const titleCase = value => {
  const pieces = [...value.matchAll(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+(?:\.\d+)*/g)];
  return value.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?|\d+(?:\.\d+)*/g, (word, offset) => {
    if (/^\d/.test(word)) return word;
    const upper = word.toUpperCase();
    if (abbreviations.has(upper) && word === upper) return word;
    const lower = word.toLowerCase();
    const before = value.slice(0, offset).trimEnd();
    const major = offset === pieces[0]?.index || offset === pieces[pieces.length-1]?.index || /[·—|:(/]\s*$/.test(before);
    return major || !minorWords.has(lower) ? lower[0].toUpperCase() + lower.slice(1) : lower;
  });
};
const headingTexts = [
  ...[...intl.matchAll(/<h1>([^<]+)<\/h1>/g)].map(x => x[1]),
  ...[...intl.matchAll(/<h2><span class="legal-section-number">\d+<\/span>([^<]+)<\/h2>/g)].map(x => x[1]),
  ...[...intl.matchAll(/<h3>([^<]+)<\/h3>/g)].map(x => x[1]),
  ...[...intl.matchAll(/<div class="legal-part-title">([^<]+)<\/div>/g)].map(x => x[1]),
  ...[...intl.matchAll(/<p class="legal-eyebrow">([^<]+)<\/p>/g)].map(x => x[1]),
  ...[...intl.matchAll(/<div class="legal-notice"><strong>([^<]+)<\/strong>/g)].map(x => x[1])
];
ensure(headingTexts.length === 56, 'Unexpected number of contract display headings: ' + headingTexts.length);
for (const heading of headingTexts) {
  ensure(heading === titleCase(heading), 'Heading not Title Case: ' + heading);
}
const annexTags = [...intl.matchAll(/<header class="legal-annex-heading"><span>([^<]+)<\/span>/g)].map(x => x[1]);
ensure(annexTags.length === 6 && annexTags.every(label => /^Annex [A-F]$/.test(label)),
  'Annex tags must be consistently Title Case');
const fieldLabels = [...intl.matchAll(/<span class="legal-label">([^<]+)<\/span>/g)].map(x => x[1]);
const accessibilityLabels = [...intl.matchAll(/aria-label="([^"]*)"/g)].map(x => x[1]);
ensure(fieldLabels.length === 39 && accessibilityLabels.length === 39,
  'Expected 345 exact field and accessibility labels');
fieldLabels.forEach((label, index) => {
  ensure(label.replace(/ \*$/, '') === titleCase(label.replace(/ \*$/, '')), 'Field label not Title Case: ' + label);
  ensure(label.replace(/ \*$/, '') === accessibilityLabels[index], 'Accessible field label does not match visible text: ' + label);
});
ensure(intl.includes('Controlled Template | Revision'), 'Document metadata should use Title Case');

ensure(migration.includes("updates['contracts.hiring'] = LEGACY_STOCK_HIRING_TEMPLATE"),
  'Migration does not restore the old hiring template');
ensure(migration.includes('LEGACY_INTERNATIONAL_HIRING_TEMPLATE.trim()'),
  'Restoration should only replace the exact historical international contract');
ensure(migration.includes("updates['contracts.internationalStudentHiring'] = DEFAULT_CONTRACTS.internationalStudentHiring"),
  'Missing initialization of separate CMS field');
ensure(migration.includes('matchesPriorStudentDefault') && migration.includes('44e200fc'),
  'Recognized previous stock template must be upgraded without overwriting customizations');
ensure(editor.includes('International Student Hiring Contract</h3>') &&
       editor.includes('internationalStudentHiring: value'), 'No independent editable contract in CMS');
ensure(editor.includes('Restore Original') && editor.includes('Load Comprehensive Template'),
  'Missing distinct contract reset controls');
ensure(employee.includes("handleGenerateContract(emp, 'internationalStudentHiring')") &&
       employee.includes('content.contracts?.internationalStudentHiring'),
  'Employee documents must generate the separate contract');
console.log('PASS: standard Hiring Contract unchanged; independent neutral engagement template has ' +
 sections + ' Title Case clauses, ' + annexes + ' annexes, and ' + controls + ' essential Title Case fields, with safe migration.');
