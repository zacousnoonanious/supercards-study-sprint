
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';

interface StudyModeSettingsProps {
  studySettings: {
    shuffle: boolean;
    autoFlip: boolean;
    countdownTimer: number;
    mode: 'flashcard' | 'quiz' | 'review';
  };
  onSettingsChange: React.Dispatch<React.SetStateAction<{
    shuffle: boolean;
    autoFlip: boolean;
    countdownTimer: number;
    mode: 'flashcard' | 'quiz' | 'review';
  }>>;
  showPanelView: boolean;
  onTogglePanelView: () => void;
  onClose: () => void;
}

export const StudyModeSettings: React.FC<StudyModeSettingsProps> = ({
  studySettings,
  onSettingsChange,
  showPanelView,
  onTogglePanelView,
  onClose,
}) => {
  const { t } = useI18n();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('study.studyModeSettings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="shuffle">{t('common.shuffleCards')}</Label>
            <Switch
              id="shuffle"
              checked={studySettings.shuffle}
              onCheckedChange={(checked) =>
                onSettingsChange(prev => ({ ...prev, shuffle: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoFlip">{t('common.autoFlip')}</Label>
            <Switch
              id="autoFlip"
              checked={studySettings.autoFlip}
              onCheckedChange={(checked) =>
                onSettingsChange(prev => ({ ...prev, autoFlip: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t('common.studyMode')}</Label>
            <Select
              value={studySettings.mode}
              onValueChange={(value: 'flashcard' | 'quiz' | 'review') =>
                onSettingsChange(prev => ({ ...prev, mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flashcard">{t('study.flashcardMode')}</SelectItem>
                <SelectItem value="quiz">{t('study.quizMode')}</SelectItem>
                <SelectItem value="review">{t('study.reviewMode')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('common.countdownTimer')} ({t('common.seconds')})</Label>
            <Select
              value={studySettings.countdownTimer.toString()}
              onValueChange={(value) =>
                onSettingsChange(prev => ({ ...prev, countdownTimer: parseInt(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('common.noTimer')}</SelectItem>
                <SelectItem value="10">10 {t('common.seconds')}</SelectItem>
                <SelectItem value="30">30 {t('common.seconds')}</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onClose} className="w-full">
            {t('common.saveSettings')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
