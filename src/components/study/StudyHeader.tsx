
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Navigation } from '@/components/Navigation';
import { UserDropdown } from '@/components/UserDropdown';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  permanent_shuffle?: boolean;
  user_id: string;
}

interface StudyHeaderProps {
  set: FlashcardSet;
  onBackClick: () => void;
  onSettingsClick: () => void;
}

export const StudyHeader: React.FC<StudyHeaderProps> = ({
  set,
  onBackClick,
  onSettingsClick,
}) => {
  const { t } = useI18n();

  return (
    <>
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBackClick}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{set.title}</h1>
              <p className="text-muted-foreground">{set.description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onSettingsClick}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {t('common.settings')}
          </Button>
        </div>
      </main>
    </>
  );
};
