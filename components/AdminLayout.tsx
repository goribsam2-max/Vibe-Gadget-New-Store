import React from 'react';
import { Sidebar } from './ui/modern-side-bar';
import { Outlet } from 'react-router-dom';

interface AdminLayoutProps {
  userData: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ userData }) => {
  return (
    <Sidebar userData={userData}>
      <Outlet />
    </Sidebar>
  );
};

export default AdminLayout;
