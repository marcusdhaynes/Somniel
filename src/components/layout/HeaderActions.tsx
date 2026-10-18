import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LayoutDashboard, ShieldCheck, LogOut, LogIn, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export const HeaderActions: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const buttonClass = "p-1 lg:p-1.5 text-muted/90 hover:text-accent transition-colors rounded-full hover:bg-fg/10 border border-border shadow-sm flex items-center justify-center";
  const iconSize = "w-2.5 h-2.5 lg:w-4 lg:h-4";

  return (
    <div className="flex items-center space-x-1.5 lg:space-x-2.5 relative" ref={menuRef}>
      {/* 1. Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={buttonClass}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className={iconSize} /> : <Moon className={iconSize} />}
      </button>

      {/* 2. Dashboard Link */}
      <Link 
        to={user ? "/dashboard" : "/login"} 
        className={buttonClass} 
        title="Dashboard"
      >
        <LayoutDashboard className={iconSize} />
      </Link>

      {/* 3. Admin Link */}
      <Link 
        to={user && isAdmin ? "/admin" : "/login"} 
        className={cn(buttonClass, (!user || !isAdmin) && "opacity-50")} 
        title="Admin Panel"
        onClick={(e) => {
          if (!user || !isAdmin) {
            if (user && !isAdmin) {
              e.preventDefault();
              // Maybe show a toast or just do nothing if they are logged in but not admin
            }
          }
        }}
      >
        <ShieldCheck className={iconSize} />
      </Link>

      {/* 4. Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(buttonClass, isMenuOpen && "bg-fg/10 text-accent")}
        title="Account Menu"
      >
        {isMenuOpen ? <X className={iconSize} /> : <Menu className={iconSize} />}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 lg:mt-3 w-32 lg:w-52 bg-surface/80 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-1.5 lg:p-2 flex flex-col gap-1 lg:gap-1.5">
              {user ? (
                <>
                  <div className="px-2 py-1 lg:px-3 lg:py-1.5 border-b border-border mb-1 lg:mb-1.5">
                    <p className="text-[6px] lg:text-[10px] font-bold text-muted uppercase tracking-widest">User</p>
                    <p className="text-[8px] lg:text-[13px] font-medium text-fg truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors text-[8px] lg:text-[13px] font-bold uppercase tracking-wider"
                  >
                    <LogOut className="w-2.5 h-2.5 lg:w-4 lg:h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 w-full px-2 py-1.5 lg:px-3 lg:py-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors text-[8px] lg:text-[13px] font-bold uppercase tracking-wider"
                >
                  <LogIn className="w-2.5 h-2.5 lg:w-4 lg:h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
