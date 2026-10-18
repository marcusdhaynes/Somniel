import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface CMSContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  subsidiaries: Array<{
    id: string;
    name: string;
    description: string;
    logo: string;
    website: string;
    longDescription?: string;
  }>;
  founders: Array<{
    id: string;
    name: string;
    role: string;
    bio: string;
    photo: string;
    vision?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    status: string;
    isExperimental?: boolean;
  }>;
  benefits: Array<{ id: string; text: string }>;
  training: {
    academic: Array<{ id: string; text: string }>;
    vocational: Array<{ id: string; text: string }>;
  };
  performanceReport: Array<{ id: string; text: string }>;
  ranks: Array<{
    id: string;
    name: string;
    educationId: string;
    vocationalIds: string[];
    timeMonths: number;
    earningsContribution: number;
    performanceScore: number;
  }>;
  positions: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  contracts: {
    hiring: string;
    changeOfPosition: string;
    termination: string;
    nda: string;
  };
}

interface CMSContextType {
  content: CMSContent | null;
  loading: boolean;
  updateContent: (newContent: CMSContent) => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const DEFAULT_CONTENT: CMSContent = {
  hero: {
    title: "Building the Future of Enterprise",
    subtitle: "Somniel Holdings LLC is a premier global investment firm managing a diverse portfolio of market-leading subsidiaries and experimental initiatives.",
    cta: "Explore Our Portfolio"
  },
  subsidiaries: [
    { 
      id: '1', 
      name: 'Somniel Tech', 
      description: 'Advanced software solutions for enterprise scale.', 
      logo: 'https://picsum.photos/seed/tech/200/200', 
      website: '#',
      longDescription: 'Somniel Tech is the core technology arm of Somniel Holdings, focusing on building scalable, high-performance software systems for the modern enterprise.'
    },
    { 
      id: '2', 
      name: 'Somniel Energy', 
      description: 'Sustainable energy infrastructure and research.', 
      logo: 'https://picsum.photos/seed/energy/200/200', 
      website: '#',
      longDescription: 'Somniel Energy is dedicated to pioneering sustainable energy solutions, from advanced solar infrastructure to next-generation battery storage.'
    }
  ],
  founders: [
    { 
      id: '1', 
      name: 'Marcus D. Haynes', 
      role: 'CEO & Founder', 
      bio: 'Visionary leader with a passion for scalable systems and enterprise architecture.', 
      photo: 'https://picsum.photos/seed/founder/200/200',
      vision: 'To build a global ecosystem of companies that redefine how enterprise technology serves humanity.'
    }
  ],
  projects: [
    { id: '1', name: 'Project X', description: 'Classified experimental initiative.', status: 'Active', isExperimental: true }
  ],
  benefits: [
    { id: 'b1', text: "Comprehensive Health Coverage" },
    { id: 'b2', text: "Unlimited PTO" },
    { id: 'b3', text: "Remote-First Culture" },
    { id: 'b4', text: "Annual Learning Stipend" }
  ],
  training: {
    academic: [
      { id: 'edu-hs', text: "HS / GED" },
      { id: 'edu-ba', text: "Bachelors" },
      { id: 'edu-ma', text: "Masters" },
      { id: 'edu-phd', text: "PhD" }
    ],
    vocational: [
      { id: 'v1', text: "Project Management Professional (PMP)" },
      { id: 'v2', text: "AWS Certified Solutions Architect" },
      { id: 'v3', text: "Google Cloud Professional Architect" }
    ]
  },
  performanceReport: [
    { id: 'pr1', text: "Attendance" },
    { id: 'pr2', text: "Earnings Contribution ≥ 2× Income" },
    { id: 'pr3', text: "" },
    { id: 'pr4', text: "" },
    { id: 'pr5', text: "" },
    { id: 'pr6', text: "" },
    { id: 'pr7', text: "" }
  ],
  ranks: [
    {
      id: "R1",
      name: "G1",
      educationId: "edu-hs",
      vocationalIds: [],
      timeMonths: 0,
      earningsContribution: 0,
      performanceScore: 0
    },
    {
      id: "R2",
      name: "G2",
      educationId: "edu-hs",
      vocationalIds: [],
      timeMonths: 12,
      earningsContribution: 100000,
      performanceScore: 4
    }
  ],
  positions: [
    {
      id: "P1",
      title: "Demiourgos",
      description: "Creates ideas (both new ventures and innovations) and translates them into structured, actionable plans. Defines logistics, feasibility, and execution pathways."
    },
    {
      id: "P2",
      title: "Praetora",
      description: "Implements the Demiourgos’s plans by building systems, products, and processes. Identifies real-world friction and sends back concrete problems for refinement."
    },
    {
      id: "P3",
      title: "Augur",
      description: "Continuously scans for threats across all domains (economic, competitive, legal, environmental, internal). Anticipates risks and designs strategic countermeasures."
    },
    {
      id: "P4",
      title: "Warden",
      description: "Executes the Augur’s threat-response strategies. Neutralizes risks, enforces protections, and ensures operational stability and compliance."
    },
    {
      id: "P5",
      title: "Ascendant",
      description: "Manages continuous employee progression. Oversees education, training, experience tracking, certifications, and promotion readiness across the organization."
    },
    {
      id: "P6",
      title: "Praefect",
      description: "Maintains organizational structure and continuity. Oversees documentation, coordination, compliance, and systemic health."
    },
    {
      id: "P7",
      title: "Lictor",
      description: "Enforces organizational discipline and standards. Investigates failures, manages corrective actions, and ensures adherence to core protocols."
    }
  ],
  contracts: {
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
  }
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<CMSContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cmsDoc = doc(db, 'config', 'cms');
    const unsubscribe = onSnapshot(cmsDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Deep merge or at least ensure top-level keys from DEFAULT_CONTENT are present
        setContent({
          ...DEFAULT_CONTENT,
          ...data,
          // Ensure nested objects like training are also merged if they exist in data
          training: data.training ? { ...DEFAULT_CONTENT.training, ...data.training } : DEFAULT_CONTENT.training,
          contracts: data.contracts ? { ...DEFAULT_CONTENT.contracts, ...data.contracts } : DEFAULT_CONTENT.contracts,
        } as CMSContent);
      } else {
        // Initialize with default content
        setDoc(cmsDoc, DEFAULT_CONTENT);
        setContent(DEFAULT_CONTENT);
      }
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, 'config/cms');
      } catch (e) {
        console.error("CMS load error:", e);
      }
      setContent(DEFAULT_CONTENT);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateContent = async (newContent: CMSContent) => {
    const cmsDoc = doc(db, 'config', 'cms');
    await setDoc(cmsDoc, newContent);
  };

  return (
    <CMSContext.Provider value={{ content, loading, updateContent }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
