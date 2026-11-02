import React, { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Download, FileCheck2, FileText, LockKeyhole, ShieldCheck, Wallet, ClipboardCheck, CircleDollarSign } from 'lucide-react';
import { ContractorProject, exportProjectPdf, PROJECT_STAGES } from '../../lib/projectDocuments';
import { money } from '../../lib/projectStore';
const icons = [ShieldCheck, ClipboardCheck, FileCheck2, CircleDollarSign, Wallet];
const control = 'w-full rounded-xl border border-border bg-bg text-fg p-3 text-sm outline-none transition-colors focus:border-accent/70 disabled:opacity-60';
const button = 'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold disabled:opacity-40 transition-colors';
type Props = { project: ContractorProject; save: (project:ContractorProject, stage:number, record:Record<string,string>, approved:boolean)=>Promise<void> };

const ProjectWorkflow: React.FC<Props> = ({ project, save }) => {
  const [stage, setStage] = useState(0);
  const [values, setValues] = useState<Record<string,string>>({});
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const approved = project.completedStages || [];
  const next = [0,1,2,3,4].find(i => !approved.includes(i)) ?? 5;
  useEffect(() => {
    setValues(project.record || {});
    setDirty(false);
    setStage(Math.min(4,(project.completedStages || []).length));
    setMessage('');
  }, [project.id, project.record]);
  const choose = (index:number) => {
    if (index > next) { setMessage('Complete earlier stages to unlock this document.'); return; }
    if (dirty && !window.confirm('Discard unsaved changes to this document?')) return;
    setValues(project.record || {}); setDirty(false); setStage(index); setMessage('');
  };
  const change = (key:string, value:string) => { setValues(old => ({ ...old, [key]:value })); setDirty(true); setMessage(''); };
  const submit = async (approve:boolean) => {
    setBusy(true); setMessage('');
    try {
      await save(project,stage,values,approve);
      setDirty(false);
      setMessage(approve ? 'Stage recorded. The next document is now unlocked.' : 'Saved as a draft. No approval granted.');
      if (approve) setStage(Math.min(stage + 1,4));
    } catch (error) { setMessage(String(error instanceof Error ? error.message : error)); }
    finally { setBusy(false); }
  };
  const exportPDF = async () => {
    setBusy(true);
    try {
      await exportProjectPdf({ ...project, record:values,
        completedStages:dirty ? approved.filter(i=>i!==stage) : approved },stage);
    } catch (error) { setMessage('PDF export failed: ' + String(error)); }
    finally { setBusy(false); }
  };
  const spec = PROJECT_STAGES[stage], Icon = icons[stage];
  const canFill = stage <= next;
  const canApprove = !!project.contractorId && stage <= next;
  const missingFields = spec.fields.filter(field => field.required &&
    (!(values[field.key] || '').trim() || (field.type === 'checkbox' && values[field.key] !== 'yes')));
  return <div className="overflow-hidden rounded-3xl border border-border bg-surface">
    <header className="border-b border-border p-5 sm:p-6 bg-gradient-to-r from-accent/10 via-surface to-bg">
      <div className="flex flex-wrap justify-between gap-3 items-start">
        <div><p className="text-[10px] font-bold tracking-[.14em] text-accent">PROJECT DOCUMENT WORKFLOW</p>
          <h2 className="mt-1 font-serif text-2xl text-fg">From Approval to Receipt</h2>
          <p className="mt-1 text-xs text-muted">Only the current stage can advance. All five records export as individual PDFs.</p>
        </div>
        <div className="rounded-xl border border-accent/20 bg-bg/60 px-4 py-2 text-center">
          <p className="font-serif text-xl text-accent">{approved.length} / 5</p><p className="text-[10px] text-muted">Recorded Stages</p></div>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-5">
        {PROJECT_STAGES.map((item,index) => {
          const StageIcon=icons[index], done=approved.includes(index), locked=index>next;
          return <button title={item.title} aria-label={item.title} key={index} disabled={locked} onClick={() => choose(index)}
            className={'text-left rounded-xl border px-2.5 py-3 min-h-20 transition-all ' +
              (index===stage ? 'border-accent bg-accent/10 shadow-lg shadow-accent/5' :
                done ? 'border-green-500/30 bg-green-500/5' : 'border-border bg-bg/70') +
              (locked ? ' opacity-40 cursor-not-allowed' : ' hover:border-accent/60')}>
            <span className="flex items-center justify-between gap-1">
              <StageIcon size={16} className={done ? 'text-green-500' : 'text-accent'}/>
              {done ? <Check size={14} className="text-green-500"/> : locked ? <LockKeyhole size={12} className="text-muted"/> :
                <span className="text-[10px] text-muted">0{index+1}</span>}
            </span>
            <span className="mt-2 hidden sm:block text-[11px] text-fg font-bold leading-snug">{item.title}</span>
            <span className="mt-2 block sm:hidden text-[9px] text-fg font-bold">{['Legal','Request','Work','Invoice','Paid'][index]}</span>
          </button>;
        })}
      </div>
      <div className="mt-4 h-1 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-accent transition-[width]" style={{width:(approved.length*20)+'%'}}/>
      </div>
    </header>
    <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_230px]">
      <div className="min-w-0 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex gap-3 items-center"><div className="h-12 w-12 flex items-center justify-center bg-accent/10 border border-accent/20 rounded-2xl text-accent">
            <Icon size={23}/></div>
            <div><p className="text-[10px] text-accent font-bold">DOCUMENT 0{stage+1}</p>
              <h3 className="font-serif text-xl text-fg">{spec.title}</h3>
              <p className="text-xs text-muted mt-1">{spec.subtitle}</p></div>
          </div>
          <button disabled={busy} onClick={() => void exportPDF()} className={button+' border border-border text-fg bg-bg hover:border-accent/40'}>
            <Download size={15}/> Export PDF</button>
        </div>
        {message && <p role="status" className="rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs text-fg">{message}</p>}
        {!project.contractorId && <p className="rounded-xl border border-border bg-bg p-4 text-xs text-muted">
          You can save incomplete drafts now. Assign a contractor before approving any stage; assignment does not authorize work.</p>}
        {!!missingFields.length && <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-500" role="status">{missingFields.length} required field{missingFields.length === 1 ? '' : 's'} incomplete. Red outlines identify missing information; Save Draft remains available.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {spec.fields.map(field => {
            const incomplete = field.required && (!(values[field.key] || '').trim() ||
              (field.type === 'checkbox' && values[field.key] !== 'yes'));
            return <label key={field.key} className={'block ' +
              (field.type==='textarea'||field.type==='checkbox' ? 'sm:col-span-2 ' : '') +
              (incomplete ? 'project-workflow-field-incomplete' : '')}>
            {field.type!=='checkbox' && <span className="block text-[11px] font-bold text-fg mb-1.5">{field.label}{field.required && <span className="text-accent ml-1">*</span>}</span>}
            {field.type==='textarea' ?
              <textarea className={control+' min-h-28 resize-y'} rows={4} disabled={!canFill} placeholder="Describe the facts and document references..."
                value={values[field.key]||''} onChange={e=>change(field.key,e.target.value)}/> :
              field.type==='checkbox' ?
              <span className="flex items-start gap-3 rounded-xl bg-accent/5 border border-accent/15 p-3 text-xs leading-relaxed text-fg">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-current" disabled={!canFill}
                  checked={values[field.key]==='yes'} onChange={e=>change(field.key,e.target.checked?'yes':'')}/>
                <span>{field.label}{field.required && <strong className="text-accent ml-1">*</strong>}</span></span> :
              <input className={control} disabled={!canFill} type={field.type||'text'} min={field.type==='number'?'0':undefined}
                step={field.type==='number'?'0.01':undefined} value={values[field.key]||''}
                onChange={e=>change(field.key,e.target.value)} />}
          </label>;
          })}
        </div>
        <div className="flex flex-wrap justify-between gap-3 items-center pt-4 border-t border-border">
          <button className={button+' text-muted'} disabled={stage===0} onClick={() => choose(Math.max(0,stage-1))}>
            <ChevronLeft size={14}/> Previous</button>
          <div className="flex gap-2">
            <button disabled={busy||!canFill} onClick={() => void submit(false)}
              className={button+' border border-border text-fg bg-bg'}>Save Draft</button>
            <button disabled={busy||!canApprove} onClick={() => void submit(true)}
              className={button+' bg-accent text-bg hover:opacity-90'}>
              <Check size={15}/>{stage===4?'Record Payment':'Approve & Continue'}<ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
      <aside className="space-y-3">
        <div className="p-4 rounded-2xl border border-accent/20 bg-accent/5">
          <ShieldCheck className="text-accent mb-2" size={21}/>
          <h4 className="font-bold text-xs text-fg">Legal Clearance Is Required</h4>
          <p className="mt-2 text-[11px] leading-relaxed text-muted">
            This form records a real review and signed agreement. It does not issue an authorization, validate signatures or transfer money.</p>
        </div>
        <div className="p-4 rounded-2xl border border-border bg-bg space-y-3">
          <p className="text-xs font-bold text-fg">Record Summary</p>
          <p className="text-[10px] text-muted break-all">{project.id}</p>
          <p className="text-xs text-fg border-t border-border pt-3">{project.contractorName || 'No Contractor Assigned'}</p>
          <p className="text-xs text-muted">{money(project.budget,project.currency)} Target Budget</p>
          <p className="text-xs text-muted">{project.dueDate || 'Unscheduled'} Target Date</p>
        </div>
        {stage===0 && <div className="p-4 rounded-2xl border border-border bg-bg text-xs leading-relaxed text-muted">
          Confirm the actual work location, classification, necessary permissions, competent legal reviewer and executed contract before completing Stage 01.
        </div>}
        {stage===3 && <div className="p-4 rounded-2xl border border-border bg-bg text-xs leading-relaxed text-muted">
          Contractors may invoice only when genuinely classified as independent. Employees instead require payroll, wage statements and mandated benefits.
        </div>}
      </aside>
    </div>
  </div>;
};
export default ProjectWorkflow;
