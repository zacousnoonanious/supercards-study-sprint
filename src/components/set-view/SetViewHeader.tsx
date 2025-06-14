
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Edit, Settings, Shuffle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';

interface SetViewHeaderProps {
  set: {
    id: string;
    title: string;
    description?: string;
    permanent_shuffle?: boolean;
  };
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
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleStartStudy = () => {
    console.log('Navigating to study mode for set:', setId);
    navigate(`/study/${setId}`);
  };

  const handleOpenEditor = () => {
    console.log('Navigating to visual editor for set:', setId);
    navigate(`/sets/${setId}/cards`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/decks')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('setView.backToDecks')}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleStartStudy}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {t('setView.studyMode')}
          </Button>
          
          <Button
            onClick={handleOpenEditor}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            {t('setView.visualEditor')}
          </Button>

          <Button
            onClick={onShowStudySettings}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            {t('setView.studySettings')}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">{set.title}</h1>
        {set.description && (
          <p className="text-muted-foreground mb-4">{set.description}</p>
        )}
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          {set.permanent_shuffle && (
            <div className="flex items-center gap-1">
              <Shuffle className="w-4 h-4" />
              {t('setView.permanentShuffle')}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowEnhancedOverview}
            className="flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            {t('setView.enhancedOverview')}
          </Button>
        </div>
      </div>
    </div>
  );
};
