
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';

export const FinalCTA = () => {
  const { t } = useI18n();
  return (
    <div className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-lg p-8 animate-fade-in">
      <h3 className="text-3xl font-bold mb-4">{t('home.finalCta.title')}</h3>
      <p className="text-xl mb-6 opacity-90">{t('home.finalCta.subtitle')}</p>
      <Link to="/auth">
        <Button size="lg" variant="secondary" className="text-lg px-8 py-3 hover-scale">
          {t('home.finalCta.button')}
        </Button>
      </Link>
    </div>
  );
};
