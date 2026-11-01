import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider } from './context/CMSContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const AdminWorkspace = lazy(() => import('./components/layout/AdminWorkspace'));

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Subsidiaries = lazy(() => import('./pages/public/Subsidiaries'));
const Founders = lazy(() => import('./pages/public/Founders'));
const Projects = lazy(() => import('./pages/public/Projects'));
const Login = lazy(() => import('./pages/public/Login'));
const AuthBridge = lazy(() => import('./pages/public/AuthBridge'));

// Dashboard Pages
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const FileExplorer = lazy(() => import('./pages/dashboard/FileExplorer'));

// Admin Pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement'));
const PayrollManagement = lazy(() => import('./pages/admin/PayrollManagement'));
const PayScale = lazy(() => import('./pages/admin/PayScale'));
const CMSManagement = lazy(() => import('./pages/admin/CMSManagement'));
const Roadmap = lazy(() => import('./pages/admin/Roadmap'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const RouteLoading: React.FC = () => (
  <div className="flex min-h-28 items-center justify-center px-6 py-12" role="status" aria-label="Opening page">
    <div className="h-5 w-5 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
  </div>
);

const page = (content: React.ReactNode) => <Suspense fallback={<RouteLoading />}>{content}</Suspense>;

const RouteWarmup: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  React.useEffect(() => {
    if (loading) return;
    // Browser-cache common route chunks when idle, without holding up
    // paint or downloading heavyweight admin editors on public pages.
    const warm = () => {
      void import('./pages/public/Home');
      void import('./pages/public/Projects');
      void import('./pages/public/Subsidiaries');
      void import('./pages/public/Founders');
      if (user) {
        void import('./components/layout/DashboardLayout');
        void import('./pages/dashboard/UserDashboard');
        if (isAdmin) {
          void import('./components/layout/AdminWorkspace');
          void import('./pages/admin/AdminOverview');
          void import('./pages/admin/AdminSettings');
        }
      }
    };
    const idleWindow = window as Window & { requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(warm, { timeout: 2500 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(warm, 500);
    return () => window.clearTimeout(id);
  }, [user, isAdmin, loading]);
  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CMSProvider>
            <RouteWarmup />
            <Router basename={import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL}>
              <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
                <Routes>
                  {/* OAuth relay must not render the standard site navigation. */}
                  <Route path="/auth-bridge" element={page(<AuthBridge />)} />

                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={page(<Home />)} />
                    <Route path="/subsidiaries" element={page(<Subsidiaries />)} />
                    <Route path="/founders" element={page(<Founders />)} />
                    <Route path="/projects" element={page(<Projects />)} />
                    <Route path="/login" element={page(<Login />)} />
                  </Route>

                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={page(<UserDashboard />)} />
                    <Route path="files" element={page(<FileExplorer />)} />
                    <Route path="settings" element={page(<AdminSettings />)} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminWorkspace /></ProtectedRoute>}>
                    <Route index element={page(<AdminOverview />)} />
                    <Route path="employees" element={page(<EmployeeManagement />)} />
                    <Route path="payroll" element={page(<PayrollManagement />)} />
                    <Route path="payscale" element={page(<PayScale />)} />
                    <Route path="cms" element={page(<CMSManagement />)} />
                    <Route path="roadmap" element={page(<Roadmap />)} />
                    <Route path="settings" element={page(<AdminSettings />)} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Router>
        </CMSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
