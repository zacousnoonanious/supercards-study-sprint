
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Study Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="shuffle">Shuffle Cards</Label>
            <Switch
              id="shuffle"
              checked={studySettings.shuffle}
              onCheckedChange={(checked) =>
                onSettingsChange(prev => ({ ...prev, shuffle: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoFlip">Auto Flip</Label>
            <Switch
              id="autoFlip"
              checked={studySettings.autoFlip}
              onCheckedChange={(checked) =>
                onSettingsChange(prev => ({ ...prev, autoFlip: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Study Mode</Label>
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
                <SelectItem value="flashcard">Flashcard Mode</SelectItem>
                <SelectItem value="quiz">Quiz Mode</SelectItem>
                <SelectItem value="review">Review Mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Countdown Timer (seconds)</Label>
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
                <SelectItem value="0">No Timer</SelectItem>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="120">2 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onClose} className="w-full">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
