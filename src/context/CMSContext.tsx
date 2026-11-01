import React, { createContext, useContext, useEffect, useState } from 'react';
import { PUBLIC_DEFAULTS } from '../data/publicFallback.mjs';

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
  ...PUBLIC_DEFAULTS,
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
  contracts: { hiring: '', termination: '', changeOfPosition: '', nda: '' }
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Show public content immediately while the Firestore listener synchronizes.
  const [content, setContent] = useState<CMSContent | null>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => {};
    // Public pages paint with defaults immediately while Firebase initializes
    // in a separate JS chunk. Real CMS updates still arrive live afterward.
    void Promise.all([import('../firebase'), import('firebase/firestore')])
      .then(([sdk, store]) => {
        if (!active) return;
        const cmsDoc = store.doc(sdk.db, 'config', 'cms');
        unsubscribe = store.onSnapshot(cmsDoc, snapshot => {
          if (!active) return;
          if (snapshot.exists()) {
            const data = snapshot.data();
            setContent({
              ...DEFAULT_CONTENT,
              ...data,
              training: data.training
                ? { ...DEFAULT_CONTENT.training, ...data.training }
                : DEFAULT_CONTENT.training,
              contracts: data.contracts
                ? { ...DEFAULT_CONTENT.contracts, ...data.contracts }
                : DEFAULT_CONTENT.contracts,
            } as CMSContent);
          } else {
            // A public session may be read-only. Failure to initialize the
            // default document is non-fatal; public pages keep their fallback.
            void import('../data/defaultContracts').then(({ DEFAULT_CONTRACTS }) =>
              store.setDoc(cmsDoc, { ...DEFAULT_CONTENT, contracts: DEFAULT_CONTRACTS })
            ).catch(() => {});
          }
          setLoading(false);
        }, error => {
          if (!active) return;
          console.error('CMS synchronization unavailable:', error);
          // Do not overwrite already displayed or previously synced content.
          setLoading(false);
        });
      }).catch(error => {
        if (!active) return;
        console.error('CMS initialization failed:', error);
        setLoading(false);
      });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const updateContent = async (newContent: CMSContent) => {
    // Save remains an awaited, authenticated Firestore operation.
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    await setDoc(doc(db, 'config', 'cms'), newContent);
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
