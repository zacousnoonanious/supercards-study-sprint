
import React from 'react';
import { Navigation } from '@/components/Navigation';
import { PerformanceAnalytics } from '@/components/analytics/PerformanceAnalytics';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const Analytics = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
          <PerformanceAnalytics />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
