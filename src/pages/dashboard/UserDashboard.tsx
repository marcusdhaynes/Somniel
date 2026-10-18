import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCMS } from '../../context/CMSContext';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Files, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Calendar,
  ArrowRight,
  Zap,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const UserDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { content } = useCMS();

  if (!profile || !content) return null;

  return (
    <section className="space-y-4 pt-6 pb-6">
      {/* Welcome Header */}
      <header className="relative py-1.5 px-2 rounded-lg bg-surface/30 border border-white/5 overflow-hidden group">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-accent/10 rounded-full blur-[30px] group-hover:bg-accent/20 transition-all duration-1000" />
          <div className="absolute bottom-0 left-0 w-[100px] h-[100px] bg-accent/5 rounded-full blur-[20px]" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 mb-1"
            >
              <div className="w-1 h-2 bg-accent rounded-full" />
              <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-accent">Personal Portal</p>
            </motion.div>
            <h1 className="text-xs md:text-sm font-serif font-bold tracking-[-0.04em] text-fg mb-0.5 leading-none">
              Welcome, <span className="text-accent italic font-light lowercase font-serif">{profile.displayName.split(' ')[0]}</span>
            </h1>
            <p className="text-muted flex items-center space-x-2 text-[7px] font-bold uppercase tracking-[0.2em] opacity-60">
              <Calendar className="w-2.5 h-2.5 text-accent" />
              <span>{format(new Date(), 'EEEE, MMMM do, yyyy')}</span>
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 rounded-full bg-bg/40 backdrop-blur-2xl border border-white/10 flex items-center space-x-1.5 shadow-xl">
              <div className="relative">
                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-1 h-1 rounded-full bg-emerald-500 animate-ping opacity-40" />
              </div>
              <span className="text-[7px] font-bold uppercase tracking-[0.2em] text-fg/80">System Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "My Files", value: "24", icon: Files, color: "text-accent", bg: "bg-accent/10" },
          { label: "Active Projects", value: content.projects.length.toString(), icon: Zap, color: "text-accent", bg: "bg-accent/10" },
          { label: "Benefits Active", value: content.benefits.length.toString(), icon: Gift, color: "text-accent", bg: "bg-accent/10" }
        ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-2 rounded-xl bg-surface/20 border border-white/5 hover:border-accent/40 transition-all group relative overflow-hidden backdrop-blur-xl shadow-xl hover:shadow-accent/5"
            >
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center space-x-2 relative z-10">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-lg shrink-0", stat.bg)}>
                  <stat.icon className={cn("w-2.5 h-2.5", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-serif font-bold text-fg tracking-tight leading-none">{stat.value}</p>
                  <p className="text-[6px] font-bold uppercase tracking-[0.2em] text-muted/60 group-hover:text-accent transition-colors mt-0.5">{stat.label}</p>
                </div>
              </div>
            </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3">
              <div className="w-1 h-4 bg-accent rounded-full" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-fg">Recent Activity</h2>
            </div>
            <button className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent hover:opacity-80 transition-all flex items-center space-x-2 group">
              <span>View Full History</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
          
          <div className="space-y-1.5">
            {[
              { title: "Project X Updated", time: "2 hours ago", type: "update", icon: TrendingUp },
              { title: "New Benefit Added: Annual Stipend", time: "5 hours ago", type: "benefit", icon: Gift },
              { title: "File 'Q4_Report.pdf' uploaded", time: "Yesterday", type: "file", icon: Files }
            ].map((activity) => (
              <motion.div 
                key={activity.title} 
                whileHover={{ x: 5 }}
                className="p-2 rounded-lg bg-surface/10 border border-white/5 flex items-center justify-between group hover:bg-surface/30 hover:border-accent/20 transition-all cursor-pointer backdrop-blur-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-bg border border-white/5 flex items-center justify-center group-hover:border-accent/30 transition-all shadow-inner">
                    <activity.icon className="w-3 h-3 text-muted group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-serif font-bold text-fg group-hover:text-accent transition-colors italic">{activity.title}</p>
                    <p className="text-[6px] text-muted font-bold uppercase tracking-[0.2em] mt-0.5 opacity-60">{activity.time}</p>
                  </div>
                </div>
                <div className="w-6 h-6 rounded-full bg-bg border border-white/5 flex items-center justify-center group-hover:bg-accent group-hover:border-accent transition-all">
                  <ArrowRight className="w-2.5 h-2.5 text-muted group-hover:text-bg transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Universal Benefits */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-1 h-4 bg-accent rounded-full" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-fg">Universal Benefits</h2>
          </div>
          <div className="p-4 rounded-2xl bg-surface/20 border border-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-accent/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
            <ul className="space-y-2 relative z-10">
              {content.benefits.map((benefit, i) => (
                <li key={benefit.id || i} className="flex items-start space-x-2 group/item">
                  <div className="w-3 h-3 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                    <div className="w-1 h-1 rounded-full bg-accent" />
                  </div>
                  <span className="text-fg/80 text-xs font-light leading-relaxed tracking-tight group-hover/item:text-fg transition-colors">{benefit.text}</span>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 group relative px-3 py-2 overflow-hidden rounded-lg bg-accent text-bg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/20">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <span className="relative text-[7px] font-bold uppercase tracking-[0.3em]">View Benefit Details</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;
