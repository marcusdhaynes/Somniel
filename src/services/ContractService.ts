import { formatCurrency, formatDate } from '../lib/utils';

export interface ContractData {
  employeeName: string;
  position: string;
  rank: string;
  baseSalary: number;
  startDate: string;
  benefits: string[];
  terminationDate?: string;
  severancePay?: number;
  previousPosition?: string;
  previousRank?: string;
  effectiveDate?: string;
}

const replaceVariables = (template: string, data: any) => {
  let result = template;
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (Array.isArray(value)) {
      // Simple array handling for {{#each benefits}} style
      const regex = new RegExp(`{{#each ${key}}}(.*?){{/each}}`, 'gs');
      result = result.replace(regex, (_, inner) => {
        return value.map(item => inner.replace(/{{this}}/g, item)).join('');
      });
    } else {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
  });
  return result;
};

export const generateHiringContract = (data: ContractData, template?: string) => {
  if (template) {
    return `<div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">${replaceVariables(template, { ...data, baseSalary: formatCurrency(data.baseSalary) })}</div>`;
  }

  return `
    <div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold uppercase tracking-widest mb-2">Employment Agreement</h1>
        <p class="text-sm text-gray-500">Somniel Holdings LLC — Confidential</p>
      </div>

      <div class="space-y-6 text-sm">
        <p>This Employment Agreement (the "Agreement") is entered into as of <strong>${data.startDate}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>${data.employeeName}</strong> (the "Employee").</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">1. Position and Duties</h2>
        <p>The Employee shall serve in the position of <strong>${data.position}</strong> with the rank of <strong>${data.rank}</strong>. The Employee shall perform such duties as are customary for this position and such other duties as may be assigned by the Company from time to time.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">2. Compensation</h2>
        <p>The Company shall pay the Employee an annual base salary of <strong>${formatCurrency(data.baseSalary)}</strong>, payable in accordance with the Company's standard payroll practices.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">3. Benefits</h2>
        <p>The Employee shall be entitled to participate in the Company's universal benefits program, which currently includes:</p>
        <ul class="list-disc pl-6 space-y-1">
          ${data.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">4. Term and Termination</h2>
        <p>Employment with the Company is "at-will," meaning that either the Employee or the Company may terminate the employment relationship at any time, with or without cause, and with or without notice.</p>

        <div class="mt-24 grid grid-cols-2 gap-24">
          <div class="border-t border-black pt-4">
            <p class="font-bold">Somniel Holdings LLC</p>
            <p class="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div class="border-t border-black pt-4">
            <p class="font-bold">${data.employeeName}</p>
            <p class="text-xs text-gray-500 mt-1">Employee Signature</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const generateTerminationContract = (data: ContractData, template?: string) => {
  if (template) {
    return `<div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">${replaceVariables(template, { ...data, severancePay: formatCurrency(data.severancePay || 0) })}</div>`;
  }

  return `
    <div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold uppercase tracking-widest mb-2">Separation Agreement</h1>
        <p class="text-sm text-gray-500">Somniel Holdings LLC — Confidential</p>
      </div>

      <div class="space-y-6 text-sm">
        <p>This Separation Agreement (the "Agreement") is entered into as of <strong>${data.terminationDate}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>${data.employeeName}</strong> (the "Employee").</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">1. Termination of Employment</h2>
        <p>The Employee's employment with the Company is terminated effective <strong>${data.terminationDate}</strong>. As of this date, the Employee shall no longer represent the Company in any capacity.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">2. Severance Compensation</h2>
        <p>In consideration for the release of claims contained herein, the Company shall pay the Employee a one-time severance payment of <strong>${formatCurrency(data.severancePay || 0)}</strong>.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">3. Release of Claims</h2>
        <p>The Employee hereby releases and forever discharges the Company from any and all claims, demands, and causes of action of every kind and nature, whether known or unknown, arising out of or in any way connected with the Employee's employment or termination.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">4. Confidentiality</h2>
        <p>The Employee agrees to maintain the confidentiality of all proprietary information belonging to the Company and shall not disclose such information to any third party.</p>

        <div class="mt-24 grid grid-cols-2 gap-24">
          <div class="border-t border-black pt-4">
            <p class="font-bold">Somniel Holdings LLC</p>
            <p class="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div class="border-t border-black pt-4">
            <p class="font-bold">${data.employeeName}</p>
            <p class="text-xs text-gray-500 mt-1">Employee Signature</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const generateChangeOfPositionContract = (data: ContractData, template?: string) => {
  if (template) {
    return `<div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">${replaceVariables(template, { ...data, baseSalary: formatCurrency(data.baseSalary) })}</div>`;
  }

  return `
    <div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold uppercase tracking-widest mb-2">Change of Position Agreement</h1>
        <p class="text-sm text-gray-500">Somniel Holdings LLC — Confidential</p>
      </div>

      <div class="space-y-6 text-sm">
        <p>This Change of Position Agreement (the "Agreement") is entered into as of <strong>${data.effectiveDate || formatDate(new Date())}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>${data.employeeName}</strong> (the "Employee").</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">1. New Position and Duties</h2>
        <p>Effective <strong>${data.effectiveDate || formatDate(new Date())}</strong>, the Employee's position shall change from <strong>${data.previousPosition || 'N/A'}</strong> to <strong>${data.position}</strong> with the rank of <strong>${data.rank}</strong>. The Employee shall perform such duties as are customary for this new position.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">2. Compensation Adjustment</h2>
        <p>The Company shall pay the Employee an annual base salary of <strong>${formatCurrency(data.baseSalary)}</strong>, payable in accordance with the Company's standard payroll practices.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">3. Continuity of Benefits</h2>
        <p>The Employee shall continue to be entitled to participate in the Company's universal benefits program, which currently includes:</p>
        <ul class="list-disc pl-6 space-y-1">
          ${data.benefits.map(b => `<li>${b}</li>`).join('')}
        </ul>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">4. Other Terms</h2>
        <p>All other terms and conditions of the Employee's original Employment Agreement shall remain in full force and effect.</p>

        <div class="mt-24 grid grid-cols-2 gap-24">
          <div class="border-t border-black pt-4">
            <p class="font-bold">Somniel Holdings LLC</p>
            <p class="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div class="border-t border-black pt-4">
            <p class="font-bold">${data.employeeName}</p>
            <p class="text-xs text-gray-500 mt-1">Employee Signature</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const generateNDAContract = (data: ContractData, template?: string) => {
  if (template) {
    return `<div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">${replaceVariables(template, { ...data })}</div>`;
  }

  return `
    <div class="p-12 max-w-4xl mx-auto bg-white text-black font-serif leading-relaxed">
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold uppercase tracking-widest mb-2">Non-Disclosure Agreement</h1>
        <p class="text-sm text-gray-500">Somniel Holdings LLC — Confidential</p>
      </div>

      <div class="space-y-6 text-sm">
        <p>This Non-Disclosure Agreement (the "Agreement") is entered into as of <strong>${data.startDate}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>${data.employeeName}</strong> (the "Employee").</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">1. Purpose</h2>
        <p>The Employee acknowledges that during the course of their employment with the Company, they will have access to confidential and proprietary information. This Agreement is intended to protect such information.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">2. Confidential Information</h2>
        <p>"Confidential Information" includes, but is not limited to, trade secrets, business plans, financial data, customer lists, technical specifications, and any other non-public information related to the Company's operations.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">3. Non-Disclosure Obligations</h2>
        <p>The Employee agrees to maintain the strict confidentiality of all Confidential Information and shall not disclose, use, or disseminate such information to any third party without the express written consent of the Company.</p>

        <h2 class="text-lg font-bold border-b border-gray-200 pb-2 mt-8">4. Term and Survival</h2>
        <p>The obligations under this Agreement shall commence on the Employee's first day of employment and shall survive for the duration of the employment relationship and for a period of <strong>three (3) years</strong> following the termination of such relationship for any reason.</p>

        <div class="mt-24 grid grid-cols-2 gap-24">
          <div class="border-t border-black pt-4">
            <p class="font-bold">Somniel Holdings LLC</p>
            <p class="text-xs text-gray-500 mt-1">Authorized Signature</p>
          </div>
          <div class="border-t border-black pt-4">
            <p class="font-bold">${data.employeeName}</p>
            <p class="text-xs text-gray-500 mt-1">Employee Signature</p>
          </div>
        </div>
      </div>
    </div>
  `;
};
