
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Navigation } from '@/components/Navigation';

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-16">
        <AdminLayout />
      </main>
    </div>
  );
};

export default Admin;
