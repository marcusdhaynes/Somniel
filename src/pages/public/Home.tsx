import React from 'react';
import { motion } from 'framer-motion';
import { useCMS } from '../../context/CMSContext';
import { ArrowRight, Globe, Shield, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { content } = useCMS();

  if (!content) return null;

  return (
    <div className="relative overflow-hidden">
      <section className="relative min-h-[2vh] flex items-center justify-center px-4 pt-7 pb-0.5 overflow-hidden">
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
              The Architecture of Tomorrow
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-[-0.06em] text-fg mb-6 leading-[0.9] max-w-[90vw] mx-auto uppercase">
              {content.hero.title.split(' ').map((word, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0, y: 50, rotateX: -30 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: i * 0.05, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block mr-[0.15em] last:mr-0"
                >
                  {word === 'Future' ? <span className="text-accent italic font-light lowercase font-serif">{word}</span> : word}
                </motion.span>
              ))}
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="text-sm md:text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed font-light tracking-tight"
            >
              {content.hero.subtitle}
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link
                to="/subsidiaries"
                className="group relative px-6 py-2.5 overflow-hidden rounded-full bg-accent text-bg font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-accent/30"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative flex items-center space-x-2 text-xs">
                  <span className="tracking-tight uppercase">{content.hero.cta}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link
                to="/founders"
                className="group px-6 py-2.5 rounded-full bg-surface/20 backdrop-blur-2xl text-fg font-bold border border-white/10 transition-all hover:bg-surface/40 hover:border-white/20 text-xs tracking-tight"
              >
                <span className="uppercase tracking-widest">Meet the Founders</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 bg-bg relative">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            {[
              { icon: Globe, title: "Global Reach", desc: "Operating across multiple continents." },
              { icon: Shield, title: "Enterprise Security", desc: "Robust governance and risk management." },
              { icon: Zap, title: "Rapid Innovation", desc: "Accelerating growth through R&D." },
              { icon: TrendingUp, title: "Strategic Growth", desc: "Expanding through targeted acquisitions." }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="p-3 md:p-4 rounded-[1rem] md:rounded-[1.5rem] bg-surface/20 border border-white/5 hover:border-accent/40 transition-all group relative overflow-hidden backdrop-blur-xl shadow-lg shadow-black/5"
              >
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/5 rounded-full blur-xl transition-transform group-hover:scale-150 duration-1000" />
                <div className="w-6 h-6 md:w-8 md:h-8 bg-accent/10 rounded-lg flex items-center justify-center mb-2 md:mb-3 group-hover:rotate-[15deg] transition-transform relative z-10 duration-700 shadow-md shadow-accent/5">
                  <feature.icon className="w-3 h-3 md:w-4 md:h-4 text-accent" />
                </div>
                <h3 className="text-xs md:text-base font-bold text-fg mb-1 md:mb-1.5 relative z-10 tracking-tight font-serif italic">{feature.title}</h3>
                <p className="text-[9px] md:text-[10px] text-muted leading-relaxed relative z-10 font-light opacity-60 group-hover:opacity-100 transition-opacity duration-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-6 border-y border-white/5 bg-surface/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--fg) 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="max-w-[1400px] mx-auto px-4 lg:px-12 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center">
            {[
              { label: "Subsidiaries", value: "12+" },
              { label: "Global Employees", value: "500+" },
              { label: "Annual Revenue", value: "$250M+" },
              { label: "Active Projects", value: "24+" }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.6 }}
                className="space-y-1 md:space-y-2"
              >
                <p className="text-2xl md:text-4xl font-serif font-bold text-fg tracking-[-0.06em] leading-none">{stat.value}</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-[1px] bg-accent/40" />
                  <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-[0.3em] text-accent">{stat.label}</p>
                  <div className="w-4 h-[1px] bg-accent/40" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
