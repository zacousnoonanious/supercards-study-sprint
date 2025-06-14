
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Settings, Shuffle, Sparkles, Eye, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { ListDeckForSaleDialog } from '../ListDeckForSaleDialog';

interface SetViewHeaderProps {
  set: {
    id: string;
    title: string;
    description: string | null;
    user_id: string;
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
  const { user } = useAuth();

  const isOwner = user?.id === set.user_id;

  return (
    <div className="mb-6">
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
          {isOwner && (
            <ListDeckForSaleDialog
              setId={setId}
              setTitle={set.title}
              trigger={
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  List for Sale
                </Button>
              }
            />
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowPermanentShuffleSettings}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">
              {set.permanent_shuffle ? 'Shuffled' : 'Ordered'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowEnhancedOverview}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Enhanced View</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onShowAIGenerator}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Generate</span>
          </Button>
          
          <Button
            onClick={onShowStudySettings}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">{t('setView.study')}</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{set.title}</CardTitle>
          {set.description && (
            <CardDescription className="text-base">{set.description}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </div>
  );
};
