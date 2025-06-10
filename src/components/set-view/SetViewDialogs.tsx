
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AIFlashcardGenerator } from '@/components/AIFlashcardGenerator';
import { InteractiveCardCreator } from '@/components/InteractiveCardCreator';
import { StudyModePreSettings, StudySettings } from '@/components/StudyModePreSettings';
import { useI18n } from '@/contexts/I18nContext';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  permanent_shuffle?: boolean;
}

interface SetViewDialogsProps {
  showAIGenerator: boolean;
  onShowAIGenerator: (show: boolean) => void;
  showCardCreator: boolean;
  onShowCardCreator: (show: boolean) => void;
  showStudySettings: boolean;
  onShowStudySettings: (show: boolean) => void;
  showPermanentShuffleSettings: boolean;
  onShowPermanentShuffleSettings: (show: boolean) => void;
  setId: string;
  set?: FlashcardSet;
  cards: any[];
  onAIGenerated: () => void;
  onCardCreated: () => void;
  onStartStudyWithSettings: (settings: StudySettings) => void;
  onPermanentShuffleToggle: (enabled: boolean) => void;
}

export const SetViewDialogs: React.FC<SetViewDialogsProps> = ({
  showAIGenerator,
  onShowAIGenerator,
  showCardCreator,
  onShowCardCreator,
  showStudySettings,
  onShowStudySettings,
  showPermanentShuffleSettings,
  onShowPermanentShuffleSettings,
  setId,
  set,
  cards,
  onAIGenerated,
  onCardCreated,
  onStartStudyWithSettings,
  onPermanentShuffleToggle,
}) => {
  const { t } = useI18n();

  return (
    <>
      {/* Study Mode Pre-Settings Dialog */}
      <StudyModePreSettings
        open={showStudySettings}
        onClose={() => onShowStudySettings(false)}
        onStartStudy={onStartStudyWithSettings}
        totalCards={cards.length}
      />

      {/* Permanent Shuffle Settings Dialog */}
      <Dialog open={showPermanentShuffleSettings} onOpenChange={onShowPermanentShuffleSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('setView.deckSettings')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="permanent-shuffle">{t('setView.permanentShuffle')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('setView.permanentShuffleDesc')}
                </p>
              </div>
              <Switch
                id="permanent-shuffle"
                checked={set?.permanent_shuffle || false}
                onCheckedChange={onPermanentShuffleToggle}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={onShowAIGenerator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('setView.aiGenerateTitle')}</DialogTitle>
          </DialogHeader>
          <AIFlashcardGenerator
            setId={setId}
            onGenerated={onAIGenerated}
            mode="add-to-set"
          />
        </DialogContent>
      </Dialog>

      {/* Card Creator Dialog */}
      <Dialog open={showCardCreator} onOpenChange={onShowCardCreator}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('setView.createNewCardTitle')}</DialogTitle>
          </DialogHeader>
          <InteractiveCardCreator
            setId={setId}
            onCardCreated={onCardCreated}
            onClose={() => onShowCardCreator(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
