import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
type Density = 'compact' | 'comfortable';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  density: Density;
  setDensity: (value: Density) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem('reduce-motion') === 'true');
  const [density, setDensity] = useState<Density>(() => localStorage.getItem('layout-density') === 'comfortable' ? 'comfortable' : 'compact');

  useEffect(() => {
    document.documentElement.dataset.motion = reducedMotion ? 'reduced' : 'standard';
    localStorage.setItem('reduce-motion', String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
    localStorage.setItem('layout-density', density);
  }, [density]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, reducedMotion, setReducedMotion, density, setDensity }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
