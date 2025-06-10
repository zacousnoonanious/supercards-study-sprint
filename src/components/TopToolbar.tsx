
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Grid, Eye, Keyboard, Maximize2 } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface TopToolbarProps {
  deckName: string;
  currentCardIndex: number;
  cards: Flashcard[];
  showShortcuts: boolean;
  showCardOverview: boolean;
  onDeckTitleChange: (title: string) => Promise<void>;
  onShowCardOverviewChange: (show: boolean) => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  deckName,
  currentCardIndex,
  cards,
  showShortcuts,
  showCardOverview,
  onDeckTitleChange,
  onShowCardOverviewChange,
}) => {
  const { t } = useI18n();
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(deckName);

  const handleTitleSubmit = async () => {
    if (tempTitle.trim() && tempTitle !== deckName) {
      try {
        await onDeckTitleChange(tempTitle.trim());
      } catch (error) {
        setTempTitle(deckName);
      }
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(deckName);
      setEditingTitle(false);
    }
  };

  return (
    <div className="border-b p-2 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {editingTitle ? (
            <Input
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              className="h-8 text-lg font-semibold"
              autoFocus
            />
          ) : (
            <h1 
              className="text-lg font-semibold cursor-pointer hover:text-muted-foreground"
              onClick={() => setEditingTitle(true)}
              title={t('common.clickToEdit')}
            >
              {deckName}
            </h1>
          )}
          
          <div className="text-sm text-muted-foreground">
            {t('toolbar.card')} {currentCardIndex + 1} {t('common.of')} {cards.length}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onShowCardOverviewChange(!showCardOverview)}
            title={t('common.cardOverview')}
          >
            <Grid className="w-4 h-4" />
            <span className="ml-2">{t('common.cardOverview')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
