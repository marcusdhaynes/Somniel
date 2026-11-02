import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { engagementKind, isWorkerIncomplete, workerMissingFields } from '../src/lib/workforce.ts';

const worker = (values = {}) => ({ name: 'A Person', position: 'Design', ...values });
assert.equal(engagementKind(worker({customFields:{engagementType:'contractor'}})), 'contractor');
assert.equal(engagementKind(worker({customFields:{engagementType:'Contractor'}})), 'contractor');
assert.equal(engagementKind(worker({workerType:'independent contractor'})), 'contractor');
assert.equal(engagementKind(worker({position:'Contractor'})), 'contractor');
assert.equal(engagementKind(worker({customFields:{engagementType:'employee'}})), 'employee');
assert.equal(engagementKind(worker({terminated:true,customFields:{engagementType:'contractor'}})), 'contractor',
  'Inactive contractors must retain their classification');
assert.deepEqual(workerMissingFields({name:'', contractorEmail:'',position:''},'contractor'),
  ['name','contractorEmail','position']);
assert.deepEqual(workerMissingFields({name:'Alex',emailUsername:'a',position:'Designer',rank:'G1'},'employee'),[]);
assert.ok(workerMissingFields({name:'Alex',contractorEmail:'not-an-email',position:'Designer'},'contractor')
  .includes('contractorEmail'));
assert.equal(isWorkerIncomplete(worker({customFields:{__draftName:'true',__missingRequired:'["name"]'}})),true);
assert.equal(isWorkerIncomplete(worker({customFields:{__draftName:'false',__missingRequired:'[]'}})),false);

const employee = readFileSync('src/pages/admin/EmployeeManagement.tsx','utf8');
const store = readFileSync('src/lib/projectStore.ts','utf8');
const page = readFileSync('src/pages/admin/ContractorProjects.tsx','utf8');
const wizard = readFileSync('src/components/projects/ProjectWorkflow.tsx','utf8');
const styles = readFileSync('src/index.css','utf8');
assert.ok(employee.includes('ref={workerFormRef} noValidate'), 'Employee draft must be saveable despite missing required fields');
assert.ok(employee.includes('__missingRequired: JSON.stringify(missing)'), 'Incomplete state must persist');
assert.ok(employee.includes('setWorkerSaveError('), 'Failed writes must stay visible');
assert.ok(store.includes('setOtherWorkers('), 'Unclassified workers must be recoverable');
assert.ok(store.includes('markAsContractor'), 'Recovery action must exist');
assert.ok(page.includes('Find Missing Contractors'), 'Recovery UI must be present');
assert.ok(page.includes('Inactive'), 'Inactive contractors must be labeled');
assert.ok(wizard.includes('Save Draft'), 'Workflow must support draft saving');
assert.ok(wizard.includes('project-workflow-field-incomplete'), 'Missing approval fields must be highlighted');
assert.ok(styles.includes('.employee-draft-form :is(input,select,textarea):required:invalid'),
  'Required worker form fields must have red outlines');
console.log('PASS workforce: legacy and inactive contractor visibility, recoverability, draft saving, and required-field indicators.');
