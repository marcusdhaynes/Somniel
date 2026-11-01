import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

import { HeaderActions } from './HeaderActions';

const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('files')) return 'My Files';
    return '';
  };

  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-accent overflow-x-hidden">
      <Sidebar type="dashboard" />
      
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

        <div className="flex-1 px-1.5 pt-8 lg:pt-12 pb-1.5 overflow-y-auto min-h-0">
          <div className="condensed-container">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
