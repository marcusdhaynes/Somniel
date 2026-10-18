import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CMSProvider } from './context/CMSContext';
import { PayscaleProvider } from './context/PayscaleContext';
import { ThemeProvider } from './context/ThemeContext';
import { Loader2 } from 'lucide-react';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
const Home = lazy(() => import('./pages/public/Home'));
const Subsidiaries = lazy(() => import('./pages/public/Subsidiaries'));
const Founders = lazy(() => import('./pages/public/Founders'));
const Projects = lazy(() => import('./pages/public/Projects'));
const Login = lazy(() => import('./pages/public/Login'));

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

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading, isAdmin } = useAuth();

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
          <PayscaleProvider>
            <Router>
              <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-zinc-950"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
                <Routes>
                  {/* Public Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/subsidiaries" element={<Subsidiaries />} />
                    <Route path="/founders" element={<Founders />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/login" element={<Login />} />
                  </Route>

                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<UserDashboard />} />
                    <Route path="files" element={<FileExplorer />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                    <Route index element={<AdminOverview />} />
                    <Route path="employees" element={<EmployeeManagement />} />
                    <Route path="payroll" element={<PayrollManagement />} />
                    <Route path="payscale" element={<PayScale />} />
                    <Route path="cms" element={<CMSManagement />} />
                    <Route path="roadmap" element={<Roadmap />} />
                  </Route>

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Router>
          </PayscaleProvider>
        </CMSProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
