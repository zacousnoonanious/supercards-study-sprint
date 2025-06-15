
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Navigation } from '@/components/Navigation';
import { useI18n } from '@/contexts/I18nContext';

const Admin = () => {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('admin.title')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('admin.subtitle')}
            </p>
          </div>
          <AdminLayout />
        </div>
      </main>
    </div>
  );
};

export default Admin;
