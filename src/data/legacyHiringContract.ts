/** Exact stock hiring HTML used before the international compliance edition.
 * For safe migration only: never replace a customized CMS hiring agreement. */
export const LEGACY_STOCK_HIRING_TEMPLATE = `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-sizing: border-box;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Employment Agreement</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>
        
        <p style="margin-bottom: 20px; line-height: 1.5; font-size: 13px;">This Employment Agreement (the "Agreement") is entered into as of <strong>{{todayDate}}</strong>, by and between <strong>Somniel Holdings LLC</strong> (the "Company") and <strong>{{employeeName}}</strong> (the "Employee").</p>
        
        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">1. Position and Duties</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Employee shall serve in the position of <strong>{{position}}</strong> with the rank of <strong>{{rank}}</strong>. The Employee's initial start date shall be <strong>{{startDate}}</strong>.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">2. Qualifications and Recognition</h2>
          <p style="line-height: 1.5; font-size: 13px;">The Company recognizes the Employee's educational background in <strong>{{education}}</strong> and their <strong>{{experience}} years</strong> of professional experience. Furthermore, the Company acknowledges the following certifications/vocational training: <strong>{{certifications}}</strong>.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">3. Compensation</h2>
          <p style="line-height: 1.5; font-size: 13px;">Based on the aforementioned qualifications and the assigned role, the Employee's starting base salary shall be <strong>{{baseSalary}}</strong> per annum, payable in accordance with the Company's standard payroll practices.</p>
        </div>

        <div style="margin-bottom: 24px; break-inside: avoid;">
          <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px;">4. Term and Renewal</h2>
          <p style="line-height: 1.5; font-size: 13px;">This agreement is subject to a standard three-year term. The renewal or completion date for this initial term is scheduled for <strong>{{renewalDate}}</strong>.</p>
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
    `;
