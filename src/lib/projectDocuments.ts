/** Project documentation is an internal audit trail, not a government work permit or e-signature. */
export type FieldSpec = { key: string; label: string; required?: boolean; type?: 'text' | 'date' | 'number' | 'textarea' | 'checkbox'; hint?: string };
export const PROJECT_STAGES: { title: string; subtitle: string; document: string; fields: FieldSpec[] }[] = [
  { title: 'Legal Approval + Signed Agreement', subtitle: 'Verify the actual legal basis and the executed agreement.', document: 'Legal Approval & Agreement Verification', fields: [
    { key: 'reviewer', label: 'Qualified Legal Reviewer', required: true },
    { key: 'legalReference', label: 'Written Legal Clearance Reference', required: true },
    { key: 'jurisdiction', label: 'Actual Work Jurisdiction', required: true },
    { key: 'agreementReference', label: 'Executed Agreement Reference', required: true },
    { key: 'signedAgreement', label: 'Signed Agreement Independently Verified', type: 'checkbox', required: true },
    { key: 'workAllowed', label: 'All Required Work Permissions Independently Verified', type: 'checkbox', required: true },
    { key: 'legalDate', label: 'Approval Date', type: 'date', required: true },
    { key: 'legalNotes', label: 'Reviewer Notes / Restrictions', type: 'textarea' }
  ] },
  { title: 'Authorized Work Request', subtitle: 'Issue one scoped, priced and traceable work order.', document: 'Authorized Work Order', fields: [
    { key: 'orderNumber', label: 'Work Order Number', required: true },
    { key: 'requester', label: 'Authorized Requester', required: true },
    { key: 'workScope', label: 'Approved Scope And Deliverables', type: 'textarea', required: true },
    { key: 'workDeadline', label: 'Target Completion Date', type: 'date', required: true },
    { key: 'workPrice', label: 'Agreed Price / Fee Basis', required: true },
    { key: 'workIssued', label: 'Issued Date', type: 'date', required: true }
  ] },
  { title: 'Work Performed + Completion Summary', subtitle: 'Capture evidence and obtain acceptance.', document: 'Completion & Acceptance Certificate', fields: [
    { key: 'completedDate', label: 'Completion Date', type: 'date', required: true },
    { key: 'completionSummary', label: 'Work Completed And Results', type: 'textarea', required: true },
    { key: 'deliverableEvidence', label: 'Deliverable / Evidence Reference', required: true },
    { key: 'acceptedBy', label: 'Accepted By', required: true },
    { key: 'acceptanceNotes', label: 'Acceptance Notes', type: 'textarea' }
  ] },
  { title: 'Invoice + Approval', subtitle: 'Reconcile the amount due against accepted work.', document: 'Invoice & Payment Authorization', fields: [
    { key: 'invoiceNumber', label: 'Invoice Number', required: true },
    { key: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
    { key: 'invoiceAmount', label: 'Amount Due', type: 'number', required: true },
    { key: 'invoiceCurrency', label: 'Currency', required: true },
    { key: 'invoiceDue', label: 'Payment Due Date', type: 'date', required: true },
    { key: 'invoiceApprovedBy', label: 'Approved By', required: true },
    { key: 'invoiceApproved', label: 'Invoice Reviewed And Approved', type: 'checkbox', required: true }
  ] },
  { title: 'Payment + Receipt', subtitle: 'Record settlement with independently checkable evidence.', document: 'Payment Confirmation & Receipt', fields: [
    { key: 'paidDate', label: 'Payment Date', type: 'date', required: true },
    { key: 'paidAmount', label: 'Amount Paid', type: 'number', required: true },
    { key: 'paidCurrency', label: 'Currency', required: true },
    { key: 'paymentMethod', label: 'Payment Method', required: true },
    { key: 'paymentReference', label: 'Transaction / Remittance Reference', required: true },
    { key: 'paymentVerifiedBy', label: 'Payment Verified By', required: true }
  ] }
];

export type ProjectField = (typeof PROJECT_STAGES)[number]['fields'][number];
export type Bid = { id: string; contractorId: string; contractorName: string; amount: string; currency: string; note: string; placedAt: string; state: 'submitted' | 'awarded' | 'declined' };
export type ContractorProject = {
  id: string;
  kind: 'contractor_project';
  title: string;
  titleMissing?: boolean;
  description: string;
  mode: 'bid' | 'bounty' | 'direct';
  budget: number;
  currency: string;
  dueDate: string;
  status: 'planned' | 'in-progress' | 'completed';
  contractorId?: string;
  contractorName?: string;
  bids: Bid[];
  record: Record<string, string>;
  completedStages: number[];
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function requiredStageFields(stage: number): FieldSpec[] {
  return PROJECT_STAGES[stage].fields.filter(field => field.required) as FieldSpec[];
}

const escapeHtml = (value: unknown) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const guidance = [
  'This internal record identifies an executed agreement and legal clearance independently obtained and verified for the actual role, location and person. It is not a work permit, government decision, or substitute for professional review. No services may begin without genuine authorization.',
  'This work order authorizes only the scope stated below, subject to the completed legal approval, actual worker classification, applicable signed agreement and mandatory workplace rights. Any material change requires a new assessment and written authorization.',
  'The receiving party confirms that the described deliverables were submitted and assessed. This record does not waive statutory compensation, employee protections, intellectual property obligations or rights concerning disputed performance.',
  'This financial record ties the payment request to the accepted deliverables, agreed work order and authorized party. An invoice is appropriate only when a genuine contractor relationship and the relevant law permit invoicing; employees must be paid through compliant payroll.',
  'This receipt records a completed payment supported by a real remittance reference. It does not prove a payment occurred without a corresponding independent bank, processor or payroll record, and it does not replace required tax or payroll reporting.'
];

export async function exportProjectPdf(project: ContractorProject, stage: number): Promise<void> {
  const spec = PROJECT_STAGES[stage];
  const rows = spec.fields.map(field => {
    const value = project.record[field.key] || '';
    const shown = field.type === 'checkbox' ? (value === 'yes' ? 'Verified / Yes' : 'Not Verified') : (value || 'Not Entered');
    return '<div class="pdoc-row"><dt>' + escapeHtml(field.label) + '</dt><dd>' +
      escapeHtml(shown).replace(/\n/g, '<br>') + '</dd></div>';
  }).join('');
  const html = '<div class="pdoc-shell"><div class="pdoc-top"><div><span class="pdoc-wordmark">SOMNIEL</span>' +
    '<span class="pdoc-kicker">LEGAL & OPERATIONS · CONTROLLED RECORD</span></div>' +
    '<div class="pdoc-number">PROJECT DOCUMENT <strong>0' + (stage + 1) + ' / 05</strong></div></div>' +
    '<div class="pdoc-rule"></div><p class="pdoc-eyebrow">PROJECT DELIVERY · FORMAL RECORD</p>' +
    '<h1>' + escapeHtml(spec.document) + '</h1>' +
    '<p class="pdoc-lede">' + escapeHtml(guidance[stage]) + '</p>' +
    '<div class="pdoc-meta">' +
    '<div><span>PROJECT</span><strong>' + escapeHtml(project.title) + '</strong></div>' +
    '<div><span>CONTRACTOR</span><strong>' + escapeHtml(project.contractorName || 'Unassigned') + '</strong></div>' +
    '<div><span>WORKFLOW STATUS</span><strong>' + (project.completedStages.includes(stage) ? 'Recorded & Approved' : 'Draft · Not Approved') + '</strong></div>' +
    '<div><span>REFERENCE</span><strong>' + escapeHtml(project.id) + '</strong></div></div>' +
    '<h2>Recorded Details</h2><dl class="pdoc-rows">' + rows + '</dl>' +
    '<div class="pdoc-terms"><h2>Record Conditions</h2><p>' + escapeHtml(guidance[stage]) + '</p>' +
    '<p>Information must be accurate, dated and supported by authentic underlying evidence. Any required government permissions, wet-ink or legally valid electronic signatures, tax records and statutory disclosures remain separate obligations.</p></div>' +
    '<div class="pdoc-foot"><span>SOMNIEL HOLDINGS LLC · INTERNAL CONTROLLED RECORD</span><span>PAGE 01 · ' +
    escapeHtml(new Date().toISOString().slice(0, 10)) + '</span></div></div>';
  const css = '<style>' +
    '.pdoc-shell{box-sizing:border-box;width:760px;padding:42px 48px;background:white;color:#182335;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6}' +
    '.pdoc-top{display:flex;justify-content:space-between;align-items:flex-start;gap:24px}' +
    '.pdoc-wordmark{display:block;font:700 26px Georgia,serif;letter-spacing:.22em;color:#14263b}' +
    '.pdoc-kicker,.pdoc-number,.pdoc-eyebrow{display:block;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#728296;font-weight:700;margin-top:7px}' +
    '.pdoc-number{text-align:right}.pdoc-number strong{display:block;color:#15344f;font-size:13px;margin-top:5px}' +
    '.pdoc-rule{height:3px;background:#b19a65;margin:20px 0 28px}' +
    '.pdoc-shell h1{font:700 31px/1.15 Georgia,serif;letter-spacing:-.035em;color:#152b42;margin:10px 0 14px}' +
    '.pdoc-lede{color:#607082;line-height:1.75;margin:0 0 25px}' +
    '.pdoc-meta{display:grid;grid-template-columns:1fr 1fr;gap:14px;background:#f5f7fa;border:1px solid #e0e6ec;padding:17px 20px;margin:10px 0 25px}' +
    '.pdoc-meta>div>span{display:block;color:#748395;letter-spacing:.14em;font-weight:700;font-size:9px}' +
    '.pdoc-meta strong{display:block;overflow-wrap:anywhere;color:#1b354a;font-size:13px;margin-top:4px}' +
    '.pdoc-shell h2{font:700 18px Georgia,serif;margin:20px 0 11px;color:#18314a}' +
    '.pdoc-rows{margin:0;border-top:1px solid #dce3ea}.pdoc-row{display:grid;grid-template-columns:37% 1fr;gap:16px;padding:12px 8px;border-bottom:1px solid #e6eaf0;break-inside:avoid}' +
    '.pdoc-row dt{font-size:10px;font-weight:700;letter-spacing:.04em;color:#748395}.pdoc-row dd{margin:0;overflow-wrap:anywhere;white-space:normal;font-weight:600;color:#26394c}' +
    '.pdoc-terms{border-left:3px solid #b19a65;padding:1px 20px;margin:24px 0 34px;background:#fafafa}' +
    '.pdoc-terms h2{font-size:16px}.pdoc-terms p{color:#5f6e7b;line-height:1.75}' +
    '.pdoc-foot{display:flex;justify-content:space-between;border-top:1px solid #dce3ea;padding-top:13px;color:#7d8b9b;font-size:9px;letter-spacing:.08em}' +
    '</style>';
  const host = document.createElement('div');
  host.innerHTML = css + html;
  host.style.position = 'absolute';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = '760px';
  document.body.appendChild(host);
  try {
    const { default: html2pdf } = await import('html2pdf.js');
    await html2pdf().set({
      filename: ('Somniel_' + spec.document + '_' + project.title).replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '_') + '.pdf',
      margin: [8, 8, 8, 8],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.8, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css'], avoid: ['.pdoc-row', '.pdoc-meta', '.pdoc-terms'] }
    }).from(host).save();
  } finally {
    host.remove();
  }
}
