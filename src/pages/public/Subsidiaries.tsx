import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../../context/CMSContext';
import { ExternalLink, ArrowRight } from 'lucide-react';

const Subsidiaries: React.FC = () => {
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
              Our Ecosystem
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-[-0.06em] text-fg mb-6 leading-[0.9] max-w-[90vw] mx-auto uppercase">
              Subsidiary <span className="text-accent italic font-light lowercase font-serif">Businesses</span>
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="text-sm md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-light tracking-tight"
            >
              A diverse ecosystem of market-leading companies operating across multiple sectors.
            </motion.p>
          </motion.div>
        </div>
      </header>

      <div className="py-1 px-6 lg:px-12 max-w-[1600px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.subsidiaries.map((sub, i) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden rounded-3xl bg-surface/20 border border-white/5 hover:border-accent/40 transition-all p-6 backdrop-blur-2xl shadow-2xl shadow-black/20"
            >
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-bg rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-accent/30 transition-all duration-700 shadow-2xl group-hover:shadow-accent/10 shrink-0">
                  <img src={sub.logo} alt={sub.name} className="w-full h-full object-cover transform group-hover:scale-125 transition-transform duration-1000" />
                </div>
                
                <div className="flex-1 flex flex-col min-h-[4rem]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-serif font-bold text-fg tracking-tight group-hover:text-accent transition-colors italic leading-none">{sub.name}</h3>
                    <ExternalLink className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-x-2 group-hover:translate-x-0" />
                  </div>
                  
                  <p className="text-muted text-xs leading-relaxed mb-4 font-light opacity-60 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
                    {sub.description}
                  </p>
                  
                  <div className="mt-auto flex justify-end">
                    <a
                      href={sub.website}
                      className="inline-flex items-center space-x-2 text-accent font-bold hover:text-accent/80 transition-all text-[8px] uppercase tracking-[0.3em] group/link"
                    >
                      <span className="border-b border-accent/20 group-hover/link:border-accent transition-all pb-0.5">Visit Website</span>
                      <ArrowRight className="w-3 h-3 transform group-hover/link:translate-x-1 transition-transform duration-500" />
                    </a>
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

export default Subsidiaries;
