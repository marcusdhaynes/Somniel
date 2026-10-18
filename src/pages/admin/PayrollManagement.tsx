import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, handleFirestoreError, OperationType, logActivity } from '../../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  DollarSign, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { usePayscale } from '../../context/PayscaleContext';

interface PayrollRecord {
  id: string;
  employeeName: string;
  position: string;
  baseSalary: number;
  status: 'pending' | 'processing' | 'paid';
  lastPaid?: any;
}

const PayrollManagement: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { calculatePay } = usePayscale();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'employees'), (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setEmployees(emps.filter(e => !e.terminated));
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'employees');
      } catch (e) {
        console.error("Employee load error:", e);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleProcessPayroll = async () => {
    if (!confirm('Are you sure you want to process payroll for all active employees?')) return;
    
    try {
      await logActivity('Payroll Processed', `Monthly payroll processed for ${employees.length} employees.`);
      alert('Payroll processing initiated. Check logs for status.');
    } catch (error) {
      console.error('Error processing payroll:', error);
    }
  };

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalMonthlyPayroll = employees.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0) / 12;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5 pb-1">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 border-b border-border pb-1.5">
        <div className="space-y-0.5">
          <h1 className="text-sm font-serif font-bold text-fg tracking-tight leading-none">Payroll Management</h1>
          <div className="flex items-center space-x-1 mt-0.5">
            <div className="px-1 py-0.5 rounded-full bg-accent/10 border border-accent/20 shadow-sm">
              <p className="text-accent text-[5px] font-bold uppercase tracking-[0.2em]">Next Run: April 1st</p>
            </div>
            <div className="flex items-center space-x-1 text-muted">
              <ShieldCheck className="w-1.5 h-1.5 text-accent/60" />
              <p className="text-[5px] font-bold uppercase tracking-[0.2em]">Secure Disbursement Protocol</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 text-muted hover:text-fg transition-colors bg-surface border border-border rounded-lg shadow-sm">
            <Download className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={handleProcessPayroll}
            className="btn-vibrant flex items-center space-x-1 px-1.5 py-0.5 rounded-lg font-bold text-[6px] uppercase tracking-[0.1em] shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <DollarSign className="w-2 h-2" />
            <span>Process Payroll</span>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-surface border border-border shadow-sm">
          <p className="text-[6px] font-bold text-muted uppercase tracking-widest mb-0.5">Total Monthly Liability</p>
          <p className="text-xs font-serif font-bold text-fg">{formatCurrency(totalMonthlyPayroll)}</p>
        </div>
        <div className="p-2 rounded-lg bg-surface border border-border shadow-sm">
          <p className="text-[6px] font-bold text-muted uppercase tracking-widest mb-0.5">Active Payees</p>
          <p className="text-xs font-serif font-bold text-fg">{employees.length}</p>
        </div>
        <div className="p-2 rounded-lg bg-surface border border-border shadow-sm">
          <p className="text-[6px] font-bold text-muted uppercase tracking-widest mb-0.5">System Status</p>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[7px] font-bold text-emerald-500 uppercase tracking-widest">Operational</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-1 max-w-xs">
        <div className="relative flex-1 group">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted group-focus-within:text-accent transition-all" />
          <input
            type="text"
            placeholder="SEARCH PAYEES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg py-0.5 pl-7 pr-1.5 text-[8px] text-fg focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted/40 font-bold uppercase tracking-widest shadow-sm"
          />
        </div>
        <button className="p-1 bg-surface border border-border rounded-lg text-muted hover:text-fg transition-all shadow-sm">
          <Filter className="w-2.5 h-2.5" />
        </button>
      </div>

      {/* Payroll Table */}
      <div className="bg-surface/30 rounded-lg border border-border overflow-hidden backdrop-blur-md shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[6px] font-bold uppercase tracking-[0.2em] text-muted/60 bg-surface/50">
                <th className="px-1.5 py-1">Employee</th>
                <th className="px-1.5 py-1">Annual Base</th>
                <th className="px-1.5 py-1">Monthly Gross</th>
                <th className="px-1.5 py-1">Status</th>
                <th className="px-1.5 py-1 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="group hover:bg-accent/[0.03] transition-all">
                  <td className="px-1.5 py-1">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-accent/5 border border-accent/10 flex items-center justify-center text-accent font-serif font-bold text-[8px]">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-fg leading-tight">{emp.name}</p>
                        <p className="text-[6px] text-muted uppercase tracking-[0.1em] leading-tight mt-0.5 font-bold">{emp.position}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-1.5 py-1 text-[8px] font-bold text-fg font-mono tracking-tight">
                    {formatCurrency(emp.baseSalary)}
                  </td>
                  <td className="px-1.5 py-1 text-[8px] font-bold text-accent font-mono tracking-tight">
                    {formatCurrency(emp.baseSalary / 12)}
                  </td>
                  <td className="px-1.5 py-1">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-2 h-2 text-emerald-500" />
                      <span className="text-[6px] font-bold uppercase tracking-[0.1em] text-emerald-500">Verified</span>
                    </div>
                  </td>
                  <td className="px-1.5 py-1 text-right">
                    <button className="p-0.5 text-muted hover:text-accent transition-all rounded hover:bg-accent/10 border border-transparent hover:border-accent/20">
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
