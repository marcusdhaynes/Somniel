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
ensure(annexes === 17, 'Expected Annex A-Q (' + annexes + ')');
const controls = [...intl.matchAll(/data-contract-field="/g)].length;
ensure(controls >= 300, 'Expected >= 300 editable fields and acknowledgments, found ' + controls);
for (const key of ['legal-field-grid','legal-initials','signature_company_typed','signature_party_typed','signature_legal_name','Start Approval Record']) {
  ensure(intl.includes(key), 'Missing contract field or approval: ' + key);
}
for (const term of ['Contractor','SOW','Sanctions','Annex M','tax','privacy','salary','employment','local']) {
  ensure(intl.toLowerCase().includes(term.toLowerCase()), 'Missing required term: ' + term);
}
ensure(!/\\bvisa\\b|immigra|E30B|E33G|\\bF-1\\b|\\bCPT\\b|\\bOPT\\b|\\bstudent\\b|\\bacademic\\b|\\bscholarship\\b/i.test(intl),
 'Circumstance-specific content is not allowed in the agreement');
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
 sections + ' clauses, ' + annexes + ' annexes, and ' + controls + ' editable fields, with safe migration.');
