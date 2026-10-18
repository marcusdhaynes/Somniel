import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { useCMS } from '../../context/CMSContext';
import { Save, RefreshCcw, Plus, Trash2, Layout, Users, Zap, Gift, Globe, GripVertical, ShieldCheck, Eye, X, Printer, Download, FileText, UserPlus, RefreshCw, UserMinus } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { cn } from '../../lib/utils';
import { EditableInput, EditableTextarea } from '../../components/EditableInput';

const DragHandle = ({ controls }: { controls: any }) => (
  <div 
    onPointerDown={(e) => {
      e.preventDefault();
      controls.start(e);
    }}
    className="p-1.5 text-muted hover:text-accent cursor-grab active:cursor-grabbing transition-colors select-none touch-none"
  >
    <GripVertical className="w-4 h-4" />
  </div>
);

const SubsidiaryItem = ({ sub, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={sub.id} 
      value={sub}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        cursor: "grabbing"
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="p-3 rounded-xl bg-bg/50 border border-border space-y-3 relative group hover:border-accent/30 select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <DragHandle controls={controls} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">Subsidiary #{i + 1}</span>
        </div>
        <button 
          onClick={() => setLocalContent({ ...localContent, subsidiaries: localContent.subsidiaries.filter((_: any, index: number) => index !== i) })}
          className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Name</label>
          <EditableInput
            placeholder="Name"
            value={sub.name}
            onCommit={(val) => {
              const newSubs = [...localContent.subsidiaries];
              newSubs[i].name = val;
              setLocalContent({ ...localContent, subsidiaries: newSubs });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Website URL</label>
          <EditableInput
            placeholder="Website URL"
            value={sub.website}
            onCommit={(val) => {
              const newSubs = [...localContent.subsidiaries];
              newSubs[i].website = val;
              setLocalContent({ ...localContent, subsidiaries: newSubs });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Short Description</label>
        <EditableTextarea
          placeholder="Short Description"
          rows={2}
          value={sub.description}
          onCommit={(val) => {
            const newSubs = [...localContent.subsidiaries];
            newSubs[i].description = val;
            setLocalContent({ ...localContent, subsidiaries: newSubs });
          }}
          className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Long Description (Profile Page)</label>
        <EditableTextarea
          placeholder="Long Description"
          rows={2}
          value={sub.longDescription || ''}
          onCommit={(val) => {
            const newSubs = [...localContent.subsidiaries];
            newSubs[i].longDescription = val;
            setLocalContent({ ...localContent, subsidiaries: newSubs });
          }}
          className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
        />
      </div>
    </Reorder.Item>
  );
};

const FounderItem = ({ founder, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={founder.id} 
      value={founder}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        cursor: "grabbing"
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="p-3 rounded-xl bg-bg/50 border border-border space-y-3 relative group hover:border-accent/30 select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <DragHandle controls={controls} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">Founder #{i + 1}</span>
        </div>
        <button 
          onClick={() => setLocalContent({ ...localContent, founders: localContent.founders.filter((_: any, index: number) => index !== i) })}
          className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Name</label>
          <EditableInput
            placeholder="Name"
            value={founder.name}
            onCommit={(val) => {
              const newFounders = [...localContent.founders];
              newFounders[i].name = val;
              setLocalContent({ ...localContent, founders: newFounders });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Role</label>
          <EditableInput
            placeholder="Role"
            value={founder.role}
            onCommit={(val) => {
              const newFounders = [...localContent.founders];
              newFounders[i].role = val;
              setLocalContent({ ...localContent, founders: newFounders });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Bio</label>
        <EditableTextarea
          placeholder="Bio"
          rows={2}
          value={founder.bio}
          onCommit={(val) => {
            const newFounders = [...localContent.founders];
            newFounders[i].bio = val;
            setLocalContent({ ...localContent, founders: newFounders });
          }}
          className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Vision Statement</label>
        <EditableTextarea
          placeholder="Vision Statement"
          rows={2}
          value={founder.vision || ''}
          onCommit={(val) => {
            const newFounders = [...localContent.founders];
            newFounders[i].vision = val;
            setLocalContent({ ...localContent, founders: newFounders });
          }}
          className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
        />
      </div>
    </Reorder.Item>
  );
};

const ProjectItem = ({ project, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={project.id} 
      value={project}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        cursor: "grabbing"
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="p-3 rounded-xl bg-bg/50 border border-border space-y-3 relative group hover:border-accent/30 select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <DragHandle controls={controls} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">Project #{i + 1}</span>
        </div>
        <button 
          onClick={() => setLocalContent({ ...localContent, projects: localContent.projects.filter((_: any, index: number) => index !== i) })}
          className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Project Name</label>
          <EditableInput
            placeholder="Project Name"
            value={project.name}
            onCommit={(val) => {
              const newProjects = [...localContent.projects];
              newProjects[i].name = val;
              setLocalContent({ ...localContent, projects: newProjects });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Status</label>
          <div className="flex items-center space-x-2">
            <select
              value={project.status}
              onChange={(e) => {
                const newProjects = [...localContent.projects];
                newProjects[i].status = e.target.value;
                setLocalContent({ ...localContent, projects: newProjects });
              }}
              className="flex-1 bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:border-accent/50 font-medium appearance-none select-text"
            >
              <option value="Planned">Planned</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
            <label className="flex items-center space-x-1.5 cursor-pointer bg-bg border border-border rounded-lg px-2 py-1.5">
              <input
                type="checkbox"
                checked={project.isExperimental}
                onChange={(e) => {
                  const newProjects = [...localContent.projects];
                  newProjects[i].isExperimental = e.target.checked;
                  setLocalContent({ ...localContent, projects: newProjects });
                }}
                className="w-3 h-3 rounded border-border bg-bg text-accent focus:ring-accent/20"
              />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Exp</span>
            </label>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Description</label>
        <EditableTextarea
          placeholder="Description"
          rows={2}
          value={project.description}
          onCommit={(val) => {
            const newProjects = [...localContent.projects];
            newProjects[i].description = val;
            setLocalContent({ ...localContent, projects: newProjects });
          }}
          className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
        />
      </div>
    </Reorder.Item>
  );
};

const BenefitItem = ({ benefit, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={benefit.id} 
      value={benefit}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50, 
        cursor: "grabbing" 
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="flex items-center space-x-2 group select-none"
    >
      <div 
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }} 
        className="cursor-grab active:cursor-grabbing p-1.5 select-none touch-none hover:bg-accent/10 rounded-lg transition-colors"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
      </div>
      <EditableInput
        value={benefit.text}
        onCommit={(val) => {
          const newBenefits = [...localContent.benefits];
          newBenefits[i] = { ...newBenefits[i], text: val };
          setLocalContent({ ...localContent, benefits: newBenefits });
        }}
        className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text cursor-text hover:bg-accent/5 transition-colors"
      />
      <button 
        onClick={() => setLocalContent({ ...localContent, benefits: localContent.benefits.filter((_: any, index: number) => index !== i) })}
        className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </Reorder.Item>
  );
};

const PositionItem = ({ position, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={position.id} 
      value={position}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50, 
        cursor: "grabbing" 
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="p-3 rounded-xl bg-bg/50 border border-border space-y-3 relative group hover:border-accent/30 select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <DragHandle controls={controls} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">Position {position.id}</span>
        </div>
        <button 
          onClick={() => setLocalContent({ ...localContent, positions: localContent.positions.filter((_: any, index: number) => index !== i) })}
          className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Title</label>
          <EditableInput
            placeholder="Title"
            value={position.title}
            onCommit={(val) => {
              const newPositions = [...localContent.positions];
              newPositions[i].title = val;
              setLocalContent({ ...localContent, positions: newPositions });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Description</label>
          <EditableTextarea
            placeholder="Description"
            rows={2}
            value={position.description}
            onCommit={(val) => {
              const newPositions = [...localContent.positions];
              newPositions[i].description = val;
              setLocalContent({ ...localContent, positions: newPositions });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none leading-relaxed font-medium select-text"
          />
        </div>
      </div>
    </Reorder.Item>
  );
};

const TrainingItem = ({ item, i, category, localContent, setLocalContent, isFixed }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={item.id} 
      value={item}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50, 
        cursor: "grabbing" 
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="flex items-center space-x-2 group select-none"
    >
      {!isFixed && (
        <div 
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }} 
          className="cursor-grab active:cursor-grabbing p-1.5 select-none touch-none hover:bg-accent/10 rounded-lg transition-colors"
        >
          <GripVertical className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
        </div>
      )}
      <EditableInput
        value={item.text}
        onCommit={(val) => {
          const newTraining = { ...localContent.training };
          newTraining[category][i] = { ...newTraining[category][i], text: val };
          setLocalContent({ ...localContent, training: newTraining });
        }}
        className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text cursor-text hover:bg-accent/5 transition-colors"
      />
      {!isFixed && (
        <button 
          onClick={() => {
            const newTraining = { ...localContent.training };
            newTraining[category] = newTraining[category].filter((_: any, index: number) => index !== i);
            setLocalContent({ ...localContent, training: newTraining });
          }}
          className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </Reorder.Item>
  );
};

const PerformanceReportItem = ({ item, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item 
      key={item.id} 
      value={item}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50, 
        cursor: "grabbing" 
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="flex items-center space-x-2 group select-none"
    >
      <div 
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }} 
        className="cursor-grab active:cursor-grabbing p-1.5 select-none touch-none hover:bg-accent/10 rounded-lg transition-colors"
      >
        <GripVertical className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
      </div>
      <EditableInput
        value={item.text}
        onCommit={(val) => {
          const newItems = [...localContent.performanceReport];
          newItems[i] = { ...newItems[i], text: val };
          setLocalContent({ ...localContent, performanceReport: newItems });
        }}
        className="flex-1 bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text cursor-text hover:bg-accent/5 transition-colors"
      />
      <button 
        onClick={() => setLocalContent({ ...localContent, performanceReport: localContent.performanceReport.filter((_: any, index: number) => index !== i) })}
        className="p-2 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </Reorder.Item>
  );
};

const RankItem = ({ rank, i, localContent, setLocalContent }: any) => {
  const controls = useDragControls();
  const academicOptions = localContent.training?.academic || [];
  const vocationalOptions = localContent.training?.vocational || [];

  return (
    <Reorder.Item 
      key={rank.id} 
      value={rank}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50, 
        cursor: "grabbing" 
      }}
      layout
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="p-3 rounded-xl bg-bg/50 border border-border space-y-3 relative group hover:border-accent/30 select-none"
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <DragHandle controls={controls} />
          <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-accent">Rank Progression {rank.id}</span>
        </div>
        <button 
          onClick={() => setLocalContent({ ...localContent, ranks: localContent.ranks.filter((_: any, index: number) => index !== i) })}
          className="p-1.5 text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 bg-bg rounded-lg border border-border"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Rank Name</label>
          <EditableInput
            placeholder="Rank Name"
            value={rank.name}
            onCommit={(val) => {
              const newRanks = [...localContent.ranks];
              newRanks[i].name = val;
              setLocalContent({ ...localContent, ranks: newRanks });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Education Requirement</label>
          <select
            value={rank.educationId}
            onChange={(e) => {
              const newRanks = [...localContent.ranks];
              newRanks[i].educationId = e.target.value;
              setLocalContent({ ...localContent, ranks: newRanks });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:outline-none focus:border-accent/50 font-medium appearance-none"
          >
            <option value="">None</option>
            {academicOptions.map((opt: any) => (
              <option key={opt.id} value={opt.id}>{opt.text}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Vocational Training</label>
          <div className="flex flex-wrap gap-1 p-2 bg-bg border border-border rounded-lg min-h-[40px]">
            {vocationalOptions.map((opt: any) => (
              <label key={opt.id} className="flex items-center space-x-1 bg-surface/50 px-2 py-1 rounded border border-border cursor-pointer hover:bg-accent/5 transition-colors">
                <input
                  type="checkbox"
                  checked={(rank.vocationalIds || []).includes(opt.id)}
                  onChange={(e) => {
                    const newRanks = [...localContent.ranks];
                    const currentIds = newRanks[i].vocationalIds || [];
                    if (e.target.checked) {
                      newRanks[i].vocationalIds = [...currentIds, opt.id];
                    } else {
                      newRanks[i].vocationalIds = currentIds.filter((id: string) => id !== opt.id);
                    }
                    setLocalContent({ ...localContent, ranks: newRanks });
                  }}
                  className="w-3 h-3 rounded border-border bg-bg text-accent focus:ring-accent/20"
                />
                <span className="text-[8px] font-bold uppercase tracking-wider text-fg/80">{opt.text}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Time Required (Months)</label>
          <EditableInput
            type="number"
            placeholder="Months"
            value={rank.timeMonths}
            onCommit={(val) => {
              const newRanks = [...localContent.ranks];
              newRanks[i].timeMonths = Number(val);
              setLocalContent({ ...localContent, ranks: newRanks });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Earnings Contribution ($)</label>
          <EditableInput
            type="number"
            placeholder="Earnings"
            value={rank.earningsContribution}
            onCommit={(val) => {
              const newRanks = [...localContent.ranks];
              newRanks[i].earningsContribution = Number(val);
              setLocalContent({ ...localContent, ranks: newRanks });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Performance Score (0-7)</label>
          <EditableInput
            type="number"
            placeholder="Score"
            value={rank.performanceScore}
            onCommit={(val) => {
              const newRanks = [...localContent.ranks];
              newRanks[i].performanceScore = Number(val);
              setLocalContent({ ...localContent, ranks: newRanks });
            }}
            className="w-full bg-bg border border-border rounded-lg px-2.5 py-1.5 text-xs text-fg focus:border-accent/50 outline-none font-medium select-text"
          />
        </div>
      </div>
    </Reorder.Item>
  );
};

const ContractPreviewModal = ({ isOpen, onClose, template, type, data }: { isOpen: boolean, onClose: () => void, template?: string, type: string, data?: any }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  const handlePrint = () => {
    if (!contentRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${type} - Somniel Holdings LLC</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap');
            body { margin: 0; padding: 20px; }
            @media print {
              @page { size: portrait; margin: 1cm; }
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSavePDF = () => {
    if (!contentRef.current) return;
    const element = contentRef.current;
    const opt = {
      margin: 10,
      filename: `${type.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(element).save();
  };

  const mockData: Record<string, string> = {
    employeeName: "John A. Smith",
    todayDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    startDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    renewalDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    education: "Master of Science in Computer Engineering",
    experience: "8",
    certifications: "AWS Certified Solutions Architect, Project Management Professional (PMP)",
    baseSalary: "$145,000.00",
    position: "[P2] Praetora",
    rank: "G5",
    previousPosition: "[P4] Warden",
    previousRank: "G3",
    testScore: "94/100",
    effectiveDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    terminationDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    severancePay: "$24,166.67"
  };

  let renderedContent = '';

  if (type === 'Performance Report' && data) {
    renderedContent = `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Performance Evaluation</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 32px; padding: 20px; background: #f9f9f9; border-radius: 8px;">
          <div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px;">Employee Name</p>
            <p style="font-weight: 600;">${mockData.employeeName}</p>
          </div>
          <div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 4px;">Evaluation Date</p>
            <p style="font-weight: 600;">${mockData.todayDate}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="background: #eee;">
              <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Metric</th>
              <th style="padding: 12px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; width: 100px;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((item: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-size: 13px;">${item.text}</td>
                <td style="padding: 12px; text-align: center;">
                  <div style="width: 20px; height: 20px; border: 2px solid #ccc; border-radius: 4px; display: inline-block;"></div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 40px;">
          <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #666; margin-bottom: 8px;">Overall Comments</p>
          <div style="height: 100px; border: 1px solid #eee; border-radius: 8px; background: #fcfcfc;"></div>
        </div>
      </div>
    `;
  } else if (type === 'Ranks' && data) {
    renderedContent = `
      <div style="font-family: 'Inter', sans-serif; color: #1a1a1a; max-width: 800px; margin: 0 auto; padding: 40px; background: white; border: 1px solid #e5e5e5; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 8px; color: #000;">Rank Progression Standards</h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; font-weight: 700; color: #666;">Somniel Holdings LLC</p>
        </div>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #000; color: #fff;">
              <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Rank</th>
              <th style="padding: 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Education</th>
              <th style="padding: 12px; text-align: center; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Time (Mo)</th>
              <th style="padding: 12px; text-align: right; font-size: 10px; text-transform: uppercase; letter-spacing: 1px;">Earnings Req.</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((rank: any) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-weight: 700; color: #000; font-size: 11px;">${rank.name}</td>
                <td style="padding: 12px; font-size: 11px;">${rank.educationId || 'N/A'}</td>
                <td style="padding: 12px; text-align: center; font-size: 11px;">${rank.timeMonths}</td>
                <td style="padding: 12px; text-align: right; font-size: 11px; font-family: monospace;">$${rank.earningsContribution.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else if (template) {
    renderedContent = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return mockData[key] || match;
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-bg w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-bottom border-border flex items-center justify-between bg-surface/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
              <Eye className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-xs font-serif font-bold text-fg">Document Preview</h2>
              <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">{type} Template</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrint}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-muted hover:text-fg hover:border-accent/50 transition-all text-[9px] font-bold uppercase tracking-widest"
            >
              <Printer className="w-3 h-3" />
              <span>Print</span>
            </button>
            <button 
              onClick={handleSavePDF}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
            >
              <Download className="w-3 h-3" />
              <span>Save PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-surface rounded-xl transition-colors text-muted hover:text-fg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 bg-surface/20 custom-scrollbar">
          <div 
            ref={contentRef}
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        </div>

        <div className="p-4 border-t border-border bg-surface/50 flex justify-end">
          <button 
            onClick={onClose}
            className="btn-vibrant px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest"
          >
            Close Preview
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const CMSManagement: React.FC = () => {
  const { content, loading, updateContent } = useCMS();
  const [localContent, setLocalContent] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'hero' | 'subsidiaries' | 'founders' | 'projects' | 'benefits' | 'training' | 'performanceReport' | 'positions' | 'ranks' | 'contracts' | 'nda'>('hero');
  const [previewContract, setPreviewContract] = React.useState<{ type: string, template?: string, data?: any } | null>(null);

  React.useEffect(() => {
    if (content && !localContent) {
      setLocalContent(content);
    }
  }, [content, localContent]);

  const handleSave = async () => {
    if (!localContent) return;
    try {
      await updateContent(localContent);
      alert('CMS content updated successfully.');
    } catch (error) {
      console.error('Failed to update CMS content:', error);
      alert('Failed to update content. Please try again.');
    }
  };

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Layout },
    { id: 'subsidiaries', name: 'Subsidiaries', icon: Globe },
    { id: 'founders', name: 'Founders', icon: Users },
    { id: 'projects', name: 'Projects', icon: Zap },
    { id: 'benefits', name: 'Benefits', icon: Gift },
    { id: 'training', name: 'Training', icon: RefreshCcw },
    { id: 'performanceReport', name: 'Performance Report', icon: Layout },
    { id: 'positions', name: 'Positions', icon: ShieldCheck },
    { id: 'ranks', name: 'Ranks', icon: ShieldCheck },
    { id: 'contracts', name: 'Contracts', icon: Save },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCcw className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (!localContent) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
          <RefreshCcw className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-serif font-bold text-fg">Failed to load content</p>
          <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Please check your connection and try again</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-vibrant px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-1.5 border-b border-border pb-1.5">
        <div className="space-y-0.5">
          <h1 className="text-sm font-serif font-bold tracking-tight text-fg leading-none">Content Studio</h1>
          <div className="flex items-center space-x-1.5 mt-0.5">
            <div className="px-1 py-0.5 rounded-full bg-accent/10 border border-accent/20">
              <p className="text-accent text-[6px] font-bold uppercase tracking-[0.2em]">Global CMS</p>
            </div>
            <p className="text-muted text-[6px] font-bold uppercase tracking-[0.2em]">Enterprise Settings</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="btn-vibrant flex items-center space-x-1.5 px-2 py-1 rounded-lg font-bold text-[7px] uppercase tracking-[0.2em] shadow-lg shadow-accent/10"
        >
          <Save className="w-2.5 h-2.5" />
          <span>Publish Changes</span>
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Sidebar Tabs */}
        <div className="lg:w-80 grid grid-cols-2 gap-2 h-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center space-x-2 px-2 py-2 rounded-xl text-[8px] font-bold uppercase tracking-widest transition-all border",
                activeTab === tab.id 
                  ? "bg-accent text-bg border-accent shadow-md shadow-accent/10" 
                  : "text-muted hover:bg-surface hover:text-fg border-transparent hover:border-border"
              )}
            >
              <tab.icon className={cn("w-2.5 h-2.5 shrink-0", activeTab === tab.id ? "text-bg" : "text-accent")} />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Editor */}
        <div className="flex-1 bg-surface/30 rounded-2xl border border-border p-4 backdrop-blur-md shadow-sm">
          {activeTab === 'hero' && (
            <div className="space-y-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Hero Section</h3>
                <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Main Landing Page Elements</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Main Title</label>
                  <EditableInput
                    type="text"
                    value={localContent.hero.title}
                    onCommit={(val) => setLocalContent({ ...localContent, hero: { ...localContent.hero, title: val } })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">Subtitle</label>
                  <EditableTextarea
                    rows={2}
                    value={localContent.hero.subtitle}
                    onCommit={(val) => setLocalContent({ ...localContent, hero: { ...localContent.hero, subtitle: val } })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent/50 transition-all leading-relaxed font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">CTA Text</label>
                  <EditableInput
                    type="text"
                    value={localContent.hero.cta}
                    onCommit={(val) => setLocalContent({ ...localContent, hero: { ...localContent.hero, cta: val } })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-fg focus:outline-none focus:border-accent/50 transition-all font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subsidiaries' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Subsidiaries</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Enterprise Portfolio</p>
                </div>
                <button 
                  onClick={() => setLocalContent({
                    ...localContent,
                    subsidiaries: [...localContent.subsidiaries, { id: Date.now().toString(), name: 'New Subsidiary', description: '', logo: 'https://picsum.photos/seed/newsub/200/200', website: '' }]
                  })}
                  className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.subsidiaries} 
                onReorder={(newSubs) => setLocalContent({ ...localContent, subsidiaries: newSubs })}
                className="flex flex-col gap-3"
              >
                {localContent.subsidiaries.map((sub: any, i: number) => (
                  <SubsidiaryItem 
                    key={sub.id || i} 
                    sub={sub} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'founders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Founders</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Executive Leadership</p>
                </div>
                <button 
                  onClick={() => setLocalContent({
                    ...localContent,
                    founders: [...localContent.founders, { id: Date.now().toString(), name: 'New Founder', role: '', bio: '', photo: 'https://picsum.photos/seed/founder/200/200' }]
                  })}
                  className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.founders} 
                onReorder={(newFounders) => setLocalContent({ ...localContent, founders: newFounders })}
                className="flex flex-col gap-3"
              >
                {localContent.founders.map((founder: any, i: number) => (
                  <FounderItem 
                    key={founder.id || i} 
                    founder={founder} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Associated Projects</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Research & Development</p>
                </div>
                <button 
                  onClick={() => setLocalContent({
                    ...localContent,
                    projects: [...localContent.projects, { id: Date.now().toString(), name: 'New Project', description: '', status: 'Planned' }]
                  })}
                  className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.projects} 
                onReorder={(newProjects) => setLocalContent({ ...localContent, projects: newProjects })}
                className="flex flex-col gap-3"
              >
                {localContent.projects.map((project: any, i: number) => (
                  <ProjectItem 
                    key={project.id || i} 
                    project={project} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'benefits' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Universal Benefits</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Employee Perks & Compensation</p>
                </div>
                <button 
                  onClick={() => setLocalContent({ ...localContent, benefits: [...localContent.benefits, { id: Date.now().toString(), text: 'New Benefit' }] })}
                  className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.benefits} 
                onReorder={(newBenefits) => setLocalContent({ ...localContent, benefits: newBenefits })}
                className="flex flex-col gap-1.5"
              >
                {localContent.benefits.map((benefit: any, i: number) => (
                  <BenefitItem 
                    key={benefit.id || i} 
                    benefit={benefit} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'training' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="space-y-0.5 p-3 rounded-xl bg-accent/5 border border-accent/10 shadow-sm">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Academic Training</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Fixed Educational Standards</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {(localContent.training?.academic || []).map((item: any, i: number) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-surface border border-border flex flex-col items-center justify-center text-center space-y-2 group hover:border-accent/40 transition-all shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <EditableInput
                        value={item.text}
                        onCommit={(val) => {
                          const newTraining = { ...localContent.training };
                          newTraining.academic[i] = { ...newTraining.academic[i], text: val };
                          setLocalContent({ ...localContent, training: newTraining });
                        }}
                        className="w-full text-center bg-transparent border-none text-xs font-bold uppercase tracking-widest text-fg focus:outline-none"
                      />
                      <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted/60">Standard {i + 1}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Vocational Training</h3>
                    <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Dynamic Professional Certifications</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newTraining = { ...localContent.training };
                      newTraining.vocational = [...(newTraining.vocational || []), { id: Date.now().toString(), text: 'New Vocational Training' }];
                      setLocalContent({ ...localContent, training: newTraining });
                    }}
                    className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Reorder.Group 
                  axis="y" 
                  values={localContent.training?.vocational || []} 
                  onReorder={(newVoc) => {
                    const newTraining = { ...localContent.training };
                    newTraining.vocational = newVoc;
                    setLocalContent({ ...localContent, training: newTraining });
                  }}
                  className="flex flex-col gap-1.5"
                >
                  {(localContent.training?.vocational || []).map((item: any, i: number) => (
                    <TrainingItem 
                      key={item.id} 
                      item={item} 
                      i={i} 
                      category="vocational"
                      localContent={localContent} 
                      setLocalContent={setLocalContent} 
                    />
                  ))}
                </Reorder.Group>
              </div>
            </div>
          )}

          {activeTab === 'performanceReport' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Performance Report Card</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Checklist-Style Evaluation System</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setPreviewContract({ type: 'Performance Report', data: localContent.performanceReport })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button 
                    onClick={() => setLocalContent({ 
                      ...localContent, 
                      performanceReport: [...(localContent.performanceReport || []), { id: Date.now().toString(), text: 'New Performance Metric' }] 
                    })}
                    className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.performanceReport || []} 
                onReorder={(newItems) => setLocalContent({ ...localContent, performanceReport: newItems })}
                className="flex flex-col gap-1.5"
              >
                {(localContent.performanceReport || []).map((item: any, i: number) => (
                  <PerformanceReportItem 
                    key={item.id} 
                    item={item} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'ranks' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Rank Progression</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Requirements for Advancement</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setPreviewContract({ type: 'Ranks', data: localContent.ranks })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button 
                    onClick={() => setLocalContent({ 
                      ...localContent, 
                      ranks: [...(localContent.ranks || []), { 
                        id: `R${(localContent.ranks?.length || 0) + 1}`, 
                        name: 'New Rank', 
                        educationId: '', 
                        vocationalIds: [], 
                        timeMonths: 0, 
                        earningsContribution: 0, 
                        performanceScore: 0 
                      }] 
                    })}
                    className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.ranks || []} 
                onReorder={(newRanks) => setLocalContent({ ...localContent, ranks: newRanks })}
                className="flex flex-col gap-3"
              >
                {(localContent.ranks || []).map((rank: any, i: number) => (
                  <RankItem 
                    key={rank.id} 
                    rank={rank} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-serif font-bold tracking-tight text-fg">Organizational Positions</h3>
                  <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted">Role Definitions & Responsibilities</p>
                </div>
                <button 
                  onClick={() => setLocalContent({ 
                    ...localContent, 
                    positions: [...(localContent.positions || []), { id: Date.now().toString(), title: 'New Position', description: '' }] 
                  })}
                  className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent border border-accent/20 rounded-lg hover:bg-accent hover:text-bg transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <Reorder.Group 
                axis="y" 
                values={localContent.positions || []} 
                onReorder={(newPositions) => setLocalContent({ ...localContent, positions: newPositions })}
                className="flex flex-col gap-3"
              >
                {(localContent.positions || []).map((pos: any, i: number) => (
                  <PositionItem 
                    key={pos.id || i} 
                    position={pos} 
                    i={i} 
                    localContent={localContent} 
                    setLocalContent={setLocalContent} 
                  />
                ))}
              </Reorder.Group>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Hiring Contract */}
              <div className="p-4 rounded-2xl bg-bg/50 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                      <UserPlus className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-fg">Hiring Contract Template</h3>
                      <p className="text-[8px] text-muted uppercase tracking-widest mt-0.5">Legal Framework for New Talent</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewContract({ type: 'Hiring', template: localContent.contracts?.hiring || '' })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">HTML Template (Use double curly braces for variables)</label>
                  <EditableTextarea
                    rows={8}
                    value={localContent.contracts?.hiring || ''}
                    onCommit={(val) => setLocalContent({ 
                      ...localContent, 
                      contracts: { ...localContent.contracts, hiring: val } 
                    })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-fg focus:outline-none focus:border-accent/50 transition-all leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>

              {/* Change of Position Contract */}
              <div className="p-4 rounded-2xl bg-bg/50 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                      <RefreshCw className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-fg">Change of Position Contract Template</h3>
                      <p className="text-[8px] text-muted uppercase tracking-widest mt-0.5">Legal Framework for Internal Mobility</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewContract({ type: 'Change of Position', template: localContent.contracts?.changeOfPosition || '' })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">HTML Template (Use double curly braces for variables)</label>
                  <EditableTextarea
                    rows={8}
                    value={localContent.contracts?.changeOfPosition || ''}
                    onCommit={(val) => setLocalContent({ 
                      ...localContent, 
                      contracts: { ...localContent.contracts, changeOfPosition: val } 
                    })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-fg focus:outline-none focus:border-accent/50 transition-all leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>

              {/* Termination Contract */}
              <div className="p-4 rounded-2xl bg-bg/50 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                      <UserMinus className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-fg">Termination Contract Template</h3>
                      <p className="text-[8px] text-muted uppercase tracking-widest mt-0.5">Legal Framework for Offboarding</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewContract({ type: 'Termination', template: localContent.contracts?.termination || '' })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">HTML Template (Use double curly braces for variables)</label>
                  <EditableTextarea
                    rows={8}
                    value={localContent.contracts?.termination || ''}
                    onCommit={(val) => setLocalContent({ 
                      ...localContent, 
                      contracts: { ...localContent.contracts, termination: val } 
                    })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-fg focus:outline-none focus:border-accent/50 transition-all leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>

              {/* NDA Agreement */}
              <div className="p-4 rounded-2xl bg-bg/50 border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-accent/10 border border-accent/20">
                      <FileText className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-fg">Non-Disclosure Agreement</h3>
                      <p className="text-[8px] text-muted uppercase tracking-widest mt-0.5">Confidentiality and IP Protection</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPreviewContract({ type: 'NDA', template: localContent.contracts?.nda || '' })}
                    className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-bg transition-all text-[9px] font-bold uppercase tracking-widest"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted">HTML Template (Use double curly braces for variables)</label>
                  <EditableTextarea
                    rows={8}
                    value={localContent.contracts?.nda || ''}
                    onCommit={(val) => setLocalContent({ 
                      ...localContent, 
                      contracts: { ...localContent.contracts, nda: val } 
                    })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-[10px] font-mono text-fg focus:outline-none focus:border-accent/50 transition-all leading-relaxed custom-scrollbar"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ContractPreviewModal 
        isOpen={!!previewContract} 
        onClose={() => setPreviewContract(null)} 
        template={previewContract?.template} 
        type={previewContract?.type || ''} 
        data={previewContract?.data}
      />
    </div>

  );
};

export default CMSManagement;
