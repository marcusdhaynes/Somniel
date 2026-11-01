import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider } from './context/CMSContext';
import { ThemeProvider } from './context/ThemeContext';
import { prefetchOnIdle } from './lib/routePrefetch';

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

// Keep existing navigation and layout mounted during asynchronous route imports.
// Preloaded routes appear directly without a spinner, modal, or layout jump.
const page = (content: React.ReactNode) => <Suspense fallback={null}>{content}</Suspense>;

const RouteWarmup: React.FC = () => {
  const { user, isAdmin, loading } = useAuth();
  React.useEffect(() => {
    if (loading) return;
    // Prioritize rendering. Only warm the next two small routes after paint;
    // heavyweight admin editors load on pointer/focus/touch intent instead.
    const destinations = user
      ? (isAdmin ? ['/admin', '/admin/settings'] : ['/dashboard', '/dashboard/settings'])
      : ['/projects', '/subsidiaries'];
    return prefetchOnIdle(destinations);
  }, [user, isAdmin, loading]);
  return null;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;
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
              <Suspense fallback={null}>
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
