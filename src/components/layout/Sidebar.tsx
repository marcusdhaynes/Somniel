import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  Map, 
  ShieldCheck,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Database,
  Briefcase,
  Settings2,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  type: 'dashboard' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const expandedWidth = isMobile ? '4.68rem' : '8.5rem';
  const collapsedWidth = isMobile ? '2.3625rem' : '2.625rem';
  const currentWidth = isCollapsed ? collapsedWidth : expandedWidth;

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    document.documentElement.style.setProperty('--sidebar-width', currentWidth);
    window.dispatchEvent(new Event('sidebar-toggle'));
  }, [isCollapsed, currentWidth]);

  const dashboardItems = [
    { name: 'My Files', path: '/dashboard/files', icon: Database },
  ];

  const adminItems = [
    { name: 'Employees', path: '/admin/employees', icon: Users },
    { name: 'Content', path: '/admin/cms', icon: Settings2 },
    { name: 'Payroll', path: '/admin/payroll', icon: DollarSign },
    { name: 'Pay Scale', path: '/admin/payscale', icon: Briefcase },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const items = type === 'dashboard' ? dashboardItems : adminItems;

  const sidebarTransition = {
    type: "spring",
    stiffness: 400,
    damping: 40,
    mass: 1
  } as const;

  return (
    <>
      {/* Toggle Button - Positioned relative to the sidebar width variable */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "fixed bg-surface border border-border rounded-full flex items-center justify-center text-muted/80 hover:text-accent hover:border-accent/60 transition-all z-50 shadow-xl group/toggle",
          isMobile ? "top-[3.25rem] w-4 h-4" : "top-[2.75rem] w-4 h-4"
        )}
        style={{ 
          left: `calc(var(--sidebar-width, ${currentWidth}) - ${isMobile ? '0.5rem' : '0.5rem'})`,
          transition: 'left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className={cn("group-hover/toggle:scale-110 transition-transform", isMobile ? "w-2.5 h-2.5" : "w-2.5 h-2.5")} />
        ) : (
          <ChevronLeft className={cn("group-hover/toggle:scale-110 transition-transform", isMobile ? "w-2.5 h-2.5" : "w-2.5 h-2.5")} />
        )}
      </button>

      <motion.div 
        initial={false}
        animate={{ width: currentWidth }}
        transition={sidebarTransition}
        className="h-screen fixed left-0 top-0 bg-subtle/80 backdrop-blur-3xl border-r border-border flex flex-col z-40 overflow-hidden"
      >
        {/* Header */}
        <div className="px-2 flex items-center justify-start overflow-hidden h-16">
          <Link to="/" className={cn(
            "flex items-center min-w-max group/logo transition-all duration-300",
            isMobile ? "ml-0 gap-0" : "ml-1.5 gap-1"
          )}>
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-[1.2rem] h-[1.2rem] bg-accent rounded-full flex items-center justify-center font-serif italic font-bold text-bg group-hover:scale-110 transition-transform text-[8px] shadow-lg shadow-accent/20 shrink-0"
            >
              S
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col items-start overflow-hidden"
                >
                  <span className="font-serif font-bold text-fg text-[10px] leading-none tracking-tight italic group-hover/logo:text-accent transition-colors whitespace-nowrap">
                    Admin
                  </span>
                  <span className={cn(
                    "text-fg/70 font-bold uppercase tracking-[0.3em] mt-0.5 whitespace-nowrap",
                    isMobile ? "text-[4.2px]" : "text-[6px]"
                  )}>Console</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-2 py-1 overflow-y-auto custom-scrollbar overflow-x-hidden flex flex-col gap-1">
          <div className="h-4 flex items-center justify-start px-3 mb-1">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="w-full text-center"
                >
                  <span className={cn(
                    "font-bold uppercase tracking-[0.4em] text-fg/70 whitespace-nowrap",
                    isMobile ? "text-[4.2px]" : "text-[6px]"
                  )}>Management</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {items.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex transition-colors duration-200 group relative overflow-hidden rounded-lg font-bold flex-row items-center",
                  isMobile ? "h-5 px-1.5 text-[5px]" : "h-10 px-3 text-[10px]",
                  isActive 
                    ? "bg-accent/10 text-accent shadow-lg shadow-accent/5" 
                    : "text-muted/60 hover:bg-fg/5 hover:text-fg"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className={cn(
                      "absolute bg-accent rounded-full left-0 top-1/2 -translate-y-1/2 w-0.5",
                      isMobile ? "h-1.5" : "h-3"
                    )}
                  />
                )}
                <item.icon className={cn(
                  "transition-colors duration-200 shrink-0", 
                  isActive ? "text-accent" : "text-muted/40 group-hover:text-fg",
                  isMobile ? "w-3 h-3" : "w-4 h-4"
                )} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        "tracking-tighter uppercase whitespace-nowrap overflow-hidden block flex-1 text-left",
                        isMobile ? "ml-1.5" : "ml-3"
                      )}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-border bg-fg/[0.02] flex flex-col gap-1">
          {!user ? (
            <Link
              to="/login"
              className={cn(
                "flex items-center rounded-lg font-bold text-muted/60 hover:bg-fg/5 hover:text-fg transition-colors duration-200 group uppercase tracking-tight px-1 w-full",
                isMobile ? "text-[6.5px] py-0.75 h-3.5" : "text-[13px] py-1.5 h-7"
              )}
            >
              <LogIn className={cn("group-hover:text-accent transition-colors duration-200 shrink-0", isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5")} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn("whitespace-nowrap overflow-hidden block", isMobile ? "ml-0.5" : "ml-1")}
                  >
                    Sign In
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          ) : (
            <button
              onClick={() => signOut()}
              className={cn(
                "flex items-center w-full rounded-lg font-bold text-muted/60 hover:bg-red-500/10 hover:text-red-500 transition-colors duration-200 group uppercase tracking-tight px-1",
                isMobile ? "text-[6.5px] py-0.75 h-3.5" : "text-[13px] py-1.5 h-7"
              )}
            >
              <LogOut className={cn("group-hover:text-red-500 transition-colors duration-200 shrink-0", isMobile ? "w-3.5 h-3.5" : "w-3.5 h-3.5")} />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={cn("whitespace-nowrap overflow-hidden block", isMobile ? "ml-0.5" : "ml-1")}
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};
