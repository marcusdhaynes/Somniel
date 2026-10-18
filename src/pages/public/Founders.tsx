import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../../context/CMSContext';
import { Linkedin, Twitter, Mail } from 'lucide-react';

const Founders: React.FC = () => {
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
              The Visionaries
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-[-0.06em] text-fg mb-6 leading-[0.9] max-w-[90vw] mx-auto uppercase">
              Meet the <span className="text-accent italic font-light lowercase font-serif">Founders</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="text-sm md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-light tracking-tight"
            >
              Visionary leaders committed to building the future of enterprise architecture.
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="py-1 px-6 lg:px-12 max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.founders.map((founder, i) => (
            <motion.div
              key={founder.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl bg-surface/20 border border-white/5 hover:border-accent/40 transition-all p-6 backdrop-blur-2xl shadow-2xl shadow-black/20"
            >
              <div className="flex items-start space-x-6">
                <div className="w-24 h-32 rounded-2xl bg-bg overflow-hidden border border-white/10 group-hover:border-accent/30 transition-all duration-700 shrink-0 relative shadow-2xl group-hover:shadow-accent/10">
                  <img src={founder.photo} alt={founder.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110" />
                </div>
                
                <div className="flex-1 flex flex-col min-h-[8rem]">
                  <div className="mb-2">
                    <h3 className="text-xl font-serif font-bold text-fg tracking-tight group-hover:text-accent transition-colors italic leading-none">{founder.name}</h3>
                    <p className="text-accent font-bold uppercase text-[8px] tracking-[0.4em] mt-1 opacity-80">{founder.role}</p>
                  </div>
                  
                  <p className="text-muted text-xs leading-relaxed mb-4 font-light opacity-60 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
                    {founder.bio}
                  </p>
                  
                  <div className="mt-auto flex justify-end space-x-4">
                    <a href="#" className="text-muted hover:text-accent transition-all transform hover:scale-110"><Linkedin className="w-4 h-4" /></a>
                    <a href="#" className="text-muted hover:text-accent transition-all transform hover:scale-110"><Twitter className="w-4 h-4" /></a>
                    <a href="#" className="text-muted hover:text-accent transition-all transform hover:scale-110"><Mail className="w-4 h-4" /></a>
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

export default Founders;
