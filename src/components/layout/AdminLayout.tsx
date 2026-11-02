import React, { useLayoutEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

import { HeaderActions } from './HeaderActions';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // Prevent route changes from inheriting a scrolled position on a
    // differently sized page. Runs before paint with no scroll animation.
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('employees')) return 'Employees';
    if (path.includes('contractor-projects')) return 'Projects';
    if (path.includes('contractor-projects')) return 'Projects';
    if (path.includes('payroll')) return 'Payroll';
    if (path.includes('cms')) return 'Content';
    if (path.includes('roadmap')) return 'Roadmap';
    if (path.includes('payscale')) return 'Pay Scale';
    if (path.includes('settings')) return 'Settings';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-accent overflow-x-hidden">
      <Sidebar type="admin" />
      
      <main className="min-h-screen flex flex-col relative z-10" style={{ paddingLeft: 'var(--sidebar-width, 8.5rem)' }}>
        {/* Top Header Bar */}
        <header 
          className="h-6 lg:h-[2.4rem] border-b border-border bg-subtle/50 backdrop-blur-md absolute top-0 left-0 right-0 z-30"
          style={{ paddingLeft: 'var(--sidebar-width, 8.5rem)' }}
        >
          <div className="condensed-container flex items-center justify-between h-full">
            <h2 className="font-serif font-bold text-xs text-fg leading-none">{getPageTitle()}</h2>
            
            <HeaderActions />
          </div>
        </header>

        <div ref={contentRef} className="flex-1 px-1.5 pt-8 lg:pt-12 pb-1.5 overflow-y-auto min-h-0">
          <div className="condensed-container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
