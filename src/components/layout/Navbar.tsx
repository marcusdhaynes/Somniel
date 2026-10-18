import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogIn, LogOut, LayoutDashboard, ShieldCheck, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';

import { HeaderActions } from './HeaderActions';

export const Navbar: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Subsidiaries', path: '/subsidiaries' },
    { name: 'Founders', path: '/founders' },
    { name: 'Projects', path: '/projects' },
  ];

  const getPageTitle = () => {
    const path = location.pathname.toLowerCase();
    if (path === '/') return '';
    if (path.includes('subsidiaries')) return 'Subsidiaries';
    if (path.includes('founders')) return 'Founders';
    if (path.includes('projects')) return 'Projects';
    if (path.includes('login')) return 'Login';
    return '';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg/60 backdrop-blur-xl border-b border-white/5 h-6 lg:h-[2.4rem]">
      <div className="max-w-5xl mx-auto px-1.5 lg:px-3 h-full relative">
        <div className="flex justify-between h-full items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-1.5 lg:space-x-2.5 group">
              <motion.div 
                whileHover={{ rotate: 90 }}
                className="w-4 h-4 lg:w-[1.6rem] lg:h-[1.6rem] bg-accent rounded-full flex items-center justify-center font-serif italic font-bold text-bg group-hover:scale-110 transition-transform text-[8px] lg:text-[13px] shadow-lg shadow-accent/20"
              >
                S
              </motion.div>
              <span className="text-xs lg:text-[1rem] font-bold tracking-[-0.05em] text-fg uppercase">Somniel</span>
            </Link>
          </div>

          {/* Centered Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <h2 className="font-serif font-bold text-[8px] lg:text-xs text-fg leading-none uppercase tracking-tight">{getPageTitle()}</h2>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-[6px] lg:text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-accent relative py-0.25",
                  location.pathname === item.path ? "text-accent" : "text-muted/60"
                )}
              >
                {item.name}
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 lg:-bottom-1 left-0 right-0 h-[1.5px] lg:h-[2px] bg-accent rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            ))}
            
            <div className="h-3 lg:h-5 w-px bg-white/10 mx-0.5 lg:mx-1.5" />

            <HeaderActions />
          </div>

          {/* Mobile Menu Button & Actions */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-1 text-muted/90 hover:text-accent transition-colors rounded-full hover:bg-white/10 border border-white/5 shadow-sm"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
            </button>

            {user && (
              <>
                <Link to="/dashboard" className="p-1 text-muted/90 hover:text-accent transition-colors rounded-full hover:bg-white/10 border border-white/5 shadow-sm" title="Dashboard">
                  <LayoutDashboard className="w-2.5 h-2.5" />
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="p-1 text-muted/90 hover:text-accent transition-colors rounded-full hover:bg-white/10 border border-white/5 shadow-sm" title="Admin Panel">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </Link>
                )}
              </>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-muted hover:text-accent p-0.75 transition-colors"
            >
              {isOpen ? <X className="w-2.5 h-2.5" /> : <Menu className="w-2.5 h-2.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-bg/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden absolute top-16 left-0 right-0"
          >
            <div className="px-3 py-5 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-xl text-[6px] font-bold uppercase tracking-[0.3em] transition-all",
                    location.pathname === item.path ? "bg-accent/10 text-accent border-l-2 border-accent" : "text-muted hover:bg-white/5 hover:text-fg"
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5">
                {!user ? (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center bg-accent text-bg px-3 py-2 rounded-xl font-bold text-[6px] uppercase tracking-[0.3em] shadow-xl shadow-accent/20"
                  >
                    Login
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      signOut();
                      setIsOpen(false);
                    }}
                    className="block w-full text-center bg-white/5 text-fg px-3 py-2 rounded-xl font-bold text-[6px] uppercase tracking-[0.3em] border border-white/10"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
