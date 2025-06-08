
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shuffle, Play, Settings } from 'lucide-react';

interface StudyModePreSettingsProps {
  open: boolean;
  onClose: () => void;
  onStartStudy: (settings: StudySettings) => void;
  totalCards: number;
}

export interface StudySettings {
  shuffle: boolean;
  mode: 'flashcard' | 'quiz' | 'review';
  autoFlip: boolean;
  countdownTimer: number;
  showHints: boolean;
  allowMultipleAttempts: boolean;
}

export const StudyModePreSettings: React.FC<StudyModePreSettingsProps> = ({
  open,
  onClose,
  onStartStudy,
  totalCards,
}) => {
  const [settings, setSettings] = useState<StudySettings>({
    shuffle: false,
    mode: 'flashcard',
    autoFlip: false,
    countdownTimer: 0,
    showHints: true,
    allowMultipleAttempts: true,
  });

  const handleStartStudy = () => {
    onStartStudy(settings);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Study Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">Shuffle Cards</Label>
              <Switch
                id="shuffle"
                checked={settings.shuffle}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, shuffle: checked }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label>Study Mode</Label>
              <Select
                value={settings.mode}
                onValueChange={(value: 'flashcard' | 'quiz' | 'review') =>
                  setSettings(prev => ({ ...prev, mode: value }))
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

            <div className="flex items-center justify-between">
              <Label htmlFor="autoflip">Auto-flip Cards</Label>
              <Switch
                id="autoflip"
                checked={settings.autoFlip}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, autoFlip: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hints">Show Hints</Label>
              <Switch
                id="hints"
                checked={settings.showHints}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, showHints: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="attempts">Allow Multiple Attempts</Label>
              <Switch
                id="attempts"
                checked={settings.allowMultipleAttempts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, allowMultipleAttempts: checked }))
                }
                disabled={settings.mode === 'quiz'}
              />
            </div>
            {settings.mode === 'quiz' && (
              <p className="text-sm text-muted-foreground">Quiz mode only allows one attempt per question</p>
            )}

            <div className="space-y-2">
              <Label>Countdown Timer (seconds)</Label>
              <Select
                value={settings.countdownTimer.toString()}
                onValueChange={(value) =>
                  setSettings(prev => ({ ...prev, countdownTimer: parseInt(value) }))
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
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleStartStudy} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Study ({totalCards} cards)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
