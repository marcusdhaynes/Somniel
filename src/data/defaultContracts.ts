// These default legal templates are only downloaded on admin/editor actions.
export const DEFAULT_CONTRACTS = {
    hiring: `
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
