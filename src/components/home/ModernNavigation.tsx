
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';

interface ModernNavigationProps {
  currentSection: string;
  onNavigate: (section: 'hero' | 'features' | 'showcase' | 'pricing') => void;
  isTransitioning: boolean;
}

export const ModernNavigation: React.FC<ModernNavigationProps> = ({
  currentSection,
  onNavigate,
  isTransitioning
}) => {
  const { t } = useI18n();

  const navItems = [
    { key: 'hero', label: t('home.heroSection.home') },
    { key: 'features', label: t('home.heroSection.features') },
    { key: 'showcase', label: 'Showcase' },
    { key: 'pricing', label: t('home.heroSection.pricing') }
  ];

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 p-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 bg-white rounded-lg"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
            SuperDeck
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key as any)}
              disabled={isTransitioning}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${currentSection === item.key
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-700 hover:bg-purple-100 hover:text-purple-800'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {item.label}
            </button>
          ))}
          
          <LanguageSelector />
          
          <Link to="/auth">
            <Button 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('home.heroSection.login')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
