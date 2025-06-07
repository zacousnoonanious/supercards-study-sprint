
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';

export const HeroSection = () => {
  const { t } = useI18n();

  return (
    <div className="text-center mb-20 animate-fade-in">
      <h2 className="text-5xl font-bold text-gray-900 mb-6">
        {t('home.hero.title')}
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        {t('home.hero.subtitle')}
      </p>
      <Link to="/auth">
        <Button size="lg" className="text-lg px-8 py-4 hover-scale">
          {t('home.hero.cta')}
        </Button>
      </Link>
    </div>
  );
};
