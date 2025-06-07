
import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CardNavigationProps {
  currentIndex: number;
  totalCards: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  currentSide: 'front' | 'back';
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout?: () => void;
  onDeleteCard?: () => Promise<boolean>;
  cardType?: string;
}

export const CardNavigation: React.FC<CardNavigationProps> = ({
  currentIndex,
  totalCards,
  onNavigate,
  currentSide,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onDeleteCard,
  cardType,
}) => {
  const { t } = useI18n();
  const { toast } = useToast();

  const handleDeleteCard = async () => {
    if (!onDeleteCard) return;
    
    if (totalCards <= 1) {
      toast({
        title: t('error.general'),
        description: t('error.validation'),
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(t('confirm') + '?');
    if (!confirmed) return;

    const success = await onDeleteCard();
    if (success) {
      toast({
        title: t('success.deleted'),
        description: t('success.deleted'),
      });
    } else {
      toast({
        title: t('error.general'),
        description: t('error.general'),
        variant: "destructive",
      });
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    // Prevent navigation if already at the boundaries
    if (direction === 'prev' && currentIndex <= 0) return;
    if (direction === 'next' && currentIndex >= totalCards - 1) return;
    
    // Use requestAnimationFrame to ensure smooth navigation
    requestAnimationFrame(() => {
      onNavigate(direction);
    });
  };

  const showBackSide = cardType !== 'single-sided' && cardType !== 'informational';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate('prev')}
          disabled={currentIndex === 0}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('previous')}</span>
        </Button>
        
        <span className="text-sm font-medium px-3 py-1 bg-muted rounded">
          {currentIndex + 1} of {totalCards}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleNavigate('next')}
          disabled={currentIndex === totalCards - 1}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">{t('next')}</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {showBackSide && (
        <div className="flex gap-1 p-1 bg-muted rounded">
          <Button
            variant={currentSide === 'front' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSideChange('front')}
            className="text-xs"
          >
            {t('editor.frontSide')}
          </Button>
          <Button
            variant={currentSide === 'back' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onSideChange('back')}
            className="text-xs"
          >
            {t('editor.backSide')}
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateNewCard}
          className="flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('editor.newCard')}</span>
        </Button>
        
        {onCreateNewCardWithLayout && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateNewCardWithLayout}
            className="flex items-center gap-1"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">{t('duplicate')}</span>
          </Button>
        )}

        {onDeleteCard && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteCard}
            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">{t('delete')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
