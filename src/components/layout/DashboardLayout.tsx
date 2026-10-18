import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

import { HeaderActions } from './HeaderActions';

const DashboardLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('files')) return 'My Files';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-accent overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <Sidebar type="dashboard" />
      
      <main className="min-h-screen flex flex-col relative z-10 transition-all duration-300 ease-in-out" style={{ paddingLeft: 'var(--sidebar-width, 6.5rem)' }}>
        {/* Top Header Bar */}
        <header 
          className="h-6 lg:h-[2.4rem] border-b border-border bg-subtle/50 backdrop-blur-md absolute top-0 left-0 right-0 z-30 transition-all duration-300 ease-in-out"
          style={{ paddingLeft: 'var(--sidebar-width, 6.5rem)' }}
        >
          <div className="condensed-container flex items-center justify-between h-full">
            <h2 className="font-serif font-bold text-xs text-fg leading-none">{getPageTitle()}</h2>
            
            <HeaderActions />
          </div>
        </header>

        <div className="flex-1 px-1.5 pt-8 lg:pt-12 pb-1.5 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="condensed-container"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
