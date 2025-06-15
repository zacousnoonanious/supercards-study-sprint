
import React from 'react';
import { Sparkles, Brain, Globe, BarChart3, Mic, Download } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export const AdvancedFeatures = () => {
  const { t } = useI18n();
  const features = [
    { icon: Sparkles, key: "quizGeneration" },
    { icon: Brain, key: "deckGenerator" },
    { icon: Globe, key: "visualEditor" },
    { icon: BarChart3, key: "analytics" },
    { icon: Mic, key: "speechTools" },
    { icon: Download, key: "offlineSupport" }
  ];

  return (
    <div className="mb-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
      <h3 className="text-3xl font-bold text-center mb-12">{t('home.advancedFeatures.title')}</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-4">
            <feature.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">{t(`home.advancedFeatures.${feature.key}.title`)}</h4>
            <p className="text-sm text-gray-600">{t(`home.advancedFeatures.${feature.key}.desc`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
