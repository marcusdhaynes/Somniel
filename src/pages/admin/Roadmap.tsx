import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Search, 
  MoreVertical,
  X,
  Loader2
} from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import { EditableInput, EditableTextarea } from '../../components/EditableInput';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed';
  createdAt: any;
}

const Roadmap: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'tasks');
      } catch (e) {
        console.error("Tasks load error:", e);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, 'tasks'), {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        createdAt: Timestamp.now()
      });
      setIsModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-3 pb-3">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-1 border-b border-border pb-1.5">
        <div className="space-y-0.5">
          <h1 className="text-sm font-serif font-bold tracking-tight text-fg leading-none">Roadmap</h1>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <div className="px-1 py-0.5 rounded-full bg-accent/10 border border-accent/20">
              <p className="text-accent text-[6px] font-bold uppercase tracking-[0.2em]">Strategic Vision</p>
            </div>
            <p className="text-muted text-[6px] font-bold uppercase tracking-[0.2em]">Enterprise Growth</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-vibrant flex items-center space-x-1.5 px-2 py-1 rounded-lg font-bold text-[7px] uppercase tracking-[0.2em] shadow-lg shadow-accent/10"
        >
          <Plus className="w-2.5 h-2.5" />
          <span>Add Task</span>
        </button>
      </header>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 bg-surface/30 p-3 rounded-xl border border-border backdrop-blur-md shadow-sm">
        <div className="relative w-full md:w-[20rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted" />
          <input
            type="text"
            placeholder="Search strategic initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg py-1.5 pl-9 pr-3 text-[10px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium"
          />
        </div>
        <div className="flex items-center space-x-2 text-[8px] font-bold uppercase tracking-[0.2em] text-muted">
          <span>Total Tasks:</span>
          <span className="text-fg bg-bg px-1.5 py-0.5 rounded-full border border-border">{tasks.length}</span>
        </div>
      </div>

      {/* Roadmap Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['planned', 'in-progress', 'completed'].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted flex items-center space-x-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  status === 'completed' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                  status === 'in-progress' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" :
                  "bg-muted/30"
                )} />
                <span className="tracking-[0.2em]">{status.replace('-', ' ')}</span>
              </h3>
              <span className="text-[9px] font-bold text-muted bg-surface/50 px-2 py-0.5 rounded-full border border-border">
                {filteredTasks.filter(t => t.status === status).length}
              </span>
            </div>

            <div className="space-y-3 min-h-[12rem]">
              <AnimatePresence mode="popLayout">
                {filteredTasks.filter(t => t.status === status).map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 rounded-xl bg-surface/50 border border-border hover:border-accent/40 transition-all group relative backdrop-blur-sm shadow-sm hover:shadow-lg hover:shadow-accent/5"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all flex items-center space-x-1.5">
                      <select 
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                        className="bg-bg border border-border rounded px-1.5 py-0.5 text-[7px] uppercase font-bold text-muted focus:outline-none focus:border-accent/50 appearance-none cursor-pointer"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      <button 
                        onClick={() => handleDelete(task.id)} 
                        className="p-1 text-muted hover:text-red-500 transition-colors rounded bg-bg border border-border"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <h4 className="text-xs font-serif font-bold text-fg mb-1 pr-14 leading-tight group-hover:text-accent transition-colors">{task.title}</h4>
                    <p className="text-[10px] text-muted leading-relaxed mb-3 line-clamp-2 font-medium opacity-80">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-2 h-2 text-muted/50" />
                        <span className="text-[7px] text-muted font-bold uppercase tracking-widest">{formatDate(task.createdAt)}</span>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center border",
                        status === 'completed' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                        status === 'in-progress' ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                        "bg-muted/10 border-muted/20 text-muted"
                      )}>
                        {status === 'completed' ? <CheckCircle2 className="w-2.5 h-2.5" /> :
                         status === 'in-progress' ? <Activity className="w-2.5 h-2.5" /> :
                         <Clock className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredTasks.filter(t => t.status === status).length === 0 && (
                <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl text-muted/30">
                  <Loader2 className="w-5 h-5 mb-1 opacity-20" />
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em]">No initiatives</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-lg">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-sm bg-surface border border-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
                <div className="space-y-0.5">
                  <h2 className="text-base font-serif font-bold tracking-tight text-fg">New Initiative</h2>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Define a strategic roadmap task</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="w-7 h-7 flex items-center justify-center text-muted hover:text-fg transition-colors rounded-lg bg-bg border border-border hover:border-accent/50"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <form onSubmit={handleAddTask} className="p-5 space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Task Title</label>
                  <EditableInput 
                    name="title" 
                    required 
                    placeholder="e.g., Quantum Computing Integration"
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-[10px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Description</label>
                  <EditableTextarea 
                    name="description" 
                    rows={3} 
                    placeholder="Describe the strategic impact and scope..."
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-[10px] text-fg focus:outline-none focus:border-accent/50 transition-all resize-none font-medium leading-relaxed" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Initial Status</label>
                  <div className="relative">
                    <select 
                      name="status" 
                      className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-[10px] text-fg focus:outline-none focus:border-accent/50 transition-all appearance-none font-medium"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                      <Clock className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-end items-center space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted hover:text-fg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-vibrant px-4 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-accent/10"
                  >
                    Create Initiative
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmap;
