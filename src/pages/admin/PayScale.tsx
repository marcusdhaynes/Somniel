import React, { useState, useEffect } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { usePayscale, PayscaleConfig } from '../../context/PayscaleContext';
import { useCMS } from '../../context/CMSContext';
import { DollarSign, Save, RefreshCcw, Plus, Trash2, TrendingUp, ShieldCheck, GripVertical, ExternalLink } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { EditableInput } from '../../components/EditableInput';
import { Link } from 'react-router-dom';

const MultiplierItem = ({ category, id, name, value, onUpdateName, onUpdateValue, onDelete, statusColor, color, onUpdateColor, readOnlyName }: any) => {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ 
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        zIndex: 50,
        cursor: "grabbing"
      }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className="flex items-center justify-between p-2.5 rounded-lg bg-surface/50 border border-border group hover:border-accent/40 shadow-sm select-none"
    >
      <div className="flex items-center space-x-2 flex-1">
        <div 
          onPointerDown={(e) => {
            e.preventDefault();
            controls.start(e);
          }} 
          className="cursor-grab active:cursor-grabbing p-1 touch-none"
        >
          <GripVertical className="w-3 h-3 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="flex items-center space-x-2 flex-1">
          {category === 'performance' ? (
            <div className="relative group/color">
              <input
                type="color"
                value={color || (name === 'green' ? "#22c55e" : (name === 'yellow' || name === 'gold' || name === 'purple') ? "#eab308" : "#ef4444")}
                onChange={(e) => onUpdateColor(category, name, e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div 
                className={cn("w-2 h-2 rounded-full shadow-sm border border-white/20")} 
                style={{ backgroundColor: color || (name === 'green' ? "#22c55e" : (name === 'yellow' || name === 'gold' || name === 'purple') ? "#eab308" : "#ef4444") }}
              />
              <div 
                className={cn("absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-30")} 
                style={{ backgroundColor: color || (name === 'green' ? "#22c55e" : (name === 'yellow' || name === 'gold' || name === 'purple') ? "#eab308" : "#ef4444") }}
              />
            </div>
          ) : statusColor ? (
            <div className="relative">
              <div className={cn("w-1.5 h-1.5 rounded-full", statusColor)} />
              <div className={cn("absolute inset-0 w-1.5 h-1.5 rounded-full animate-ping opacity-30", statusColor)} />
            </div>
          ) : null}
          {readOnlyName ? (
            <span className="text-[10px] font-bold text-fg/80 uppercase tracking-[0.15em] px-1 flex-1 py-1">
              {name}
            </span>
          ) : (
            <EditableInput
              value={name}
              onCommit={(val) => onUpdateName(category, name, val)}
              className="text-[10px] font-bold text-fg/80 uppercase tracking-[0.15em] bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-accent/30 rounded px-1 flex-1 select-text cursor-text hover:bg-accent/5 transition-colors"
              placeholder="Name"
            />
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <EditableInput
            type="number"
            step="1"
            value={value}
            onCommit={(val) => onUpdateValue(category, name, Number(val))}
            className="w-14 bg-bg border border-border rounded-md px-1.5 py-1 text-[11px] font-bold text-right focus:outline-none focus:border-accent/50 transition-all shadow-inner select-text cursor-text"
          />
          <div className="absolute -top-1.5 -right-1 bg-accent text-bg text-[6px] font-bold px-0.5 py-0 rounded shadow-sm select-none">%</div>
        </div>
        {!readOnlyName && (
          <button 
            onClick={() => onDelete(category, name)}
            className="p-1 text-muted hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 bg-bg rounded-md border border-border hover:border-red-500/30"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
    </Reorder.Item>
  );
};

const PayrollConfig: React.FC = () => {
  const { config, loading, updateConfig } = usePayscale();
  const { content } = useCMS();
  const [localConfig, setLocalConfig] = useState<PayscaleConfig | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Initialize localConfig from context config
  useEffect(() => {
    if (config && (!localConfig || !isDirty)) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [config, isDirty]);

  // Sync positions from CMS
  useEffect(() => {
    if (!content?.positions || !localConfig || isDirty) return;

    const cmsPositions = content.positions;
    const currentFactors = localConfig.factors.position || [];
    
    // Create new factors array based on CMS positions
    const syncedFactors = cmsPositions.map(cmsPos => {
      const existing = currentFactors.find((f: any) => f.name === cmsPos.title);
      return {
        id: existing ? existing.id : `pos-${cmsPos.id}-${Math.random().toString(36).substr(2, 9)}`,
        name: cmsPos.title,
        multiplier: existing ? existing.multiplier : 1.0
      };
    });

    // Check if there's an actual change to avoid infinite loops
    const hasChanged = JSON.stringify(syncedFactors) !== JSON.stringify(currentFactors);
    
    if (hasChanged) {
      setLocalConfig(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          factors: {
            ...prev.factors,
            position: syncedFactors
          }
        };
      });
    }
  }, [content?.positions, localConfig, isDirty]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!localConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
          <RefreshCcw className="w-6 h-6 text-red-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-serif font-bold text-fg">Failed to load configuration</p>
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

  const handleSave = async () => {
    try {
      await updateConfig(localConfig);
      setIsDirty(false);
      alert('Payroll configuration updated successfully.');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('Failed to save configuration. Please check your permissions.');
    }
  };

  const updateFactor = (category: string, name: string, value: number) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const items = [...(factors as any)[category]];
    const index = items.findIndex(i => i.name === name);
    if (index !== -1) {
      items[index] = { ...items[index], multiplier: value };
      (factors as any)[category] = items;
      setLocalConfig({ ...localConfig, factors });
      setIsDirty(true);
    }
  };

  const updateFactorColor = (category: string, name: string, color: string) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const items = [...(factors as any)[category]];
    const index = items.findIndex(i => i.name === name);
    if (index !== -1) {
      items[index] = { ...items[index], color };
      (factors as any)[category] = items;
      setLocalConfig({ ...localConfig, factors });
      setIsDirty(true);
    }
  };

  const updateFactorName = (category: string, oldName: string, newName: string) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const items = [...(factors as any)[category]];
    const index = items.findIndex(i => i.name === oldName);
    if (index !== -1) {
      items[index] = { ...items[index], name: newName };
      (factors as any)[category] = items;
      setLocalConfig({ ...localConfig, factors });
      setIsDirty(true);
    }
  };

  const deleteFactor = (category: string, name: string) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const items = [...(factors as any)[category]].filter(i => i.name !== name);
    (factors as any)[category] = items;
    setLocalConfig({ ...localConfig, factors });
    setIsDirty(true);
  };

  const addFactor = (category: string) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const items = [...(factors as any)[category]];
    
    const baseName = `New ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    let finalName = baseName;
    let counter = 1;
    while (items.some((i: any) => i.name === finalName)) {
      finalName = `${baseName} ${counter++}`;
    }
    
    items.push({ 
      id: `${category}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: finalName, 
      multiplier: 1.0 
    });
    (factors as any)[category] = items;
    setLocalConfig({ ...localConfig, factors });
    setIsDirty(true);
  };

  const handleReorder = (category: string, newOrderIds: string[]) => {
    if (!localConfig) return;
    const factors = { ...localConfig.factors };
    const currentItems = (factors as any)[category];
    
    if (!Array.isArray(currentItems)) return;

    const newItems = newOrderIds.map(id => 
      currentItems.find((i: any) => i.id === id)
    ).filter(Boolean);

    (factors as any)[category] = newItems;
    setLocalConfig({ ...localConfig, factors });
    setIsDirty(true);
  };

  return (
    <div key={localConfig.baseRate} className="space-y-3 pb-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 border-b border-border pb-1.5">
        <div>
          <h1 className="text-sm font-serif font-bold tracking-tight text-fg leading-none">Pay Scale Configuration</h1>
          <p className="text-muted flex items-center space-x-1.5 text-[6px] font-bold uppercase tracking-[0.3em] mt-0.5">
            <ShieldCheck className="w-2 h-2 text-accent" />
            <span>Dynamic Pay Calculation Engine v4.2</span>
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn-vibrant flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-accent/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Save className="w-2.5 h-2.5" />
          <span>Save Configuration</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Base Rate Card */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-surface border border-border relative overflow-hidden group shadow-sm">
            <div className="absolute -top-3 -right-3 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
              <DollarSign className="w-16 h-16 text-accent" />
            </div>
            <h3 className="text-[7px] font-bold text-fg mb-3 flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-2.5 h-2.5 text-accent" />
              </div>
              <span className="uppercase tracking-[0.2em]">Base Salary Rate</span>
            </h3>
            <div className="space-y-2">
              <label className="text-[7px] font-bold uppercase tracking-[0.2em] text-muted/80">Annual Base (USD)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted font-serif font-bold text-sm">$</span>
                <EditableInput
                  type="number"
                  value={localConfig.baseRate}
                  onCommit={(val) => setLocalConfig({ ...localConfig, baseRate: Number(val) })}
                  className="w-full bg-bg border border-border rounded-lg py-1.5 pl-6 pr-2.5 text-sm font-serif font-bold text-fg focus:outline-none focus:border-accent/50 transition-all shadow-inner tracking-tight"
                />
              </div>
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/10 mt-2">
                <p className="text-[8px] text-accent leading-relaxed font-bold uppercase tracking-wider">
                  Operational Note:
                </p>
                <p className="text-[8px] text-muted/80 leading-relaxed font-medium mt-0.5">
                  Starting point for all calculations. Multipliers are applied to this base value.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-surface border border-border shadow-sm">
            <h3 className="text-[7px] font-bold text-fg mb-3 flex items-center space-x-2">
              <div className="w-5 h-5 rounded-lg bg-accent/10 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-2.5 h-2.5 text-accent" />
              </div>
              <span className="uppercase tracking-[0.2em]">Time Multipliers</span>
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Experience (Per Year %)', key: 'experience' },
                { label: 'Tenure (Per Year %)', key: 'timeInCompany' },
                { label: 'Cost of Living Adjustment [COLA] (%)', key: 'cola' }
              ].map((item) => (
                <div key={item.key} className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[7px] font-bold uppercase tracking-[0.15em] text-muted">{item.label}</label>
                    <span className="text-[7px] font-mono text-accent">{(localConfig.factors as any)[item.key]}%</span>
                  </div>
                  <EditableInput
                    type="number"
                    step="1"
                    value={(localConfig.factors as any)[item.key]}
                    onCommit={(val) => setLocalConfig({ ...localConfig, factors: { ...localConfig.factors, [item.key]: Number(val) } })}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-1.5 text-[10px] font-bold focus:outline-none focus:border-accent/50 transition-all shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Multipliers Grid */}
        <div className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Rank Multipliers', category: 'rank' },
              { title: 'Position Multipliers', category: 'position' },
              { title: 'Education Multipliers', category: 'education' },
              { title: 'Performance Multipliers', category: 'performance' }
            ].map((section) => (
              <div key={section.category} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-0.5 h-3 bg-accent rounded-full" />
                    <h3 className="text-xs font-serif font-bold tracking-tight text-fg">{section.title}</h3>
                    {section.category === 'position' && (
                      <Link 
                        to="/admin/cms" 
                        className="text-[8px] font-bold uppercase tracking-widest text-accent hover:underline flex items-center gap-1 ml-2"
                      >
                        <ExternalLink className="w-2 h-2" />
                        Sync from CMS
                      </Link>
                    )}
                  </div>
                  {section.category !== 'position' && (
                    <button 
                      onClick={() => addFactor(section.category)}
                      className="w-6 h-6 bg-surface rounded-lg text-accent border border-border hover:bg-bg transition-all flex items-center justify-center shadow-md hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <Reorder.Group
                  axis="y"
                  values={Array.isArray((localConfig.factors as any)[section.category]) ? (localConfig.factors as any)[section.category].map((i: any) => i.id) : []}
                  onReorder={(newOrder) => handleReorder(section.category, newOrder as string[])}
                  className="flex flex-col gap-2"
                >
                  {Array.isArray((localConfig.factors as any)[section.category]) && (localConfig.factors as any)[section.category].map((item: any) => {
                    return (
                      <MultiplierItem
                        key={item.id}
                        category={section.category}
                        id={item.id}
                        name={item.name}
                        value={item.multiplier}
                        color={item.color}
                        onUpdateName={updateFactorName}
                        onUpdateValue={updateFactor}
                        onUpdateColor={updateFactorColor}
                        onDelete={deleteFactor}
                        readOnlyName={section.category === 'position'}
                        statusColor={section.category === 'performance' ? (
                          item.name === 'green' ? "bg-emerald-500" : (item.name === 'yellow' || item.name === 'gold' || item.name === 'purple') ? "bg-fuchsia-500" : item.name === 'red' ? "bg-red-500" : "bg-muted"
                        ) : undefined}
                      />
                    );
                  })}
                </Reorder.Group>
              </div>
            ))}
          </div>

          {/* Pay Scale Overview Table (Military Style Chart) */}
          <div className="space-y-2 pt-3 border-t border-border">
            <div className="flex items-center space-x-2 px-1">
              <div className="w-0.5 h-3 bg-accent rounded-full" />
              <h3 className="text-xs font-serif font-bold tracking-tight text-fg uppercase tracking-widest">PAY CHART</h3>
            </div>
            <div className="bg-surface/30 rounded-xl border border-border overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border text-[8px] font-bold uppercase tracking-[0.2em] text-muted/60 bg-surface/50">
                    <th className="px-[10px] py-2 sticky left-0 bg-surface/90 backdrop-blur-sm z-10 border-r border-border/50 whitespace-nowrap">Rank</th>
                    <th className="px-[10px] py-2 text-center border-r border-border/50 whitespace-nowrap">Base (+0%)</th>
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(year => (
                      <th key={year} className="px-[10px] py-2 text-center whitespace-nowrap">
                        {year === 0 ? 'Entry' : `${year} Yrs`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {(() => {
                    let cumulativeMultiplier = 1.0;
                    return Array.isArray(localConfig.factors.rank) && localConfig.factors.rank.map((rankItem) => {
                      cumulativeMultiplier *= (1 + (rankItem.multiplier / 100));
                      const baseAnnual = localConfig.baseRate * cumulativeMultiplier;
                      return (
                        <tr key={rankItem.id} className="hover:bg-accent/[0.02] transition-colors group">
                          <td className="px-[10px] py-2 text-[8px] font-serif font-bold text-fg uppercase tracking-wider sticky left-0 bg-surface/90 backdrop-blur-sm z-10 border-r border-border/50 group-hover:bg-accent/[0.02] whitespace-nowrap">
                            {rankItem.name}
                          </td>
                          <td className="px-[10px] py-2 text-[8px] font-mono text-accent text-center border-r border-border/50 bg-accent/[0.01]">
                            +{rankItem.multiplier}%
                            <div className="text-[6px] text-muted opacity-50">Total: x{cumulativeMultiplier.toFixed(2)}</div>
                          </td>
                          {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(year => {
                            const expMultiplier = 1 + (year * (localConfig.factors.experience / 100));
                            const colaMultiplier = 1 + (localConfig.factors.cola / 100);
                            const annual = baseAnnual * expMultiplier * colaMultiplier;
                            return (
                              <td key={year} className="px-[10px] py-2 text-[8px] font-serif font-bold text-fg text-center whitespace-nowrap">
                                {formatCurrency(annual)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <p className="text-[8px] text-muted italic px-1">
              * Chart assumes base position, standard education, green performance, and {localConfig.factors.cola}% COLA. Experience multiplier: {localConfig.factors.experience.toFixed(1)}% per year.
            </p>
          </div>
        </div>
      </div>
    </div>

  );
};

export default PayrollConfig;
