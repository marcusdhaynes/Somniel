import React, { useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronRight, FolderKanban, Gavel, GripVertical, Handshake, Plus, Search, ShieldCheck, Users, Wallet, X } from 'lucide-react';
import { ContractorProject } from '../../lib/projectDocuments';
import { money, useProjectStore } from '../../lib/projectStore';
import ProjectWorkflow from '../../components/projects/ProjectWorkflow';

const btn='inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors disabled:opacity-40';
const input='w-full rounded-xl border border-border bg-bg text-fg px-3 py-2.5 text-sm focus:border-accent/60 outline-none';
const panel='rounded-2xl border border-border bg-surface/85';
const mode=(project:ContractorProject)=>project.mode==='bounty'?'Open Bounty':project.mode==='bid'?'Competitive Bid':'Direct Assignment';
const ContractorProjects:React.FC=()=>{
  const store=useProjectStore();
  const {contractors,projects,create,assign,bid,save,loading,error}=store;
  const [chosen,setChosen]=useState('');
  const [filter,setFilter]=useState<'all'|'open'|'assigned'>('all');
  const [query,setQuery]=useState('');
  const [dragOver,setDragOver]=useState('');
  const [assignId,setAssignId]=useState('');
  const [bidId,setBidId]=useState('');
  const [createOpen,setCreateOpen]=useState(false);
  const [bidOpen,setBidOpen]=useState(false);
  const [pending,setPending]=useState(false);
  const [feedback,setFeedback]=useState('');
  const selected=projects.find(x=>x.id===chosen)||projects[0];
  const listed=useMemo(()=>projects.filter(p=>(filter==='all'||(filter==='open'?!p.contractorId:!!p.contractorId)) &&
    (p.title+' '+p.description+' '+(p.contractorName||'')).toLowerCase().includes(query.toLowerCase())),[projects,query,filter]);
  const summary=[{name:'Contractors',value:contractors.length,icon:Users},
    {name:'Open Opportunities',value:projects.filter(x=>!x.contractorId).length,icon:FolderKanban},
    {name:'Assigned Projects',value:projects.filter(x=>x.contractorId&&!x.completedStages?.includes(4)).length,icon:Handshake},
    {name:'Payments Recorded',value:projects.filter(x=>x.completedStages?.includes(4)).length,icon:BadgeCheck}];
  const safe=async (operation:()=>Promise<unknown>, success:string)=>{
    setPending(true);setFeedback('');
    try{await operation();setFeedback(success);}
    catch(e){setFeedback(e instanceof Error?e.message:String(e));}
    finally{setPending(false);setDragOver('');}
  };
  const doAssign=(p:ContractorProject,id:string,bidRef?:string)=>{
    if(!id)return;
    void safe(()=>assign(p,id,bidRef),'Assignment recorded. Legal approval must be independently verified before work.');
  };
  const onCreate=(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();const data=new FormData(e.currentTarget);
    void safe(async()=>{const id=await create(data);setChosen(id);setCreateOpen(false);},
      'Project created. Select or award a contractor to begin the approval workflow.');
  };
  const onBid=(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();if(!selected)return;const d=new FormData(e.currentTarget);
    void safe(async()=>{await bid(selected,String(d.get('contractorId')||''),String(d.get('amount')||''),String(d.get('note')||''));setBidOpen(false);},
      'Bid or bounty claim recorded for administrative review. No work is authorized.');
  };
  return <div className="space-y-5 pb-14">
    <header className="relative overflow-hidden rounded-3xl border border-accent/15 bg-gradient-to-br from-accent/10 via-surface to-bg p-5 sm:p-8">
      <div className="relative flex flex-wrap gap-4 items-start justify-between">
        <div><p className="text-[10px] font-bold tracking-[.17em] text-accent">SOMNIEL / WORKFORCE OPERATIONS</p>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-fg mt-2">Project Exchange</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">Create opportunities, manage proposals, assign contractors and turn each engagement into five beautifully documented stages.</p></div>
        <button onClick={()=>setCreateOpen(true)} className={btn+' bg-accent text-bg'}><Plus size={15}/> New Project</button>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
        {summary.map(s=><div key={s.name} className="border border-border/70 bg-bg/70 rounded-2xl p-3">
          <s.icon size={17} className="text-accent mb-2"/><p className="font-serif text-2xl text-fg">{s.value}</p>
          <p className="text-[10px] text-muted">{s.name}</p></div>)}
      </div>
    </header>
    {(feedback||error)&&<div role="status" className="flex justify-between gap-3 items-start p-3 rounded-xl border border-accent/20 bg-accent/5 text-xs text-fg">
      <p>{feedback||error}</p><button onClick={()=>setFeedback('')} title="Dismiss"><X size={14}/></button></div>}

    <div className="grid gap-4 xl:grid-cols-[235px_minmax(0,1fr)]">
      <aside className={panel+' p-4 space-y-3'}>
        <div><h2 className="font-serif text-lg text-fg">Contractors</h2>
          <p className="text-[11px] text-muted">Drag a person onto an opportunity</p></div>
        <div className="space-y-2 xl:max-h-[490px] overflow-y-auto">
          {!contractors.length&&<div className="border border-dashed border-border rounded-xl p-4 text-xs text-muted">Create a team member in Employees, then choose Contractor as the engagement type.</div>}
          {contractors.map(c=><div key={c.id} draggable onDragStart={e=>e.dataTransfer.setData('text/plain',c.id)}
            title="Drag To Project" className="flex gap-2 items-center rounded-xl border border-border bg-bg/70 px-3 py-2 cursor-grab active:cursor-grabbing hover:border-accent/40">
            <span className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-serif font-bold">{c.name.slice(0,1).toUpperCase()}</span>
            <span className="flex-1 min-w-0"><span className="block truncate text-xs font-bold text-fg">{c.name}</span>
              <span className="block truncate text-[10px] text-muted">{c.position||'Contractor'}</span></span>
            <GripVertical size={15} className="text-muted/60"/></div>)}
        </div>
        <div className="rounded-xl bg-accent/5 border border-accent/15 p-3 text-[11px] leading-relaxed text-muted">
          <ShieldCheck size={18} className="text-accent mb-2"/><strong className="block text-fg mb-1">Legal Gate First</strong>
          A bid, bounty claim or assignment does not authorize productive work. Signed-agreement and independent clearance checks come first.</div>
      </aside>

      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-2 items-center justify-between">
          <div><h2 className="font-serif text-xl text-fg">Opportunities</h2><p className="text-xs text-muted">Bids · Bounties · Assignments</p></div>
          <div className="rounded-xl border border-border bg-surface p-1 flex gap-0.5">
            {(['all','open','assigned'] as const).map(f=><button key={f} onClick={()=>setFilter(f)}
              className={'rounded-lg px-3 py-1.5 text-[11px] font-bold '+(filter===f?'bg-accent text-bg':'text-muted hover:text-fg')}>
              {f==='all'?'All':f==='open'?'Open':'Assigned'}</button>)}
          </div>
        </div>
        <div className="relative"><Search size={15} className="absolute left-3 top-3 text-muted"/>
          <input className={input+' pl-9'} value={query} placeholder="Search projects and contractors…" onChange={e=>setQuery(e.target.value)}/></div>
        {loading&&<p className="text-xs text-muted">Loading projects…</p>}
        {!loading&&!listed.length&&<div className={panel+' text-center p-7'}>
          <FolderKanban size={30} className="text-accent mx-auto"/>
          <p className="font-serif text-lg text-fg mt-2">No Opportunities Found</p>
          <p className="text-xs text-muted mt-1">Create a project or change the current filter.</p></div>}
        <div className="grid gap-2 sm:grid-cols-2">
          {listed.map(p=><button key={p.id} onClick={()=>{setChosen(p.id);setFeedback('');}}
            onDragOver={e=>{e.preventDefault();setDragOver(p.id);}}
            onDragLeave={()=>setDragOver(x=>x===p.id?'':x)}
            onDrop={e=>{e.preventDefault();setDragOver('');doAssign(p,e.dataTransfer.getData('text/plain'));}}
            className={'rounded-2xl border p-4 text-left min-w-0 transition-all '+
              (selected?.id===p.id||dragOver===p.id?'bg-accent/10 border-accent':'bg-surface border-border hover:border-accent/40')}>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md bg-bg border border-border text-[9px] font-bold px-2 py-1 text-muted">{mode(p)}</span>
              <span className={'text-[9px] font-bold '+(p.completedStages?.includes(4)?'text-green-500':'text-accent')}>
                {p.completedStages?.includes(4)?'Settled':p.contractorId?'Assigned':'Open'}</span></div>
            <h3 className="font-serif text-lg text-fg mt-3 leading-tight">{p.title}</h3>
            <p className="mt-1 text-xs text-muted line-clamp-2 min-h-8">{p.description||'Scope is finalized in the work order.'}</p>
            <div className="mt-4 pt-3 border-t border-border flex gap-2 items-center justify-between">
              <div><p className="text-[9px] text-muted">Target Budget</p>
                <p className="text-sm font-bold text-fg">{money(p.budget,p.currency)}</p></div>
              <div className="text-right min-w-0"><p className="text-[9px] text-muted">{p.contractorId?'Assigned To':'Proposals'}</p>
                <p className="text-xs font-bold truncate text-fg max-w-32">{p.contractorName||String(p.bids?.length||0)+' Received'}</p></div>
              <ChevronRight size={16} className="text-accent"/></div>
          </button>)}
        </div>
      </section>
    </div>

    {selected&&<section className="space-y-4">
      <div className={panel+' p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3'}>
        <div><p className="text-[10px] font-bold text-accent tracking-[.12em]">PROJECT WORKSPACE / {mode(selected).toUpperCase()}</p>
          <h2 className="font-serif text-2xl text-fg mt-1">{selected.title}</h2>
          <p className="text-xs text-muted mt-1">{selected.contractorName?'Assigned To '+selected.contractorName:'Open For Bids Or Assignment'}</p></div>
        {!selected.contractorId&&<div className="flex flex-wrap items-center gap-2">
          <select aria-label="Assign Contractor" value={assignId} onChange={e=>setAssignId(e.target.value)}
            className={input+' !w-auto max-w-[200px]'}><option value="">Choose Contractor</option>
            {contractors.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <button onClick={()=>doAssign(selected,assignId)} disabled={pending||!assignId}
            className={btn+' border border-border bg-bg text-fg'}>Assign Contractor</button>
          <button onClick={()=>setBidOpen(true)} disabled={pending||!contractors.length}
            className={btn+' bg-accent text-bg'}><Gavel size={15}/> Record Bid / Claim</button>
        </div>}
      </div>
      {!!selected.bids?.length&&<div className={panel+' p-4 sm:p-5'}>
        <h3 className="font-serif text-lg text-fg mb-3">Bids & Bounty Claims</h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {selected.bids.map(b=><div key={b.id} className="p-3 rounded-xl border border-border bg-bg">
            <div className="flex gap-2 justify-between"><div><p className="text-xs font-bold text-fg">{b.contractorName}</p>
              <p className="text-[10px] text-muted">{b.placedAt} · {b.state==='awarded'?'Awarded':'Submitted'}</p></div>
              <strong className="text-xs text-accent">{money(b.amount,b.currency)}</strong></div>
            {b.note&&<p className="text-xs text-muted mt-2">{b.note}</p>}
            {!selected.contractorId&&<button disabled={pending} onClick={()=>doAssign(selected,b.contractorId,b.id)}
              className={btn+' !py-2 text-accent border border-accent/20 mt-2'}>{selected.mode==='bounty'?'Accept Claim':'Award Bid'}<ArrowRight size={13}/></button>}
          </div>)}
        </div>
      </div>}
      <ProjectWorkflow key={selected.id} project={selected} save={save}/>
    </section>}

    {createOpen&&<div className="fixed inset-0 z-[110] bg-bg/85 backdrop-blur-md flex items-center justify-center p-3">
      <div role="dialog" aria-modal="true" aria-label="New Project" className={panel+' w-full max-w-xl max-h-[95dvh] overflow-y-auto p-5 sm:p-7 shadow-2xl'}>
        <div className="flex items-center justify-between mb-4"><div><p className="text-[10px] font-bold text-accent">NEW OPPORTUNITY</p>
          <h2 className="font-serif text-2xl text-fg">Create Project</h2></div><button onClick={()=>setCreateOpen(false)} title="Close"><X size={19}/></button></div>
        <form onSubmit={onCreate} className="space-y-3">
          <label className="block text-xs font-bold text-fg">Project Name *<input name="title" maxLength={180} required className={input+' mt-1'}/></label>
          <label className="block text-xs font-bold text-fg">Project Brief<textarea name="description" rows={3} maxLength={3000} className={input+' mt-1'}/></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-bold text-fg">Project Type
              <select name="mode" className={input+' mt-1'}><option value="bid">Competitive Bid</option><option value="bounty">Open Bounty</option><option value="direct">Direct Assignment</option></select></label>
            <label className="block text-xs font-bold text-fg">Target Date<input type="date" name="dueDate" className={input+' mt-1'}/></label>
            <label className="block text-xs font-bold text-fg">Budget<input type="number" min="0" step="0.01" defaultValue="0" required name="budget" className={input+' mt-1'}/></label>
            <label className="block text-xs font-bold text-fg">Currency<input name="currency" required maxLength={3} defaultValue="USD" className={input+' mt-1'}/></label>
          </div>
          <p className="rounded-xl border border-accent/15 bg-accent/5 text-xs text-muted p-3">Project creation is planning only. Work cannot start before a real legal clearance and signed agreement.</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={()=>setCreateOpen(false)} className={btn+' text-muted'}>Cancel</button>
            <button disabled={pending} className={btn+' bg-accent text-bg'}><Plus size={15}/> Create Project</button></div>
        </form>
      </div>
    </div>}

    {bidOpen&&selected&&<div className="fixed inset-0 z-[110] bg-bg/85 backdrop-blur-md flex items-center justify-center p-3">
      <div role="dialog" aria-modal="true" aria-label="Record Contractor Bid" className={panel+' w-full max-w-lg p-5 sm:p-7 shadow-2xl'}>
        <div className="flex justify-between items-center mb-4"><div><p className="text-[10px] font-bold text-accent">BID / BOUNTY CLAIM</p>
          <h2 className="font-serif text-xl text-fg">{selected.title}</h2></div><button title="Close" onClick={()=>setBidOpen(false)}><X size={19}/></button></div>
        <form onSubmit={onBid} className="space-y-3">
          <label className="block text-xs font-bold text-fg">Contractor *
            <select required name="contractorId" value={bidId} onChange={e=>setBidId(e.target.value)} className={input+' mt-1'}>
              <option value="">Select Contractor</option>{contractors.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className="block text-xs font-bold text-fg">Proposed Fee ({selected.currency}) *
            <input name="amount" required type="number" step="0.01" min="0" className={input+' mt-1'}/></label>
          <label className="block text-xs font-bold text-fg">Proposal Notes<textarea name="note" rows={3} className={input+' mt-1'}/></label>
          <p className="text-xs leading-relaxed text-muted">The administrator records the bid on the contractor's behalf. This is not a direct contractor submission or signature.</p>
          <div className="flex justify-end gap-2"><button type="button" onClick={()=>setBidOpen(false)} className={btn+' text-muted'}>Cancel</button>
            <button disabled={pending} className={btn+' bg-accent text-bg'}>Record Submission</button></div>
        </form>
      </div>
    </div>}
  </div>;
};
export default ContractorProjects;
