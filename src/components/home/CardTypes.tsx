
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';

export const CardTypes = () => {
  const { t } = useI18n();
  const cardTypes = [
    { key: "infoPanels" },
    { key: "quizCards" },
    { key: "pollCards" },
    { key: "mediaCards" }
  ];

  return (
    <div className="mb-20 animate-fade-in">
      <h3 className="text-3xl font-bold text-center mb-12">{t('home.cardTypes.title')}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cardTypes.map((type, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t(`home.cardTypes.${type.key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{t(`home.cardTypes.${type.key}.desc`)}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
