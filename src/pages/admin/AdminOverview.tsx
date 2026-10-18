import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { 
  ShieldCheck, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  History,
  Search,
  Palette
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../lib/utils';

const AdminOverview: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const empQuery = query(collection(db, 'employees'), limit(5));
    const taskQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'), limit(5));
    const logQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));

    const unsubEmp = onSnapshot(empQuery, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'employees');
      } catch (e) {
        console.error("Employee load error:", e);
      }
    });

    const unsubTasks = onSnapshot(taskQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      } catch (e) {
        console.error("Task load error:", e);
      }
    });

    const unsubLogs = onSnapshot(logQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'activity_logs');
      } catch (e) {
        console.error("Logs load error:", e);
      }
      setLoading(false);
    });

    return () => {
      unsubEmp();
      unsubTasks();
      unsubLogs();
    };
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleColorChange = async (id: string, color: string) => {
    try {
      await updateDoc(doc(db, 'employees', id), { statusColor: color });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `employees/${id}`);
      } catch (e) {
        console.error("Color update error:", e);
      }
    }
  };

  const stats = [
    { label: "Total Employees", value: employees.length.toString(), icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { label: "Monthly Payroll", value: formatCurrency(employees.reduce((acc, curr) => acc + (curr.baseSalary || 0), 0) / 12), icon: DollarSign, color: "text-accent", bg: "bg-accent/10" },
    { label: "Active Tasks", value: tasks.filter(t => t.status !== 'completed').length.toString(), icon: Activity, color: "text-accent", bg: "bg-accent/10" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <section className="space-y-3 pt-6 pb-4">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-border pb-3">
        <div>
          <h1 className="text-lg font-serif font-bold tracking-tight text-fg mb-0.5">Admin Control Center</h1>
          <div className="flex items-center space-x-2 text-muted">
            <ShieldCheck className="w-3 h-3 text-accent" />
            <span className="uppercase tracking-[0.3em] text-[7px] font-bold">Enterprise Governance Dashboard v2.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-full bg-surface border border-border flex items-center gap-1.5 shadow-sm">
            <div className="relative">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              <div className="absolute inset-0 w-1 h-1 rounded-full bg-emerald-500 animate-ping opacity-75" />
            </div>
            <span className="text-[7px] font-bold uppercase tracking-[0.15em] text-fg/80">System Operational</span>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-2.5 rounded-lg bg-surface border border-border hover:border-accent/40 transition-all group relative overflow-hidden shadow-sm"
          >
            <div className="absolute -top-2 -right-2 p-3 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
              <stat.icon className="w-10 h-10 text-accent" />
            </div>
            
            <div className="flex items-center space-x-3 relative z-10">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-accent/5 shrink-0", stat.bg)}>
                <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-base font-serif font-bold text-fg tracking-tight truncate">{stat.value}</p>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-2 h-2 text-accent/40" />
                    <span className="text-[5px] font-bold text-accent/60 uppercase tracking-widest">+12.5%</span>
                  </div>
                </div>
                <p className="text-[6px] font-bold uppercase tracking-[0.15em] text-muted/80 truncate">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Employee Status (Stoplight System) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Users className="w-2.5 h-2.5 text-accent" />
              <h2 className="text-[8px] font-bold tracking-[0.3em] text-fg uppercase">Workforce Health</h2>
            </div>
            <button className="text-[7px] font-bold uppercase tracking-[0.15em] text-accent hover:opacity-80 transition-opacity border-b border-accent/30 pb-0.5">Directory</button>
          </div>
          
          <div className="space-y-1.5">
            {employees.map((emp, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-2 rounded-lg bg-surface/40 border border-border flex items-center justify-between group hover:bg-surface hover:border-accent/30 transition-all shadow-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="relative group/dot cursor-pointer" title="Click to change color">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        const input = document.getElementById(`color-input-${emp.id}`) as HTMLInputElement;
                        if (input) input.click();
                      }}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all hover:scale-125 border border-white/10 shadow-sm relative z-10",
                        !emp.statusColor && (
                          emp.status === 'green' ? "bg-green-500" :
                          (emp.status === 'yellow' || emp.status === 'purple' || emp.status === 'gold') ? "bg-yellow-500" :
                          "bg-red-500"
                        )
                      )} 
                      style={emp.statusColor ? { backgroundColor: emp.statusColor } : {}}
                    />
                    <div className={cn(
                      "absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-40",
                      !emp.statusColor && (
                        emp.status === 'green' ? "bg-green-500" :
                        (emp.status === 'yellow' || emp.status === 'purple' || emp.status === 'gold') ? "bg-yellow-500" :
                        "bg-red-500"
                      )
                    )} style={emp.statusColor ? { backgroundColor: emp.statusColor } : {}} />
                    
                    <input 
                      id={`color-input-${emp.id}`}
                      type="color"
                      className="sr-only"
                      value={emp.statusColor || (emp.status === 'green' ? "#22c55e" : (emp.status === 'yellow' || emp.status === 'purple' || emp.status === 'gold') ? "#eab308" : "#ef4444")}
                      onChange={(e) => handleColorChange(emp.id, e.target.value)}
                    />
                    
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                      <Palette className="w-2 h-2 text-accent" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-fg group-hover:text-accent transition-colors">{emp.name}</p>
                    <p className="text-[7px] text-muted uppercase tracking-[0.12em] font-bold mt-0.5">{emp.position}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[7px] font-mono text-muted/60">{emp.rank}</p>
                  </div>
                  <ArrowRight className="w-2.5 h-2.5 text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <Activity className="w-2.5 h-2.5 text-accent" />
              <h2 className="text-[8px] font-bold tracking-[0.3em] text-fg uppercase">System Audit Trail</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 text-muted" />
              <input 
                type="text"
                placeholder="FILTER LOGS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-surface border border-border rounded-md pl-6 pr-1.5 py-0.5 text-[7px] text-fg focus:outline-none focus:border-accent/50 w-28 transition-all font-bold uppercase tracking-widest"
              />
            </div>
          </div>
          
          <div className="bg-surface/30 rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[6px] font-bold uppercase tracking-[0.2em] text-muted/60 bg-surface/50 sticky top-0 z-10">
                    <th className="px-3 py-2">Action</th>
                    <th className="px-3 py-2">Details</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, i) => (
                      <motion.tr 
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="group hover:bg-accent/[0.02] transition-colors"
                      >
                        <td className="px-3 py-1.5">
                          <span className="text-[7px] font-bold text-accent uppercase tracking-[0.12em] bg-accent/5 px-1 py-0.5 rounded-full border border-accent/10">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-3 py-1.5">
                          <p className="text-[9px] text-fg/80 leading-relaxed max-w-md">{log.details}</p>
                        </td>
                        <td className="px-3 py-1.5">
                          <div className="flex items-center space-x-1.5">
                            <div className="w-3 h-3 rounded-full bg-surface border border-border flex items-center justify-center">
                              <Users className="w-1.5 h-1.5 text-muted" />
                            </div>
                            <span className="text-[7px] text-muted font-bold uppercase tracking-widest">{log.userEmail?.split('@')[0]}</span>
                          </div>
                        </td>
                        <td className="px-3 py-1.5 text-right">
                          <span className="text-[7px] text-muted/60 font-mono">
                            {log.timestamp?.toDate ? formatDate(log.timestamp.toDate()) : 'Recent'}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center">
                        <History className="w-6 h-6 text-muted/20 mx-auto mb-1.5" />
                        <p className="text-[8px] text-muted font-bold uppercase tracking-[0.2em]">No audit records found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Roadmap Updates */}
      <div className="space-y-2 pt-3 border-t border-border">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-2">
            <Clock className="w-2.5 h-2.5 text-accent" />
            <h2 className="text-[8px] font-bold tracking-[0.3em] text-fg uppercase">Strategic Roadmap</h2>
          </div>
          <button className="text-[7px] font-bold uppercase tracking-[0.15em] text-accent hover:opacity-80 transition-opacity border-b border-accent/30 pb-0.5">Full Roadmap</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {tasks.map((task, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-2 rounded-lg bg-surface/50 border border-border flex items-center justify-between group hover:bg-surface hover:border-accent/30 transition-all shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-bg flex items-center justify-center border border-border group-hover:border-accent/30 transition-colors shadow-sm">
                  {task.status === 'completed' ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> :
                   task.status === 'in-progress' ? <Activity className="w-3 h-3 text-accent" /> :
                   <Clock className="w-3 h-3 text-muted" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-fg truncate max-w-[100px] group-hover:text-accent transition-colors">{task.title}</p>
                  <p className="text-[7px] text-muted font-bold uppercase tracking-widest mt-0.5">{formatDate(task.createdAt)}</p>
                </div>
              </div>
              <div className={cn(
                "px-1 py-0.5 rounded-full text-[6px] font-bold uppercase tracking-[0.15em] border",
                task.status === 'completed' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" :
                task.status === 'in-progress' ? "bg-accent/5 text-accent border-accent/20" :
                "bg-muted/5 text-muted border-muted/20"
              )}>
                {task.status}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminOverview;
