// These default legal templates are only downloaded on admin/editor actions.
import { LEGACY_STOCK_HIRING_TEMPLATE } from './legacyHiringContract';
export const DEFAULT_CONTRACTS = {
    hiring: LEGACY_STOCK_HIRING_TEMPLATE,
    internationalStudentHiring: `
<div style="font-family:Arial,sans-serif;line-height:1.55;font-size:12px;color:#161616;background:#fff;max-width:850px;margin:auto;padding:30px"><h1 style="font-family:Georgia,serif;font-size:25px">Conditional International Employment Agreement</h1><p><b>Somniel Holdings LLC</b> — Foreign Student / Global Hire Compliance Edition • 2026-11-01</p><p><b>This conditional offer is not work authorization. No productive duties before written legal approval.</b></p><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">01. Parties and Conditional Offer</h2><p>Somniel Holdings LLC (Company) offers {{employeeName}} (Candidate) a prospective role as {{position}}, rank {{rank}}, on terms set out below. Agreement date: {{todayDate}}. The proposed start date {{startDate}} is NOT a permitted work start until the written authorization in Annex C is approved. This instrument may be signed as a conditional offer only where permitted by applicable law.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">02. No Work Before Authorization</h2><p>No employment, compensation accrual, productive training, internship, remote work, contract services, unpaid labor, volunteering for the Company's benefit, trial projects, system access or deliverables may begin until the proper government and employer approvals have been confirmed in writing. Paying abroad, delaying payment, changing the label to independent contractor, or engaging a U.S. employer does not make otherwise unauthorized activities lawful. If signing this offer itself is prohibited locally, use only nonbinding recruitment correspondence until counsel approves.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">03. Determine the Correct Jurisdiction</h2><p>The physical location where the Candidate will work, immigration class and sponsoring school determine applicable permission. The Candidate must disclose citizenship, country of residence and physical work address, school, sponsor, current visa/permit status, expiry and any relocation. Each new country or material change requires review and written clearance BEFORE any work continues.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">04. Indonesia Student Permits</h2><p>A person physically studying in Indonesia on an E30B student status must not assume a foreign employer or foreign bank account creates permission to work. Indonesian higher-education authorities require a no-work declaration for foreign student study permits. The Company shall not assign any productive activity while an applicable no-work restriction remains. Licensed Indonesian counsel must determine whether a genuinely different status or specific government authorization can lawfully permit the proposed activity, and whether continued studies are possible. The E33G remote-worker route has separate requirements and is NOT an exemption attached to an E30B permit. Academic internship categories require their own review and do not automatically authorize regular employment.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">05. United States Student Status</h2><p>If the Candidate is physically in the United States, a U.S. student status alone does not authorize ordinary off-campus employment. Where eligible, F-1 CPT requires the appropriate designated school official authorization on Form I-20 BEFORE work; OPT ordinarily requires an approved Employment Authorization Document and valid dates, and additional limits may apply. Other F, M or J statuses have different conditions. The Candidate and Company must document exact work authorization, employer, dates, hours and permitted activities before any services start.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">06. Required Independent Compliance Reviews</h2><p>Before activation, an appropriately licensed immigration lawyer or qualified local counsel must confirm the route, official approval, permitted work location, dates, hours and activities. Company compliance must also verify payroll setup, lawful employee/contractor classification, local employer registration and labor requirements, taxes, statutory contributions, benefits, wages and overtime, leave, safety and privacy protections. Screen transactions and restricted technology under applicable sanctions and export-control rules without automatically rejecting a person because of nationality.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">07. Employment Terms Activated Only on Authorization</h2><p>After Annex C approval, duties are restricted to the approved {{position}} role and attached job description. Proposed annual base salary: {{baseSalary}}, subject to local mandatory minimums, proper payroll and the written local employment addendum. Education {{education}}, experience {{experience}}, certifications {{certifications}} may be considered for lawful role placement. Currency, payment frequency, working hours, compensation basis, taxes, social contributions, benefits, leave, insurance, expenses, privacy, IP and confidentiality must be finalized by local counsel. Statutory wage claims remain protected even if work was requested contrary to this Agreement.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">08. Term, Suspension, Termination and Rights</h2><p>No three-year term or automatic work rights are created. Authorization ending, being suspended or becoming inapplicable requires immediate suspension of duties and system access. No retroactive start dates, hidden labor or sham arrangements are permitted. This document does not waive mandatory local employment rights, non-discrimination rules, whistleblower rights, statutory notice or final wages. Legal counsel must settle governing law and dispute provisions according to where the work is performed.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">09. Annex A — Candidate Status Record</h2><p>Complete securely: full legal name __________; nationality __________; actual physical work country and address __________; educational institution __________; study course and semester __________; visa/stay permit type and end date __________; school sponsor/DSO __________; proposed tasks and work hours __________; travel plans __________. Candidate certifies accuracy and must report changes before any work is assigned. Candidate signature/date __________.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">10. Annex B — Work Authorization &amp; Payroll Checklist</h2><p>[ ] Independent local immigration review documented (counsel/date/opinion reference) _____. [ ] Official work permission category, issuing authority, start/end dates and permitted activities/hours checked _____. [ ] University/sponsor written clearance where needed (not a substitute for permission) _____. [ ] Employer registration/payroll, statutory wage/tax/benefit/social insurance and classification reviewed _____. [ ] US Form I-9/E-Verify completed when legally required for US-based work; generally I-9 is not required for employees working entirely outside the US. Employees choose acceptable I-9 documents under US anti-discrimination requirements. [ ] Sanctions/export control/privacy checks recorded. [ ] Local labor counsel approval _____. Status: [ ] NOT APPROVED — NO WORK [ ] CONDITIONAL APPROVAL, SUBJECT TO ANNEX C.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">11. Annex C — Start Authorization Certificate</h2><p>IMPORTANT: This annex must remain unsigned as approved until all actual permissions are documented. Employer name ______; Candidate ______; physical work country ______; legal work category and approval reference stored securely ______; approved tasks ______; weekly hour limit ______; permit start/end ______; approved employment start date ______; renewal check date ______; immigration reviewer name/signature/date ______; HR/compliance approver signature/date ______; Candidate acknowledgement/date ______. Any missing required field means NO START AUTHORIZATION.</p></section><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">12. Annex D — Local Employment Addendum</h2><p>Local employing entity or EOR ______; country/local law ______; job description ______; wages/currency/pay frequency ______; work schedule/overtime ______; statutory leave, social insurance, benefits and safety ______; taxes and employer filings ______; data/security and IP rules ______; termination/notice ______; responsible local labor lawyer approval ______. Signed by both parties ONLY after local legal review.</p></section><section style="margin:18px 0;break-inside:avoid"><section style="margin:18px 0;break-inside:avoid"><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">Travel, nationality, and U.S. visa-issuance restrictions</h2><p>Before any proposed U.S. relocation, counsel must independently confirm visa issuance, entry eligibility, nationality-based restrictions, existing valid visa exceptions, and applicable waivers as of the planned travel date. U.S. Presidential Proclamation 10998, effective January 1, 2026, generally suspends new U.S. visa issuance for Yemeni nationals with limited exceptions; an offer of employment does not confer an exemption. Existing visa holders and other specified exceptions require individual assessment. These entry restrictions are distinct from, and do not by themselves determine, legal permission to work while physically outside the United States. Source: <a href="https://travel.state.gov/en/newsroom/visas/2026/suspension-of-visa-issuance-to-foreign-nationals-to-protect-the-security-of-the-united-states.html">U.S. State Department 2026 visa restrictions</a>.</p></section><h2 style="font-size:14px;border-bottom:1px solid #ddd;padding-bottom:5px">13. Official Authorities for Mandatory Reverification</h2><p>Indonesia study-permit declaration: https://izinbelajar.kemdiktisaintek.go.id/ ; E30B student rules: https://international.ui.ac.id/student-visa-index-e30b/ ; E33G guidance: https://ngurahrai.imigrasi.go.id/edukasi-visa-e33g-rumah-kedua-bagi-pekerja-jarak-jauh/ ; U.S. student authorization: https://fam.state.gov/FAM/09FAM/09FAM040205.html ; USCIS Form I-765: https://www.uscis.gov/sites/default/files/document/forms/i-765instr.pdf ; Form I-9: https://www.uscis.gov/sites/default/files/document/forms/i-9instr.pdf ; OFAC: https://ofac.treasury.gov/sanctions-programs-and-country-information/yemen-related-sanctions . Rules change; legal advice must be current and individualized.</p></section><p>Conditional offer signatory (Company): __________________ Date: _________</p><p>Candidate acknowledgment: __________________ Date: _________</p></div>
`,
    changeOfPosition: `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Change of Position Agreement</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>
        
        <p style="margin-bottom: 20px; line-height: 1.5; font-size: 13px;">This amendment to the Employment Agreement is made on <strong>{{todayDate}}</strong> for <strong>{{employeeName}}</strong>.</p>
        
        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">1. Position Transition</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee is transitioning from the position of <strong>{{previousPosition}}</strong> to the new position of <strong>{{position}}</strong>. This transition is selected from the seven core organizational positions defined by the Company.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">2. Testing and Rank Assignment</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee has successfully completed the required testing for the position of <strong>{{position}}</strong>. Based on the achieved score, the Employee shall begin this new role at the rank of <strong>{{rank}}</strong>.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">3. Updated Compensation</h2>
          <p style="line-height: 1.5; font-size: 13px;">Effective <strong>{{effectiveDate}}</strong>, the Employee's updated salary is <strong>{{baseSalary}}</strong> per annum, reflecting the responsibilities of the new position and assigned rank.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">4. Summary of Change</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee is transitioning from <strong>{{previousPosition}}</strong> to <strong>{{position}}</strong> at the rank of <strong>{{rank}}</strong>, with an updated annual salary of <strong>{{baseSalary}}</strong> effective <strong>{{effectiveDate}}</strong>.</p>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; break-inside: avoid;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">For Somniel Holdings LLC</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Employee Signature</p>
          </div>
        </div>
      </div>
    `,
    termination: `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Separation Agreement</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>
        
        <p style="margin-bottom: 20px; line-height: 1.5; font-size: 13px;">This Separation Agreement confirms the termination of the employment relationship between <strong>Somniel Holdings LLC</strong> and <strong>{{employeeName}}</strong>, effective <strong>{{terminationDate}}</strong>.</p>
        
        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">1. Final Position</h2>
          <p style="line-height: 1.5; font-size: 13px;">At the time of separation, the Employee held the position of <strong>{{position}}</strong>.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">2. Severance and Final Pay</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee will receive a final severance payment of <strong>{{severancePay}}</strong>, in addition to all accrued but unpaid salary and benefits as of the termination date.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">3. Confidentiality and Non-Disparagement</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee reaffirms their commitment to the confidentiality and non-disparagement obligations previously agreed upon.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">4. Return of Property</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee agrees to return all Company property, including but not limited to keys, access cards, equipment, and documents, on or before the termination date.</p>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; break-inside: avoid;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">For Somniel Holdings LLC</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Employee Signature</p>
          </div>
        </div>
      </div>
    `,
    nda: `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Non-Disclosure Agreement</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>
        
        <p style="margin-bottom: 20px; line-height: 1.5; font-size: 13px;">This Non-Disclosure Agreement (the "Agreement") is entered into as of <strong>{{todayDate}}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>{{employeeName}}</strong> (the "Employee").</p>
        
        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">1. Purpose</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee acknowledges that during the course of their employment with the Company, they will have access to confidential and proprietary information. This Agreement is intended to protect such information.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">2. Confidential Information</h2>
          <p style="line-height: 1.5; font-size: 13px;">"Confidential Information" includes, but is not limited to, trade secrets, business plans, financial data, customer lists, technical specifications, and any other non-public information related to the Company's operations.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">3. Non-Disclosure Obligations</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee agrees to maintain the strict confidentiality of all Confidential Information and shall not disclose, use, or disseminate such information to any third party without the express written consent of the Company.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">4. Term and Survival</h2>
          <p style="line-height: 1.5; font-size: 13px;">The obligations under this Agreement shall commence on the Employee's first day of employment and shall survive for the duration of the employment relationship and for a period of <strong>three (3) years</strong> following the termination of such relationship for any reason.</p>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; break-inside: avoid;">
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">For Somniel Holdings LLC</p>
          </div>
          <div style="width: 45%;">
            <div style="border-bottom: 1px solid #000; height: 40px; margin-bottom: 8px;"></div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase;">Employee Signature</p>
          </div>
        </div>
      </div>
    `,
  } as const;
