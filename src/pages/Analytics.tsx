
import React from 'react';
import { Navigation } from '@/components/Navigation';
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useI18n } from '@/contexts/I18nContext';

const Analytics = () => {
  const { t } = useI18n();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">
                {t('analytics.title')}
              </h1>
              <p className="text-muted-foreground mt-2">
                {t('analytics.subtitle')}
              </p>
            </div>
            <PerformanceAnalytics />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
