
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Home } from 'lucide-react';
import { UserDropdown } from './UserDropdown';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useAuth();

  const isEditor = location.pathname.includes('/cards/');
  const isSetView = location.pathname.includes('/sets/') && !isEditor;

  const handleGoBack = () => {
    if (isEditor) {
      // Go back to set view
      const setId = location.pathname.split('/sets/')[1]?.split('/cards/')[0];
      if (setId) {
        navigate(`/sets/${setId}`);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <nav className="bg-background border-b border-border h-12 px-4 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleGoBack}
          className="flex items-center space-x-2 h-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">
            {isEditor ? t('nav.backToSet') : t('nav.backToDashboard')}
          </span>
        </Button>

        {(isEditor || isSetView) && (
          <>
            <div className="h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center space-x-2 h-8"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm">{t('nav.dashboard')}</span>
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {user && <UserDropdown />}
      </div>
    </nav>
  );
};
