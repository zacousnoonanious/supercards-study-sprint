
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Grid, Play, Shuffle, Sparkles } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  permanent_shuffle?: boolean;
}

interface SetViewHeaderProps {
  set: FlashcardSet;
  setId: string;
  onShowPermanentShuffleSettings: () => void;
  onShowEnhancedOverview: () => void;
  onShowAIGenerator: () => void;
  onShowStudySettings: () => void;
}

export const SetViewHeader: React.FC<SetViewHeaderProps> = ({
  set,
  setId,
  onShowPermanentShuffleSettings,
  onShowEnhancedOverview,
  onShowAIGenerator,
  onShowStudySettings,
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/decks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{set.title}</h1>
          <p className="text-muted-foreground">{set.description}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onShowPermanentShuffleSettings}
          className="flex items-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          {t('setView.deckSettings')}
        </Button>
        <Button
          variant="outline"
          onClick={onShowEnhancedOverview}
          className="flex items-center gap-2"
        >
          <Grid className="w-4 h-4" />
          {t('setView.enhancedOverview')}
        </Button>
        <Button
          variant="outline"
          onClick={onShowAIGenerator}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {t('setView.aiGenerate')}
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`/edit-cards/${setId}`)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          {t('edit')}
        </Button>
        <Button
          onClick={onShowStudySettings}
          className="flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {t('decks.study')}
        </Button>
      </div>
    </div>
  );
};
