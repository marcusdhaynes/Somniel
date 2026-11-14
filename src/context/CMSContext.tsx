import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { PUBLIC_DEFAULTS } from '../data/publicFallback.mjs';

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  tagline: string;
  description: string;
  network: string;
  standard: string;
  mintAddress: string;
  decimals: number;
  totalSupply: string;
  status: string;
  explorerUrl: string;
  holderWallet: string;
  holderLabel: string;
  holderAta?: string;
  logo?: string;
  metadataUri?: string;
  launched: string;
  mintRevoked: boolean;
  freezeRevoked: boolean;
  metadataRevoked: boolean;
  utility: string[];
  allocations: string[];
  products: string[];
  transactions: string[];
  rescueShare?: string;
  shareLabel?: string;
  blueprint?: string;
  mainnetNotes?: string;
}

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
  cryptos: CryptoAsset[];
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
    internationalStudentHiring: string;
    changeOfPosition: string;
    termination: string;
    nda: string;
  };
}

interface CMSContextType {
  content: CMSContent | null;
  loading: boolean;
  /** True only after Firestore confirms a server snapshot in this session. */
  synced: boolean;
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
  contracts: { hiring: '', internationalStudentHiring: '', termination: '', changeOfPosition: '', nda: '' }
};

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  // Readable fallback content is immediate, even with no network.
  const [content, setContent] = useState<CMSContent | null>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Do not attach the listener until Firebase has resolved the authenticated
    // user. Otherwise Firestore can permanently terminate the listener with a
    // permission error during initial sign-in.
    if (authLoading) return;
    let active = true;
    let unsubscribe: () => void = () => {};
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryCount = 0;
    let hiringMigrationChecked = false;
    setSynced(false);
    setLoading(true);

    const subscribe = async () => {
      try {
        const [sdk, store] = await Promise.all([
          import('../firebase'),
          import('firebase/firestore'),
        ]);
        if (!active) return;
        const cmsDoc = store.doc(sdk.db, 'config', 'cms');
        // Include metadata-only updates so cached snapshots transition into
        // an authoritative server snapshot even when values don't change.
        unsubscribe = store.onSnapshot(cmsDoc, { includeMetadataChanges: true }, snapshot => {
          if (!active) return;
          retryCount = 0;
          if (snapshot.exists()) {
            const data = snapshot.data();
            // The previous release mistakenly replaced the standard Hiring
            // Contract with the international template. Restore it only when
            // the saved value matches that release exactly. Keep all custom
            // changes; put the international contract in its own CMS field.
            if (isAdmin && !hiringMigrationChecked && !snapshot.metadata.fromCache &&
                !snapshot.metadata.hasPendingWrites) {
              hiringMigrationChecked = true;
              void Promise.all([
                import('../data/legacyInternationalHiringContract'),
                import('../data/legacyHiringContract'),
                import('../data/defaultContracts'),
              ]).then(async ([{ LEGACY_INTERNATIONAL_HIRING_TEMPLATE },
                              { LEGACY_STOCK_HIRING_TEMPLATE }, { DEFAULT_CONTRACTS }]) => {
                if (!active) return;
                await store.runTransaction(sdk.db, async transaction => {
                  const current = await transaction.get(cmsDoc);
                  const contracts = current.data()?.contracts || {};
                  const updates: Record<string, string> = {};
                  if (typeof contracts.hiring === 'string' &&
                      contracts.hiring.trim() === LEGACY_INTERNATIONAL_HIRING_TEMPLATE.trim()) {
                    updates['contracts.hiring'] = LEGACY_STOCK_HIRING_TEMPLATE;
                  }
                  const matchesPriorStudentDefault = (candidate: unknown) => {
                    if (typeof candidate !== 'string') return false;
                    let value = candidate.trim();
                    if (!value) return false;
                    let hash = 2166136261;
                    for (let i = 0; i < value.length; i++) {
                      hash ^= value.charCodeAt(i);
                      hash = Math.imul(hash, 16777619);
                    }
                    return ['be8cfe2e', '6e0fb208', '44e200fc', '7fa863f5', 'ca99c535', 'b218b495', '29156255'].includes((hash >>> 0).toString(16).padStart(8, '0'));
                  };
                  const savedStudent = contracts.internationalStudentHiring;
                  if (!savedStudent?.trim() || matchesPriorStudentDefault(savedStudent)) {
                    // Only upgrade recognized stock versions. Never overwrite a custom contract.
                    updates['contracts.internationalStudentHiring'] = DEFAULT_CONTRACTS.internationalStudentHiring;
                  }
                  if (Object.keys(updates).length) transaction.update(cmsDoc, updates);
                });
              }).catch(error => console.warn('Contract separation migration deferred:', error));
            }
            setContent({
              ...DEFAULT_CONTENT,
              ...data,
              training: data.training
                ? { ...DEFAULT_CONTENT.training, ...data.training }
                : DEFAULT_CONTENT.training,
              contracts: data.contracts
                ? { ...DEFAULT_CONTENT.contracts, ...data.contracts }
                : DEFAULT_CONTENT.contracts,
              cryptos: Array.isArray(data.cryptos) && data.cryptos.length > 0 ? data.cryptos : DEFAULT_CONTENT.cryptos,
            } as CMSContent);
          } else if (!snapshot.metadata.fromCache && isAdmin) {
            // Never write default CMS documents from public/unauthorized pages
            // or while a cached offline snapshot is uncertain.
            void import('../data/defaultContracts').then(({ DEFAULT_CONTRACTS }) =>
              store.setDoc(cmsDoc, { ...DEFAULT_CONTENT, contracts: DEFAULT_CONTRACTS })
            ).catch(error => console.warn('CMS initialization deferred:', error));
          }
          if (!snapshot.metadata.fromCache) setSynced(true);
          setLoading(false);
        }, (error: { code?: string; message?: string }) => {
          if (!active) return;
          console.warn('CMS live subscription interrupted:', error);
          // Preserve the last good content and keep the UI usable. A Firestore
          // error terminates its subscription; network problems need a new one.
          setLoading(false);
          setSynced(false);
          const code = String(error?.code || '').split('/').pop();
          if (['unavailable', 'deadline-exceeded', 'cancelled', 'internal', 'unknown', 'resource-exhausted'].includes(code || '')) {
            const delay = Math.min(30000, 1500 * (2 ** Math.min(retryCount++, 5)));
            retryTimer = setTimeout(() => { if (active) void subscribe(); }, delay);
          }
          // Permission errors recover when user/role changes, via effect deps.
        });
      } catch (error) {
        if (!active) return;
        console.warn('CMS initialization temporarily unavailable:', error);
        setLoading(false);
        const delay = Math.min(30000, 1500 * (2 ** Math.min(retryCount++, 5)));
        retryTimer = setTimeout(() => { if (active) void subscribe(); }, delay);
      }
    };
    void subscribe();

    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
      unsubscribe();
    };
  }, [authLoading, user?.uid, isAdmin]);

  const updateContent = async (newContent: CMSContent) => {
    if (!synced) {
      throw new Error('Content is still synchronizing; changes cannot be saved until the live content is available.');
    }
    const [{ db }, { doc, setDoc }] = await Promise.all([
      import('../firebase'),
      import('firebase/firestore'),
    ]);
    await setDoc(doc(db, 'config', 'cms'), newContent);
  };

  return (
    <CMSContext.Provider value={{ content, loading, synced, updateContent }}>
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
