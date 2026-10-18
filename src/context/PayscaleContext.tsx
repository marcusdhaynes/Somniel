import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface Factor {
  id: string;
  name: string;
  multiplier: number;
  color?: string;
}

export interface PayscaleConfig {
  baseRate: number;
  factors: {
    rank: Factor[];
    position: Factor[];
    education: Factor[];
    performance: Factor[];
    experience: number; // multiplier per year
    timeInCompany: number; // multiplier per year
    cola: number; // flat percentage adjustment
  };
}

interface PayscaleContextType {
  config: PayscaleConfig | null;
  loading: boolean;
  calculatePay: (employee: any) => number;
  updateConfig: (newConfig: PayscaleConfig) => Promise<void>;
}

const PayscaleContext = createContext<PayscaleContextType | undefined>(undefined);

const DEFAULT_CONFIG: PayscaleConfig = {
  baseRate: 50000,
  factors: {
    rank: [
      { id: 'rank-g1', name: 'G1', multiplier: 0 },
      { id: 'rank-g2', name: 'G2', multiplier: 10 },
      { id: 'rank-g3', name: 'G3', multiplier: 10 },
      { id: 'rank-g4', name: 'G4', multiplier: 10 },
      { id: 'rank-g5', name: 'G5', multiplier: 10 },
      { id: 'rank-g6', name: 'G6', multiplier: 10 },
      { id: 'rank-g7', name: 'G7', multiplier: 10 }
    ],
    position: [
      { id: 'pos-demiourgos', name: 'Demiourgos', multiplier: 40 },
      { id: 'pos-praetora', name: 'Praetora', multiplier: 20 },
      { id: 'pos-augur', name: 'Augur', multiplier: 30 },
      { id: 'pos-warden', name: 'Warden', multiplier: 10 },
      { id: 'pos-ascendant', name: 'Ascendant', multiplier: 20 },
      { id: 'pos-praefect', name: 'Praefect', multiplier: 10 },
      { id: 'pos-strategos', name: 'Strategos', multiplier: 50 }
    ],
    education: [
      { id: 'edu-hs', name: 'High School', multiplier: 0 },
      { id: 'edu-ba', name: 'Bachelors', multiplier: 10 },
      { id: 'edu-ma', name: 'Masters', multiplier: 20 },
      { id: 'edu-phd', name: 'PhD', multiplier: 40 }
    ],
    performance: [
      { id: 'perf-green', name: 'green', multiplier: 10, color: '#22c55e' },
      { id: 'perf-gold', name: 'gold', multiplier: -10, color: '#eab308' },
      { id: 'perf-red', name: 'red', multiplier: -30, color: '#ef4444' }
    ],
    experience: 5, // 5% per year
    timeInCompany: 3, // 3% per year
    cola: 2 // 2% flat adjustment
  }
};

export const PayscaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [config, setConfig] = useState<PayscaleConfig | null>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
      return;
    }

    const configDoc = doc(db, 'config', 'payscale');
    const unsubscribe = onSnapshot(configDoc, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const migratedData = { ...data } as any;
        
        // Migrate factors from Record<string, number> to Factor[] if necessary
        if (migratedData.factors) {
          ['rank', 'position', 'education', 'performance'].forEach(cat => {
            if (migratedData.factors[cat]) {
              if (!Array.isArray(migratedData.factors[cat])) {
                migratedData.factors[cat] = Object.entries(migratedData.factors[cat]).map(([name, multiplier]) => ({
                  id: `${cat}-${name.replace(/\s+/g, '-').toLowerCase()}`,
                  name,
                  multiplier: Number(multiplier)
                }));
              } else {
                // Ensure all factors have IDs
                migratedData.factors[cat] = migratedData.factors[cat].map((f: any, index: number) => ({
                  ...f,
                  id: f.id || `${cat}-${f.name ? f.name.replace(/\s+/g, '-').toLowerCase() : index}`
                }));
              }
            }
          });
        }
        
        setConfig(migratedData as PayscaleConfig);
      } else {
        if (isAdmin) {
          setDoc(configDoc, DEFAULT_CONFIG).catch(() => {});
        }
        setConfig(DEFAULT_CONFIG);
      }
      setLoading(false);
    }, () => {
      setConfig(DEFAULT_CONFIG);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin, authLoading]);

  const calculatePay = (employee: any) => {
    if (!config) return 0;
    
    // Cumulative rank calculation: each rank percentage applies to the previous rank's total
    let rankMult = 1.0;
    const rankIndex = config.factors.rank.findIndex(f => f.name === employee.rank);
    if (rankIndex !== -1) {
      for (let i = 0; i <= rankIndex; i++) {
        rankMult *= (1 + (config.factors.rank[i].multiplier / 100));
      }
    }
    
    const posPerc = config.factors.position.find(f => f.name === employee.position)?.multiplier || 0;
    const eduPerc = config.factors.education.find(f => f.name === employee.education)?.multiplier || 0;
    const perfPerc = config.factors.performance.find(f => f.name === employee.status)?.multiplier || 0;
    
    const posMult = 1 + (posPerc / 100);
    const eduMult = 1 + (eduPerc / 100);
    const perfMult = 1 + (perfPerc / 100);
    
    const expMult = 1 + (employee.experience * (config.factors.experience / 100));
    
    // Calculate tenure in months
    let monthsInCompany = 0;
    if (employee.startDate) {
      const startD = new Date(employee.startDate);
      if (!isNaN(startD.getTime())) {
        const today = new Date();
        monthsInCompany = (today.getFullYear() - startD.getFullYear()) * 12;
        monthsInCompany += today.getMonth() - startD.getMonth();
        if (today.getDate() < startD.getDate()) monthsInCompany--;
        monthsInCompany = Math.max(0, monthsInCompany);
      }
    } else if (typeof employee.timeInCompany === 'number') {
      monthsInCompany = employee.timeInCompany;
    } else if (typeof employee.timeInCompany === 'string') {
      // Try to parse "Xy Ym Zd" or "X Years Y Months Z Days"
      const yMatch = employee.timeInCompany.match(/(\d+)\s*(y|year)/i);
      const mMatch = employee.timeInCompany.match(/(\d+)\s*(m|month)/i);
      if (yMatch) monthsInCompany += parseInt(yMatch[1]) * 12;
      if (mMatch) monthsInCompany += parseInt(mMatch[1]);
    }

    const tenureMult = 1 + ((monthsInCompany / 12) * (config.factors.timeInCompany / 100));
    const colaMult = 1 + (config.factors.cola / 100);
    
    return config.baseRate * rankMult * posMult * eduMult * perfMult * expMult * tenureMult * colaMult;
  };

  const updateConfig = async (newConfig: PayscaleConfig) => {
    const configDoc = doc(db, 'config', 'payscale');
    try {
      await setDoc(configDoc, newConfig);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'config/payscale');
    }
  };

  return (
    <PayscaleContext.Provider value={{ config, loading, calculatePay, updateConfig }}>
      {children}
    </PayscaleContext.Provider>
  );
};

export const usePayscale = () => {
  const context = useContext(PayscaleContext);
  if (context === undefined) {
    throw new Error('usePayscale must be used within a PayscaleProvider');
  }
  return context;
};
