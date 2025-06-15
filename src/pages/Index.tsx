
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ModernHomepage } from '@/components/home/ModernHomepage';
import { useI18n } from '@/contexts/I18nContext';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Don't render homepage if user is logged in
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (user) {
    return null; // Don't render anything while redirecting
  }

  return <ModernHomepage />;
};

export default Index;
