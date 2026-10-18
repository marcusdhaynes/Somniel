import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg text-fg selection:bg-accent/30 selection:text-accent">
      <Navbar />
      <main className="">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pt-8 lg:pt-12"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <footer className="bg-bg border-t border-white/5 py-8 mt-0 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 text-xs">
            <div className="md:col-span-5">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-serif text-bg italic text-xl shadow-lg shadow-accent/20">S</div>
                <span className="text-2xl font-bold tracking-[-0.05em] text-fg uppercase">SOMNIEL</span>
              </div>
              <p className="text-muted/60 max-w-md leading-relaxed text-xs font-medium">
                A premier enterprise holdings firm dedicated to architecting the future through a diverse portfolio of market-leading subsidiaries and forward-thinking experimental initiatives.
              </p>
              <div className="mt-6 flex items-center space-x-6">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted/40 hover:text-accent transition-colors"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-7 grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-muted/60 font-medium mb-3 uppercase text-[10px] tracking-[0.2em] underline underline-offset-4 decoration-white/10">Navigation</h4>
                <ul className="space-y-2 text-[10px] font-medium tracking-widest text-muted/60 uppercase">
                  <li><Link to="/subsidiaries" className="hover:text-accent transition-colors">Subsidiaries</Link></li>
                  <li><Link to="/founders" className="hover:text-accent transition-colors">Founders</Link></li>
                  <li><Link to="/projects" className="hover:text-accent transition-colors">Projects</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-muted/60 font-medium mb-3 uppercase text-[10px] tracking-[0.2em] underline underline-offset-4 decoration-white/10">Information</h4>
                <ul className="space-y-2 text-[10px] font-medium tracking-widest text-muted/60 uppercase">
                  <li><a href="#" className="hover:text-accent transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-accent transition-colors">Cookies</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-muted/60 font-medium mb-3 uppercase text-[10px] tracking-[0.2em] underline underline-offset-4 decoration-white/10">Contact</h4>
                <p className="text-[10px] font-medium tracking-widest text-muted/60 uppercase leading-loose">
                  1200 Innovation Way<br />
                  Suite 400<br />
                  San Francisco, CA
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-muted/40 uppercase tracking-[0.4em] font-medium">
            <p>© 2026 Somniel Holdings LLC. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-8">
              <span>Global Operations</span>
              <div className="w-1 h-1 bg-accent rounded-full" />
              <span>Est. 2026</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
