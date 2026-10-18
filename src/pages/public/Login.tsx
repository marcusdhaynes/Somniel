import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -top-8 inset-x-0 bottom-0 bg-bg z-0" />
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="p-16 md:p-24 rounded-[4rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden group">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/10 to-transparent opacity-50" />
          
          <div className="text-center mb-16">
            <motion.div 
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="w-20 h-20 bg-accent/10 rounded-[2rem] flex items-center justify-center mx-auto mb-12 group-hover:scale-110 transition-all duration-700 shadow-2xl shadow-accent/10 border border-accent/20"
            >
              <ShieldCheck className="w-10 h-10 text-accent" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Sparkles className="w-4 h-4 text-accent/60" />
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent/60">Secure Gateway</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-[-0.04em] text-fg mb-8 italic leading-tight">
                Enterprise <span className="text-accent not-italic font-light">Access</span>
              </h1>
              <p className="text-lg text-muted/60 max-w-sm mx-auto leading-relaxed font-medium">
                Welcome to the Somniel Holdings portal. Please authenticate to manage your global portfolio.
              </p>
            </motion.div>
          </div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            onClick={handleLogin}
            className="w-full group flex items-center justify-between bg-fg hover:bg-fg/90 text-bg px-10 py-6 rounded-[2rem] font-bold transition-all duration-500 transform hover:scale-[1.02] active:scale-95 text-sm shadow-2xl shadow-fg/20"
          >
            <div className="flex items-center space-x-5">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              </div>
              <span className="tracking-[0.1em] uppercase text-xs">Continue with Google</span>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
          </motion.button>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-16 pt-10 border-t border-white/5 text-center"
          >
            <p className="text-[10px] text-muted/30 uppercase tracking-[0.5em] font-bold">
              Authorized Personnel Only
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="w-1 h-1 bg-accent/20 rounded-full" />
              <div className="w-1 h-1 bg-accent/20 rounded-full" />
              <div className="w-1 h-1 bg-accent/20 rounded-full" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
