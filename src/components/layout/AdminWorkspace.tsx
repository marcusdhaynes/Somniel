import React from 'react';
import { PayscaleProvider } from '../../context/PayscaleContext';
import AdminLayout from './AdminLayout';

// Defer admin-only listeners and payroll code until an admin route is accessed.
const AdminWorkspace: React.FC = () => (
  <PayscaleProvider>
    <AdminLayout />
  </PayscaleProvider>
);

export default AdminWorkspace;
