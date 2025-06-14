
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';

interface StudySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shuffle: boolean;
  mode: 'flashcard' | 'quiz' | 'mixed';
  onShuffleChange: (shuffle: boolean) => void;
  onModeChange: (mode: 'flashcard' | 'quiz' | 'mixed') => void;
}

export const StudySettingsDialog: React.FC<StudySettingsDialogProps> = ({
  open,
  onOpenChange,
  shuffle,
  mode,
  onShuffleChange,
  onModeChange,
}) => {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('common.studySettings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shuffle">{t('common.shuffleCards')}</Label>
            <Switch id="shuffle" checked={shuffle} onCheckedChange={onShuffleChange} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="mode">{t('common.studyMode')}</Label>
            <select
              id="mode"
              className="border rounded px-2 py-1"
              value={mode}
              onChange={(e) => onModeChange(e.target.value as 'flashcard' | 'quiz' | 'mixed')}
            >
              <option value="flashcard">{t('study.flashcardMode')}</option>
              <option value="quiz">{t('study.quizMode')}</option>
              <option value="mixed">{t('study.mixedMode')}</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
