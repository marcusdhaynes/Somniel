import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { db, handleFirestoreError, OperationType, logActivity } from '../../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { 
  UserPlus, 
  Search, 
  Edit2, 
  FileText, 
  XCircle,
  X,
  Printer,
  Award,
  Plus,
  ShieldCheck,
  Shield,
  Users,
  GripVertical,
  RefreshCcw,
  Phone,
  Mail,
  Palette
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { usePayscale } from '../../context/PayscaleContext';
import { useCMS } from '../../context/CMSContext';
import { EditableInput } from '../../components/EditableInput';
import { PhoneInput } from '../../components/PhoneInput';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { generateHiringContract, generateTerminationContract, generateChangeOfPositionContract, generateNDAContract } from '../../services/ContractService';

interface Employee {
  id: string;
  name: string;
  position: string;
  rank: string;
  timeInPosition: string;
  timeInCompany: string;
  education: string;
  experience: number;
  vocationalTraining: string[];
  status: 'green' | 'yellow' | 'red' | 'purple' | 'gold';
  statusColor?: string;
  baseSalary: number;
  earningsContribution: number;
  terminated: boolean;
  terminationDate?: any;
  createdAt?: any;
  customFields?: Record<string, string>;
  performanceReports?: Array<{
    id: string;
    date: any;
    scores: Record<string, boolean>;
    totalScore: number;
  }>;
  phone?: string;
  email?: string;
  birthday?: string;
  startDate?: string;
  endDate?: string;
  positionChanges?: Array<{ position: string; date: string }>;
}

const DragHandle = ({ controls }: { controls: any }) => (
  <div 
    onPointerDown={(e) => {
      e.preventDefault();
      controls.start(e);
    }}
    className="p-1 text-muted hover:text-accent cursor-grab active:cursor-grabbing transition-colors select-none touch-none"
  >
    <GripVertical className="w-3 h-3" />
  </div>
);

const EmployeeManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'recruitment'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [selectedContract, setSelectedContract] = useState<{ html: string; title: string } | null>(null);
  const [localVocationalTraining, setLocalVocationalTraining] = useState<string[]>([]);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [activeContactPopup, setActiveContactPopup] = useState<{ id: string; type: 'phone' | 'email' } | null>(null);
  const [currentReport, setCurrentReport] = useState<Record<string, boolean>>({});
  const [customFields, setCustomFields] = useState<Array<{ id: string; key: string; value: string }>>([]);
  
  // Auto-calculated date fields
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [localTimeInCompany, setLocalTimeInCompany] = useState<string>('');
  const [localTimeInPosition, setLocalTimeInPosition] = useState<string>('');

  const calculateTimeDiff = (startDateStr: string) => {
    const startD = new Date(startDateStr);
    if (isNaN(startD.getTime())) return '0 Days';

    const today = new Date();
    let years = today.getFullYear() - startD.getFullYear();
    let months = today.getMonth() - startD.getMonth();
    let days = today.getDate() - startD.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const parts = [];
    if (years > 0) parts.push(`${years} Years`);
    if (months > 0) parts.push(`${months} Months`);
    if (days > 0) parts.push(`${days} Days`);
    
    return parts.join(' ') || '0 Days';
  };

  const calculateDates = (start: string, positionChanges?: Array<{ position: string; date: string }>) => {
    if (!start) {
      setEndDate('');
      setLocalTimeInCompany('');
      setLocalTimeInPosition('');
      return;
    }

    const startD = new Date(start);
    if (isNaN(startD.getTime())) return;

    // End Date: +3 years
    const endD = new Date(startD);
    endD.setFullYear(endD.getFullYear() + 3);
    setEndDate(endD.toISOString().split('T')[0]);

    // Time in Company
    setLocalTimeInCompany(calculateTimeDiff(start));

    // Time in Position
    if (positionChanges && positionChanges.length > 0) {
      const lastChange = positionChanges[positionChanges.length - 1];
      setLocalTimeInPosition(calculateTimeDiff(lastChange.date));
    } else {
      setLocalTimeInPosition(calculateTimeDiff(start));
    }
  };

  const { config, calculatePay } = usePayscale();
  const { content } = useCMS();

  useEffect(() => {
    const unsubEmployees = onSnapshot(collection(db, 'employees'), (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'employees');
      } catch (e) {
        console.error("Employee load error:", e);
      }
    });

    const unsubJobs = onSnapshot(collection(db, 'job_postings'), (snapshot) => {
      setJobPostings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'job_postings');
      } catch (e) {
        console.error("Jobs load error:", e);
      }
    });

    const unsubApplicants = onSnapshot(collection(db, 'applicants'), (snapshot) => {
      setApplicants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'applicants');
      } catch (e) {
        console.error("Applicants load error:", e);
      }
      setLoading(false);
    });

    return () => {
      unsubEmployees();
      unsubJobs();
      unsubApplicants();
    };
  }, []);

  const handleSaveJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      department: formData.get('department'),
      description: formData.get('description'),
      status: formData.get('status'),
      createdAt: editingJob?.createdAt || Timestamp.now()
    };

    try {
      if (editingJob) {
        await updateDoc(doc(db, 'job_postings', editingJob.id), data);
        await logActivity('Job Updated', `Job posting ${data.title} updated.`);
      } else {
        await addDoc(collection(db, 'job_postings'), data);
        await logActivity('Job Created', `New job posting ${data.title} created.`);
      }
      setIsJobModalOpen(false);
      setEditingJob(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'job_postings');
    }
  };

  const handleUpdateApplicantStatus = async (applicantId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'applicants', applicantId), { status });
      await logActivity('Applicant Updated', `Applicant status updated to ${status}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'applicants');
    }
  };

  useEffect(() => {
    if (editingEmployee) {
      setLocalVocationalTraining(editingEmployee.vocationalTraining || []);
      const start = editingEmployee.startDate || '';
      setStartDate(start);
      if (start) {
        calculateDates(start, editingEmployee.positionChanges);
      } else {
        setEndDate(editingEmployee.endDate || '');
        setLocalTimeInCompany(editingEmployee.timeInCompany || '');
        setLocalTimeInPosition(editingEmployee.timeInPosition || '');
      }
      const fields = Object.entries(editingEmployee.customFields || {}).map(([key, value]) => ({ 
        id: Math.random().toString(36).substr(2, 9),
        key, 
        value 
      }));
      setCustomFields(fields);
    } else {
      setLocalVocationalTraining([]);
      setStartDate('');
      setEndDate('');
      setLocalTimeInCompany('');
      setLocalTimeInPosition('');
      setCustomFields([]);
    }
  }, [editingEmployee, isModalOpen]);

  const handleColorChange = async (id: string, color: string) => {
    try {
      await updateDoc(doc(db, 'employees', id), { statusColor: color });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const customFieldsObj: Record<string, string> = {};
    customFields.forEach(f => {
      if (f.key.trim()) customFieldsObj[f.key] = f.value;
    });

    const data: any = {
      name: formData.get('name'),
      position: formData.get('position'),
      rank: formData.get('rank'),
      timeInPosition: localTimeInPosition,
      timeInCompany: localTimeInCompany,
      education: formData.get('education'),
      experience: Number(formData.get('experience')),
      status: 'green', // Default to green if status field is removed
      terminated: editingEmployee?.terminated || false,
      vocationalTraining: localVocationalTraining,
      earningsContribution: Number(formData.get('earningsContribution')),
      customFields: customFieldsObj,
      performanceReports: editingEmployee?.performanceReports || [],
      phone: formData.get('phone'),
      email: formData.get('emailUsername') ? `${formData.get('emailUsername')}@somniel.com`.toLowerCase() : '',
      birthday: formData.get('birthday'),
      startDate: startDate,
      endDate: endDate,
      positionChanges: editingEmployee?.positionChanges || []
    };

    if (editingEmployee && data.position !== editingEmployee.position) {
      data.positionChanges = [...(editingEmployee.positionChanges || []), { 
        position: data.position, 
        date: new Date().toISOString().split('T')[0] 
      }];
    }

    data.baseSalary = calculatePay(data);

    try {
      if (editingEmployee) {
        await updateDoc(doc(db, 'employees', editingEmployee.id), data);
        await logActivity('Employee Updated', `Employee ${data.name} record updated.`);
      } else {
        await addDoc(collection(db, 'employees'), { ...data, createdAt: Timestamp.now() });
        await logActivity('Employee Added', `New employee ${data.name} added as ${data.position}.`);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'employees');
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${emp.name}? This action cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, 'employees', emp.id));
      await logActivity('Employee Deleted', `Employee ${emp.name} record was permanently deleted.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'employees');
    }
  };

  const handleTerminate = async (emp: Employee) => {
    if (!confirm(`Are you sure you want to terminate ${emp.name}? This will generate a termination contract.`)) return;
    try {
      await updateDoc(doc(db, 'employees', emp.id), {
        terminated: true,
        terminationDate: Timestamp.now(),
        status: 'red'
      });
      await logActivity('Employee Terminated', `Employee ${emp.name} has been terminated.`);
      handleGenerateContract({ ...emp, terminated: true, terminationDate: Timestamp.now() }, 'termination');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
    }
  };

  const handleGenerateContract = (emp: Employee, type: 'hiring' | 'termination' | 'changeOfPosition' | 'nda') => {
    if (!content) return;
    
    const data = {
      employeeName: emp.name,
      position: emp.position,
      rank: emp.rank,
      baseSalary: emp.baseSalary,
      startDate: formatDate(emp.createdAt || Timestamp.now()),
      benefits: content.benefits.map((b: any) => typeof b === 'string' ? b : b.text),
      terminationDate: emp.terminationDate ? formatDate(emp.terminationDate) : formatDate(Timestamp.now()),
      severancePay: emp.baseSalary * 0.2, // 20% severance
      previousPosition: emp.customFields?.previousPosition || 'N/A',
      previousRank: emp.customFields?.previousRank || 'N/A',
      effectiveDate: formatDate(Timestamp.now())
    };

    let html = '';
    let title = '';
    let template = '';

    if (type === 'hiring') {
      template = content.contracts?.hiring;
      html = generateHiringContract(data, template);
      title = `Hiring Contract - ${emp.name}`;
    } else if (type === 'termination') {
      template = content.contracts?.termination;
      html = generateTerminationContract(data, template);
      title = `Termination Contract - ${emp.name}`;
    } else if (type === 'changeOfPosition') {
      template = content.contracts?.changeOfPosition;
      html = generateChangeOfPositionContract(data, template);
      title = `Change of Position Contract - ${emp.name}`;
    } else if (type === 'nda') {
      template = content.contracts?.nda;
      html = generateNDAContract(data, template);
      title = `NDA Agreement - ${emp.name}`;
    }

    setSelectedContract({ html, title });
    setIsContractModalOpen(true);
  };

  const addVocationalTraining = (training: string) => {
    if (training && !localVocationalTraining.includes(training)) {
      setLocalVocationalTraining([...localVocationalTraining, training]);
    }
  };

  const removeVocationalTraining = (training: string) => {
    setLocalVocationalTraining(localVocationalTraining.filter(t => t !== training));
  };

  const addCustomField = () => {
    setCustomFields([...customFields, { id: Math.random().toString(36).substr(2, 9), key: '', value: '' }]);
  };

  const updateCustomField = (index: number, key: string, value: string) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], key, value };
    setCustomFields(newFields);
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const parseTenureToMonths = (tenure: string | number | undefined): number => {
    if (!tenure) return 0;
    if (typeof tenure === 'number') return tenure;
    
    let months = 0;
    const yMatch = tenure.match(/(\d+)\s*(y|year)/i);
    const mMatch = tenure.match(/(\d+)\s*(m|month)/i);
    if (yMatch) months += parseInt(yMatch[1]) * 12;
    if (mMatch) months += parseInt(mMatch[1]);
    return months;
  };

  const checkRankEligibility = (emp: Employee, targetRankName: string) => {
    if (!content?.ranks || !content?.training) return false;
    const rank = content.ranks.find((r: any) => r.name === targetRankName);
    if (!rank) return false;

    const latestReport = emp.performanceReports?.[0];
    const latestScore = latestReport?.totalScore || 0;

    const targetEducation = content.training.academic.find((a: any) => a.id === rank.educationId);
    const meetsEducation = emp.education === targetEducation?.text;

    const targetVocationalTexts = rank.vocationalIds.map((id: string) => 
      content.training.vocational.find((v: any) => v.id === id)?.text
    ).filter(Boolean);
    const meetsVocational = targetVocationalTexts.every((vt: string) => emp.vocationalTraining.includes(vt));

    const monthsInPosition = parseTenureToMonths(emp.timeInPosition);
    const meetsTime = monthsInPosition >= rank.timeMonths;
    const meetsEarnings = emp.earningsContribution >= rank.earningsContribution;
    const meetsPerformance = latestScore >= rank.performanceScore;

    return meetsEducation && meetsVocational && meetsTime && meetsEarnings && meetsPerformance;
  };

  const getNextRank = (currentRankName: string) => {
    if (!content?.ranks) return null;
    const currentIndex = content.ranks.findIndex((r: any) => r.name === currentRankName);
    if (currentIndex === -1 || currentIndex === content.ranks.length - 1) return null;
    return content.ranks[currentIndex + 1];
  };

  const handleSavePerformanceReport = async () => {
    if (!editingEmployee) return;

    const totalScore = Object.values(currentReport).filter(Boolean).length;
    const newReport = {
      id: Math.random().toString(36).substr(2, 9),
      date: Timestamp.now(),
      scores: currentReport,
      totalScore
    };

    const updatedReports = [newReport, ...(editingEmployee.performanceReports || [])];
    
    try {
      await updateDoc(doc(db, 'employees', editingEmployee.id), {
        performanceReports: updatedReports
      });
      await logActivity('Performance Report Updated', `New performance report for ${editingEmployee.name} with score ${totalScore}/7.`);
      setIsPerformanceModalOpen(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'employees');
    }
  };

  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-1.5 pb-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1 border-b border-border pb-1.5">
        <div className="space-y-0.5">
          <h1 className="text-sm font-serif font-bold text-fg tracking-tight leading-none">
            {activeTab === 'employees' ? 'Team Directory' : 'Recruitment Center'}
          </h1>
          <div className="flex items-center space-x-1">
            <div className="px-1 py-0.5 rounded-full bg-accent/10 border border-accent/20 shadow-sm">
              <p className="text-accent text-[5px] font-bold uppercase tracking-[0.2em]">
                {activeTab === 'employees' ? `${employees.length} Members` : `${jobPostings.length} Openings`}
              </p>
            </div>
            <div className="flex items-center space-x-1 text-muted">
              <ShieldCheck className="w-1.5 h-1.5 text-accent/60" />
              <p className="text-[5px] font-bold uppercase tracking-[0.2em]">
                {activeTab === 'employees' ? 'Enterprise Workforce' : 'Talent Acquisition'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex bg-surface border border-border rounded-lg p-0.5 mr-1">
            <button 
              onClick={() => setActiveTab('employees')}
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[5px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'employees' ? "bg-accent text-bg shadow-sm" : "text-muted hover:text-fg"
              )}
            >
              Employees
            </button>
            <button 
              onClick={() => setActiveTab('recruitment')}
              className={cn(
                "px-1.5 py-0.5 rounded-md text-[5px] font-bold uppercase tracking-widest transition-all",
                activeTab === 'recruitment' ? "bg-accent text-bg shadow-sm" : "text-muted hover:text-fg"
              )}
            >
              Recruitment
            </button>
          </div>
          {activeTab === 'employees' ? (
            <button
              onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }}
              className="btn-vibrant flex items-center space-x-1 px-1.5 py-0.5 rounded-lg font-bold text-[6px] uppercase tracking-[0.1em] shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <UserPlus className="w-2 h-2" />
              <span>Add Employee</span>
            </button>
          ) : (
            <button
              onClick={() => { setEditingJob(null); setIsJobModalOpen(true); }}
              className="btn-vibrant flex items-center space-x-1 px-1.5 py-0.5 rounded-lg font-bold text-[6px] uppercase tracking-[0.1em] shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-2 h-2" />
              <span>New Posting</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' ? (
        <>
          {/* Search Bar */}
          <div className="relative group max-w-xs">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted group-focus-within:text-accent transition-all" />
            <input
              type="text"
              placeholder="SEARCH DIRECTORY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-lg py-0.5 pl-7 pr-1.5 text-[8px] text-fg focus:outline-none focus:border-accent/50 transition-all placeholder:text-muted/40 font-bold uppercase tracking-widest shadow-sm"
            />
          </div>

          {/* Employee Table */}
          <div className="bg-surface/30 rounded-lg border border-border overflow-hidden backdrop-blur-md shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[6px] font-bold uppercase tracking-[0.2em] text-muted/60 bg-surface/50">
                    <th className="px-1.5 py-1 text-center">Name</th>
                    <th className="px-1.5 py-1 text-center">Contact</th>
                    <th className="px-1.5 py-1 text-center">Position</th>
                    <th className="px-1.5 py-1 text-center">Rank</th>
                    <th className="px-1.5 py-1 text-center">Perf</th>
                    <th className="px-1.5 py-1 text-center">Salary</th>
                    <th className="px-1.5 py-1 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-1.5 py-3 text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shadow-inner">
                            <Search className="w-3 h-3 text-muted/20" />
                          </div>
                          <p className="text-muted text-[7px] font-bold uppercase tracking-[0.2em]">No members found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className={cn("group hover:bg-accent/[0.03] transition-all", emp.terminated && "opacity-40 grayscale")}>
                        <td className="px-1.5 py-1 text-center align-middle">
                          <div className="flex items-center justify-center gap-1.5">
                            <div className="relative group/dot cursor-pointer" title="Click to change color">
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const input = document.getElementById(`color-input-${emp.id}`) as HTMLInputElement;
                                  if (input) input.click();
                                }}
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full transition-all hover:scale-125 border border-white/10 shadow-sm relative z-10",
                                  !emp.statusColor && (
                                    emp.status === 'green' ? "bg-green-500" :
                                    (emp.status === 'yellow' || emp.status === 'purple' || emp.status === 'gold') ? "bg-yellow-500" :
                                    "bg-red-500"
                                  )
                                )} 
                                style={emp.statusColor ? { backgroundColor: emp.statusColor } : {}}
                              />
                              <div className={cn(
                                "absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping opacity-40",
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
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                                <Palette className="w-1.5 h-1.5 text-accent" />
                              </div>
                            </div>
                            <p className="text-[5px] md:text-[7.5px] font-bold text-fg leading-tight group-hover:text-accent transition-colors whitespace-nowrap">{emp.name}</p>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle relative">
                          <div className="flex items-center justify-center gap-1">
                            {/* Desktop View: Text */}
                            <div className="hidden xl:flex flex-col items-center gap-0.5">
                              <p className="text-[6px] font-bold text-fg/70 lowercase tracking-tighter">{emp.email || 'no email'}</p>
                              <p className="text-[6px] font-bold text-accent/70 tracking-tighter">{emp.phone || 'no phone'}</p>
                            </div>
                            
                            {/* Mobile/Tablet View: Icons */}
                            <div className="flex xl:hidden items-center gap-1">
                              <button 
                                onClick={() => setActiveContactPopup({ id: emp.id, type: 'email' })}
                                className="w-4 h-4 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-bg transition-all shadow-sm"
                              >
                                <Mail className="w-2 h-2" />
                              </button>
                              <button 
                                onClick={() => setActiveContactPopup({ id: emp.id, type: 'phone' })}
                                className="w-4 h-4 rounded-full bg-accent/5 border border-accent/10 flex items-center justify-center text-accent hover:bg-accent hover:text-bg transition-all shadow-sm"
                              >
                                <Phone className="w-2 h-2" />
                              </button>
                            </div>

                            {/* Minimal Popup */}
                            <AnimatePresence>
                              {activeContactPopup?.id === emp.id && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-[140] cursor-default" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveContactPopup(null);
                                    }}
                                  />
                                  <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute z-[150] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface border border-border rounded px-2 py-1 shadow-xl pointer-events-auto whitespace-nowrap min-w-[120px]"
                                  >
                                    <div className="flex flex-col gap-1">
                                      <p className="text-[10px] font-bold text-fg tracking-tight font-mono flex items-center gap-2">
                                        {activeContactPopup.type === 'email' ? (
                                          <>
                                            <Mail className="w-2.5 h-2.5 text-accent/60" />
                                            {emp.email ? (emp.email.split('@')[0].toLowerCase() + '@somniel.com') : 'no email'}
                                          </>
                                        ) : (
                                          (() => {
                                            const phoneNumber = emp.phone ? parsePhoneNumberFromString(emp.phone) : null;
                                            return (
                                              <>
                                                <Phone className="w-2.5 h-2.5 text-accent/60" />
                                                {phoneNumber ? phoneNumber.formatInternational() : (emp.phone || 'no phone')}
                                              </>
                                            );
                                          })()
                                        )}
                                      </p>
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle">
                          <div className="inline-flex px-1 py-0.5 rounded bg-surface border border-border shadow-sm">
                            <p className="text-[6px] font-bold text-fg/80 uppercase tracking-[0.1em]">{emp.position}</p>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle">
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="inline-flex px-1 py-0.5 rounded bg-surface border border-border shadow-sm">
                              <p className="text-[6px] font-bold text-fg/80 uppercase tracking-[0.1em]">{emp.rank}</p>
                            </div>
                            {(() => {
                              const nextRank = getNextRank(emp.rank);
                              if (nextRank && checkRankEligibility(emp, nextRank.name)) {
                                return (
                                  <div className="px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[5px] font-bold uppercase tracking-widest animate-pulse">
                                    Eligible: {nextRank.name}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle">
                          {emp.performanceReports && emp.performanceReports.length > 0 ? (
                            <div className="inline-block px-1 py-0.5 rounded bg-accent/10 text-accent text-[7px] font-bold border border-accent/20">
                              {emp.performanceReports[0].totalScore}/7
                            </div>
                          ) : (
                            <span className="text-[6px] text-muted uppercase tracking-widest font-bold">N/A</span>
                          )}
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle text-[9px] font-bold text-fg font-mono tracking-tight">
                          {formatCurrency(emp.baseSalary)}
                        </td>
                        <td className="px-1.5 py-1 text-center align-middle">
                          <div className="flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                            {/* Docs Row */}
                            <div className="flex items-center justify-center gap-0.5">
                              <button 
                                onClick={() => handleGenerateContract(emp, 'hiring')} 
                                className="p-0.5 text-muted hover:text-accent transition-all rounded hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                title="Hiring Contract"
                              >
                                <FileText className="w-2 h-2" />
                              </button>
                              <button 
                                onClick={() => handleGenerateContract(emp, 'changeOfPosition')} 
                                className="p-0.5 text-muted hover:text-accent transition-all rounded hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                title="Change of Position Contract"
                              >
                                <RefreshCcw className="w-2 h-2" />
                              </button>
                              <button 
                                onClick={() => handleGenerateContract(emp, 'termination')} 
                                className="p-0.5 text-muted hover:text-red-500 transition-all rounded hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                title="Termination Contract"
                              >
                                <XCircle className="w-2 h-2" />
                              </button>
                              <button 
                                onClick={() => handleGenerateContract(emp, 'nda')} 
                                className="p-0.5 text-muted hover:text-accent transition-all rounded hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                title="NDA Agreement"
                              >
                                <Shield className="w-2 h-2" />
                              </button>
                            </div>
                            {/* Actions Row */}
                            <div className="flex items-center justify-center gap-0.5">
                              <button 
                                onClick={() => { setEditingEmployee(emp); setIsModalOpen(true); }} 
                                className="p-0.5 text-muted hover:text-accent transition-all rounded hover:bg-accent/10 border border-transparent hover:border-accent/20"
                                title="Edit Profile"
                              >
                                <Edit2 className="w-2 h-2" />
                              </button>
                              <button 
                                onClick={() => handleDelete(emp)} 
                                className="p-0.5 text-muted hover:text-red-500 transition-all rounded hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                title="Delete Record"
                              >
                                <XCircle className="w-2 h-2" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Job Postings */}
          <div className="lg:col-span-5 space-y-2">
            <div className="flex items-center space-x-2 px-1">
              <Plus className="w-2.5 h-2.5 text-accent" />
              <h2 className="text-[8px] font-bold tracking-[0.3em] text-fg uppercase">Open Positions</h2>
            </div>
            <div className="space-y-1.5">
              {jobPostings.map((job) => (
                <div key={job.id} className="p-2 rounded-lg bg-surface border border-border group hover:border-accent/30 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-[10px] font-bold text-fg group-hover:text-accent transition-colors">{job.title}</h3>
                      <p className="text-[6px] text-muted uppercase tracking-widest font-bold">{job.department}</p>
                    </div>
                    <div className={cn(
                      "px-1 py-0.5 rounded text-[5px] font-bold uppercase tracking-widest border",
                      job.status === 'open' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-red-500/5 text-red-500 border-red-500/20"
                    )}>
                      {job.status}
                    </div>
                  </div>
                  <p className="text-[8px] text-muted/80 line-clamp-2 mb-2">{job.description}</p>
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => { setEditingJob(job); setIsJobModalOpen(true); }}
                      className="p-1 text-muted hover:text-accent transition-all bg-bg rounded border border-border"
                    >
                      <Edit2 className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Applicants */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center space-x-2 px-1">
              <Users className="w-2.5 h-2.5 text-accent" />
              <h2 className="text-[8px] font-bold tracking-[0.3em] text-fg uppercase">Active Applicants</h2>
            </div>
            <div className="bg-surface/30 rounded-lg border border-border overflow-hidden shadow-md">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-[6px] font-bold uppercase tracking-[0.2em] text-muted/60 bg-surface/50">
                    <th className="px-1.5 py-1">Applicant</th>
                    <th className="px-1.5 py-1">Job ID</th>
                    <th className="px-1.5 py-1">Status</th>
                    <th className="px-1.5 py-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {applicants.map((app) => (
                    <tr key={app.id} className="group hover:bg-accent/[0.02] transition-all">
                      <td className="px-1.5 py-1">
                        <p className="text-[9px] font-bold text-fg">{app.name}</p>
                        <p className="text-[6px] text-muted font-bold">{app.email}</p>
                      </td>
                      <td className="px-1.5 py-1 text-[7px] font-mono text-muted">
                        {app.jobId.slice(-6)}
                      </td>
                      <td className="px-1.5 py-1">
                        <select 
                          value={app.status}
                          onChange={(e) => handleUpdateApplicantStatus(app.id, e.target.value)}
                          className="bg-bg border border-border rounded px-1 py-0.5 text-[6px] font-bold uppercase tracking-widest text-fg focus:outline-none focus:border-accent/50"
                        >
                          <option value="new">New</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-1.5 py-1 text-right">
                        <button className="p-1 text-muted hover:text-accent transition-all bg-bg rounded border border-border">
                          <FileText className="w-2 h-2" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance Report Modal */}
      <AnimatePresence>
        {isPerformanceModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bg/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-surface border border-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-surface/50">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-serif font-bold text-fg uppercase tracking-tight">Performance Report</h2>
                  <p className="text-[6px] font-bold uppercase tracking-[0.2em] text-accent">Employee Evaluation Card</p>
                </div>
                <button onClick={() => setIsPerformanceModalOpen(false)} className="text-muted hover:text-fg transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <div className="p-3 space-y-3">
                <div className="space-y-1">
                  {content?.performanceReport?.map((item: any) => (
                    <label 
                      key={item.id} 
                      className="flex items-center justify-between p-2 rounded-lg bg-bg border border-border hover:border-accent/30 transition-all cursor-pointer group"
                    >
                      <span className="text-[8px] font-bold text-fg uppercase tracking-widest group-hover:text-accent transition-colors">
                        {item.text}
                      </span>
                      <input
                        type="checkbox"
                        checked={currentReport[item.id] || false}
                        onChange={(e) => setCurrentReport({ ...currentReport, [item.id]: e.target.checked })}
                        className="w-3 h-3 rounded border-border text-accent focus:ring-accent bg-bg"
                      />
                    </label>
                  ))}
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[6px] font-bold uppercase tracking-widest text-muted">Total Score</p>
                    <p className="text-lg font-serif font-bold text-accent leading-none">
                      {Object.values(currentReport).filter(Boolean).length} <span className="text-[10px] text-muted">/ 7</span>
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setIsPerformanceModalOpen(false)}
                      className="px-2 py-1 rounded-lg text-[7px] font-bold uppercase tracking-widest text-muted hover:text-fg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSavePerformanceReport}
                      className="btn-vibrant px-3 py-1 rounded-lg text-[7px] font-bold uppercase tracking-widest shadow-lg shadow-accent/20"
                    >
                      Submit Report
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-surface border border-border rounded-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="px-2 py-1 border-b border-border flex items-center justify-between bg-surface/50">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-serif font-bold text-fg">
                    {editingEmployee ? 'Update Profile' : 'New Team Member'}
                  </h2>
                  <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-muted">Employee Information System</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-5 h-5 flex items-center justify-center text-muted hover:text-accent transition-colors rounded-lg hover:bg-bg border border-transparent hover:border-border">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-2 space-y-1.5 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Full Name</label>
                    <EditableInput name="name" defaultValue={editingEmployee?.name} required className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium flex items-center" />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Birthday</label>
                    <input 
                      type="date" 
                      name="birthday" 
                      defaultValue={editingEmployee?.birthday} 
                      className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none flex items-center" 
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Email Address</label>
                    <div className="relative flex items-center group/email h-7">
                      <EditableInput 
                        name="emailUsername" 
                        type="text" 
                        defaultValue={editingEmployee?.email?.split('@')[0]} 
                        placeholder="username"
                        className="w-full h-full bg-bg border border-border rounded-lg pl-1.5 pr-[4.5rem] text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium flex items-center" 
                      />
                      <span className="absolute right-1.5 text-[8px] font-bold text-muted/40 pointer-events-none group-focus-within/email:text-accent/40 transition-colors">@somniel.com</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Phone Number</label>
                    <PhoneInput 
                      key={editingEmployee?.id || 'new'}
                      name="phone" 
                      defaultValue={editingEmployee?.phone} 
                      className="h-7"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Position</label>
                    <select name="position" defaultValue={editingEmployee?.position} className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none flex items-center">
                      {config?.factors.position.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Rank</label>
                    <select name="rank" defaultValue={editingEmployee?.rank} className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none flex items-center">
                      {config?.factors.rank.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Education</label>
                    <select name="education" defaultValue={editingEmployee?.education} className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none flex items-center">
                      {content?.training?.academic?.map((f: any) => (
                        <option key={f.id} value={f.text}>{f.text}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Experience (Years)</label>
                    <EditableInput name="experience" type="number" defaultValue={editingEmployee?.experience} className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium flex items-center" />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={startDate} 
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        calculateDates(e.target.value, editingEmployee?.positionChanges);
                      }}
                      className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none flex items-center" 
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">End Date (Auto)</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={endDate} 
                      readOnly
                      className="w-full h-7 bg-bg/50 border border-border rounded-lg px-1.5 text-[9px] text-muted focus:outline-none transition-all font-medium appearance-none cursor-not-allowed flex items-center" 
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Time in Company</label>
                    <input 
                      type="text" 
                      name="timeInCompany" 
                      value={localTimeInCompany} 
                      readOnly
                      className="w-full h-7 bg-bg/50 border border-border rounded-lg px-1.5 text-[9px] text-muted focus:outline-none transition-all font-medium cursor-not-allowed flex items-center" 
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Time in Position</label>
                    <input 
                      type="text" 
                      name="timeInPosition" 
                      value={localTimeInPosition} 
                      readOnly
                      className="w-full h-7 bg-bg/50 border border-border rounded-lg px-1.5 text-[9px] text-muted focus:outline-none transition-all font-medium cursor-not-allowed flex items-center" 
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Earnings Contribution ($)</label>
                    <EditableInput name="earningsContribution" type="number" defaultValue={editingEmployee?.earningsContribution} className="w-full h-7 bg-bg border border-border rounded-lg px-1.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium flex items-center" />
                  </div>
                </div>

                <div className="space-y-1 pt-1.5 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Vocational Training</label>
                    <div className="flex gap-1">
                      <select 
                        className="bg-bg border border-border rounded-md px-1 py-0.5 text-[6px] text-fg focus:outline-none focus:border-accent/50 font-bold uppercase tracking-widest"
                        onChange={(e) => {
                          if (e.target.value) {
                            addVocationalTraining(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Add...</option>
                        {content?.training?.vocational?.map((v: any) => (
                          <option key={v.id} value={v.text}>{v.text}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Reorder.Group 
                    axis="x" 
                    values={localVocationalTraining} 
                    onReorder={setLocalVocationalTraining}
                    className="flex flex-wrap gap-1"
                  >
                    {localVocationalTraining.map((training, i) => {
                      const controls = useDragControls();
                      return (
                        <Reorder.Item 
                          key={training}
                          value={training}
                          dragListener={false}
                          dragControls={controls}
                          whileDrag={{ 
                            scale: 1.05, 
                            zIndex: 50, 
                            cursor: "grabbing",
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                          }}
                          layout
                          transition={{ type: "spring", stiffness: 600, damping: 30 }}
                          className="flex items-center gap-1 bg-accent/5 text-accent px-1 py-0.5 rounded-md text-[6px] font-bold uppercase tracking-widest border border-accent/10 shadow-sm group select-none"
                        >
                          <div 
                            onPointerDown={(e) => {
                              e.preventDefault();
                              controls.start(e);
                            }} 
                            className="cursor-grab active:cursor-grabbing touch-none"
                          >
                            <GripVertical className="w-1.5 h-1.5 text-accent/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <Award className="w-1.5 h-1.5" />
                          <span>{training}</span>
                          <button type="button" onClick={() => removeVocationalTraining(training)} className="hover:text-red-500 transition-colors ml-0.5">
                            <X className="w-1.5 h-1.5" />
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                {editingEmployee && (
                  <div className="space-y-1 pt-1.5 border-t border-border">
                    <div className="flex items-center justify-between">
                      <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Performance Reports</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const lastReport = editingEmployee.performanceReports?.[0];
                          const initialScores = { ...(lastReport?.scores || {}) };
                          
                          // Auto-check "Earnings Contribution >= 2x Income"
                          const earningsItem = content?.performanceReport?.find((item: any) => 
                            item.text.toLowerCase().includes('earnings contribution')
                          );
                          if (earningsItem) {
                            initialScores[earningsItem.id] = (editingEmployee.earningsContribution || 0) >= (editingEmployee.baseSalary * 2);
                          }

                          setCurrentReport(initialScores);
                          setIsPerformanceModalOpen(true);
                        }}
                        className="text-[6px] font-bold uppercase tracking-widest text-accent hover:opacity-80 flex items-center gap-1 bg-accent/5 px-1 py-0.5 rounded-md border border-accent/10 transition-all"
                      >
                        <Plus className="w-1.5 h-1.5" />
                        <span>New Report</span>
                      </button>
                    </div>
                    {editingEmployee.performanceReports && editingEmployee.performanceReports.length > 0 && (
                      <div className="bg-bg/50 rounded-lg border border-border p-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-[7px] font-bold text-fg uppercase tracking-widest">Latest Score</p>
                          <div className="px-1.5 py-0.5 rounded bg-accent text-bg text-[8px] font-bold">
                            {editingEmployee.performanceReports[0].totalScore}/7
                          </div>
                        </div>
                        <p className="text-[6px] text-muted uppercase tracking-widest">
                          Last Updated: {formatDate(editingEmployee.performanceReports[0].date)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1 pt-1.5 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Additional Metadata</label>
                    <button 
                      type="button"
                      onClick={addCustomField}
                      className="text-[6px] font-bold uppercase tracking-widest text-accent hover:opacity-80 flex items-center gap-1 bg-accent/5 px-1 py-0.5 rounded-md border border-accent/10 transition-all"
                    >
                      <Plus className="w-1.5 h-1.5" />
                      <span>Add Field</span>
                    </button>
                  </div>
                  <Reorder.Group 
                    axis="y" 
                    values={customFields} 
                    onReorder={setCustomFields}
                    className="flex flex-col gap-0.5"
                  >
                    {customFields.map((field, i) => {
                      const controls = useDragControls();
                      return (
                        <Reorder.Item 
                          key={field.id}
                          value={field}
                          dragListener={false}
                          dragControls={controls}
                          whileDrag={{ 
                            scale: 1.02, 
                            zIndex: 50, 
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)", 
                            cursor: "grabbing" 
                          }}
                          layout
                          transition={{ type: "spring", stiffness: 600, damping: 30 }}
                          className="flex items-center gap-1 group select-none"
                        >
                          <div 
                            onPointerDown={(e) => {
                              e.preventDefault();
                              controls.start(e);
                            }} 
                            className="cursor-grab active:cursor-grabbing p-0.5 touch-none"
                          >
                            <GripVertical className="w-2 h-2 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <EditableInput
                            placeholder="Field Name"
                            value={field.key}
                            onCommit={(val) => updateCustomField(i, val, field.value)}
                            className="flex-1 bg-bg border border-border rounded-md px-1 py-0.5 text-[7px] text-fg focus:outline-none focus:border-accent/50 font-medium"
                          />
                          <EditableInput
                            placeholder="Value"
                            value={field.value}
                            onCommit={(val) => updateCustomField(i, field.key, val)}
                            className="flex-1 bg-bg border border-border rounded-md px-1 py-0.5 text-[7px] text-fg focus:outline-none focus:border-accent/50 font-medium"
                          />
                          <button type="button" onClick={() => removeCustomField(i)} className="text-muted hover:text-red-500 p-0.5 transition-colors bg-bg rounded-md border border-border">
                            <X className="w-2 h-2" />
                          </button>
                        </Reorder.Item>
                      );
                    })}
                  </Reorder.Group>
                </div>

                <div className="pt-2 border-t border-border flex justify-end gap-1">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-2 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.1em] text-muted hover:text-fg transition-colors">Cancel</button>
                  <button type="submit" className="btn-vibrant px-3 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-accent/10">Save Record</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contract Preview Modal */}
      <AnimatePresence>
        {isContractModalOpen && selectedContract && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/90 backdrop-blur-xl overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-xl overflow-hidden shadow-2xl my-4"
            >
              <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10">
                <div className="space-y-0.5">
                  <h2 className="text-[9px] font-bold text-zinc-950 uppercase tracking-[0.2em]">{selectedContract.title}</h2>
                  <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.1em]">Legal Document Preview</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center space-x-1.5 bg-zinc-950 text-white px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] hover:bg-zinc-800 transition-all shadow-lg shadow-black/10"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print</span>
                  </button>
                  <button onClick={() => setIsContractModalOpen(false)} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-950 transition-colors rounded-lg hover:bg-zinc-100">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] bg-white text-zinc-950">
                <div className="prose prose-sm max-w-none font-serif leading-relaxed text-zinc-800" dangerouslySetInnerHTML={{ __html: selectedContract.html }} />
              </div>

              <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-100 flex justify-center">
                <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Confidential & Proprietary - Enterprise Governance System</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Job Posting Modal */}
      <AnimatePresence>
        {isJobModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-surface border border-border rounded-xl overflow-hidden shadow-2xl"
            >
              <div className="px-2 py-1 border-b border-border flex items-center justify-between bg-surface/50">
                <div className="space-y-0.5">
                  <h2 className="text-xs font-serif font-bold text-fg">
                    {editingJob ? 'Update Posting' : 'New Job Posting'}
                  </h2>
                  <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-muted">Recruitment Management</p>
                </div>
                <button onClick={() => setIsJobModalOpen(false)} className="w-5 h-5 flex items-center justify-center text-muted hover:text-accent transition-colors rounded-lg hover:bg-bg border border-transparent hover:border-border">
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              
              <form onSubmit={handleSaveJob} className="p-2 space-y-1.5">
                <div className="space-y-0.5">
                  <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Job Title</label>
                  <input name="title" defaultValue={editingJob?.title} required className="w-full bg-bg border border-border rounded-lg px-1.5 py-0.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Department</label>
                    <input name="department" defaultValue={editingJob?.department} required className="w-full bg-bg border border-border rounded-lg px-1.5 py-0.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium" />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Status</label>
                    <select name="status" defaultValue={editingJob?.status || 'open'} className="w-full bg-bg border border-border rounded-lg px-1.5 py-0.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium appearance-none">
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-[6px] font-bold uppercase tracking-widest text-muted">Description</label>
                  <textarea name="description" defaultValue={editingJob?.description} rows={3} className="w-full bg-bg border border-border rounded-lg px-1.5 py-0.5 text-[9px] text-fg focus:outline-none focus:border-accent/50 transition-all font-medium resize-none" />
                </div>

                <div className="pt-2 border-t border-border flex justify-end gap-1">
                  <button type="button" onClick={() => setIsJobModalOpen(false)} className="px-2 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.1em] text-muted hover:text-fg transition-colors">Cancel</button>
                  <button type="submit" className="btn-vibrant px-3 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.1em] transition-all shadow-lg shadow-accent/10">Save Posting</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeManagement;
