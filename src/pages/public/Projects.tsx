import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../../context/CMSContext';
import { Zap, ArrowRight, Sparkles } from 'lucide-react';

const Projects: React.FC = () => {
  const { content } = useCMS();

  if (!content) return null;

  return (
    <div className="relative overflow-hidden">
      <header className="relative min-h-[2vh] flex items-center justify-center px-4 pt-7 pb-0.5 overflow-hidden">
        <div className="absolute -top-8 inset-x-0 bottom-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-accent/5 via-transparent to-bg" />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px]" 
          />
        </div>

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block px-3 py-1 mb-4 text-[7px] font-bold tracking-[0.4em] uppercase bg-accent/10 text-accent border border-accent/20 rounded-full backdrop-blur-md shadow-xl shadow-accent/10">
              Innovation Lab
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-[-0.06em] text-fg mb-6 leading-[0.9] max-w-[90vw] mx-auto uppercase">
              Future <span className="text-accent italic font-light lowercase font-serif">Initiatives</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="text-sm md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-light tracking-tight"
            >
              Experimental ventures and emerging technologies architected to redefine the boundaries of modern enterprise.
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="py-1 px-6 lg:px-12 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex flex-col"
            >
              <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/5 hover:border-accent/40 transition-all duration-700 p-6 backdrop-blur-2xl group-hover:shadow-2xl group-hover:shadow-accent/5 group-hover:-translate-y-1 h-full">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/5 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="flex items-start space-x-6 relative z-10 h-full">
                  <div className="p-3 rounded-xl bg-white/5 text-accent group-hover:bg-accent group-hover:text-bg transition-all duration-700 shadow-sm group-hover:shadow-2xl group-hover:shadow-accent/30 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 flex flex-col min-h-[4rem]">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-serif font-bold text-fg tracking-tight group-hover:text-accent transition-colors duration-500 italic leading-tight">
                        {project.name}
                      </h3>
                      <span className="px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.2em] bg-white/5 text-accent border border-white/10 rounded-full">
                        {project.status}
                      </span>
                    </div>
                    
                    <p className="text-muted/60 text-xs leading-relaxed mb-4 font-medium line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="mt-auto flex justify-end">
                      <button className="inline-flex items-center space-x-2 text-fg font-bold hover:text-accent transition-all duration-500 text-[8px] uppercase tracking-[0.3em] group/btn">
                        <span className="relative">
                          Explore Project
                          <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-500 group-hover/btn:w-full" />
                        </span>
                        <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform duration-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
