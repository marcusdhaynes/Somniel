import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, LogOut, Moon, Sun, Monitor, Zap, LayoutGrid, RotateCcw, ShieldCheck, Settings2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SettingsOption: React.FC<{
  label: string; description: string; active: boolean; onClick: () => void;
}> = ({ label, description, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex w-full items-center justify-between gap-4 rounded-xl border p-4 text-left transition-colors ${active ? 'border-accent bg-accent/10' : 'border-border bg-bg/40 hover:border-accent/40'}`}
  >
    <span>
      <span className="block text-sm font-semibold text-fg">{label}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted">{description}</span>
    </span>
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${active ? 'border-accent bg-accent text-bg' : 'border-border text-transparent'}`}>
      <Check className="h-4 w-4" aria-hidden="true" />
    </span>
  </button>
);

const AdminSettings: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, setTheme, reducedMotion, setReducedMotion, density, setDensity } = useTheme();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setSigningOut(true);
    setError('');
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch {
      setError('Unable to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  const reset = () => {
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setReducedMotion(false);
    setDensity('compact');
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6 pb-12 pt-5">
      <header>
        <div className="flex items-center gap-2 text-accent"><Settings2 className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-[0.3em]">Preferences</span></div>
        <h1 className="mt-2 font-serif text-2xl font-bold text-fg">Settings</h1>
        <p className="mt-2 text-xs leading-relaxed text-muted">Customize your workspace. Changes apply immediately and remain on this device.</p>
      </header>

      <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg"><Monitor className="h-4 w-4 text-accent" /> Appearance</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsOption label="Dark theme" description="Low-light interface." active={theme === 'dark'} onClick={() => setTheme('dark')} />
          <SettingsOption label="Light theme" description="Bright, high-contrast interface." active={theme === 'light'} onClick={() => setTheme('light')} />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg"><Zap className="h-4 w-4 text-accent" /> Motion & responsiveness</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsOption label="Reduced motion" description="Minimize decorative animations and transitions." active={reducedMotion} onClick={() => setReducedMotion(true)} />
          <SettingsOption label="Standard motion" description="Allow the regular interface animations." active={!reducedMotion} onClick={() => setReducedMotion(false)} />
        </div>
        <p className="text-xs text-muted">Reduced motion can make navigation feel more immediate and helps on slower devices.</p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg"><LayoutGrid className="h-4 w-4 text-accent" /> Layout</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <SettingsOption label="Compact" description="The original condensed console layout." active={density === 'compact'} onClick={() => setDensity('compact')} />
          <SettingsOption label="Comfortable" description="More spacing for workspace content." active={density === 'comfortable'} onClick={() => setDensity('comfortable')} />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-surface/70 p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg"><ShieldCheck className="h-4 w-4 text-accent" /> Account & session</h2>
        <div className="rounded-xl border border-border bg-bg/50 p-4">
          <p className="truncate text-sm font-semibold text-fg">{profile?.displayName || user?.displayName || 'Signed-in account'}</p>
          <p className="mt-1 break-all text-xs text-muted">{user?.email || 'No email available'}</p>
          <p className="mt-2 text-xs text-accent">{isAdmin ? 'Administrator' : 'Member'}</p>
        </div>
        <button type="button" onClick={handleSignOut} disabled={signingOut} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-fg hover:border-accent hover:text-accent disabled:opacity-50">
          <LogOut className="h-4 w-4" /> {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
        {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
      </div>

      <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-muted hover:text-fg">
        <RotateCcw className="h-4 w-4" /> Reset appearance preferences
      </button>
    </section>
  );
};

export default AdminSettings;
