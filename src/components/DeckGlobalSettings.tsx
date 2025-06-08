
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface DeckSettings {
  globalCountdown?: number;
  autoFlip?: boolean;
  shuffleEnabled?: boolean;
  showHints?: boolean;
  allowMultipleAttempts?: boolean;
  studyMode?: 'flashcard' | 'quiz' | 'mixed';
}

interface DeckGlobalSettingsProps {
  open: boolean;
  onClose: () => void;
  settings: DeckSettings;
  onSettingsUpdate: (settings: DeckSettings) => void;
}

export const DeckGlobalSettings: React.FC<DeckGlobalSettingsProps> = ({
  open,
  onClose,
  settings,
  onSettingsUpdate
}) => {
  const [localSettings, setLocalSettings] = useState<DeckSettings>(settings);

  const handleSave = () => {
    onSettingsUpdate(localSettings);
    onClose();
  };

  const updateSetting = <K extends keyof DeckSettings>(
    key: K,
    value: DeckSettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Deck Study Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Timing Settings</h3>
            <div className="space-y-2">
              <Label htmlFor="countdown">Global Countdown Timer (seconds)</Label>
              <Input
                id="countdown"
                type="number"
                min="0"
                max="300"
                value={localSettings.globalCountdown || 0}
                onChange={(e) => updateSetting('globalCountdown', parseInt(e.target.value) || 0)}
                placeholder="0 = No timer"
              />
              <p className="text-xs text-muted-foreground">
                Overrides individual card timers. 0 means no global timer.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-flip">Auto-flip Cards</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically flip to answer after timer
                </p>
              </div>
              <Switch
                id="auto-flip"
                checked={localSettings.autoFlip || false}
                onCheckedChange={(checked) => updateSetting('autoFlip', checked)}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Study Behavior</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="shuffle">Shuffle Cards</Label>
                <p className="text-xs text-muted-foreground">
                  Randomize card order during study
                </p>
              </div>
              <Switch
                id="shuffle"
                checked={localSettings.shuffleEnabled || false}
                onCheckedChange={(checked) => updateSetting('shuffleEnabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-mode">Default Study Mode</Label>
              <Select
                value={localSettings.studyMode || 'flashcard'}
                onValueChange={(value: 'flashcard' | 'quiz' | 'mixed') => 
                  updateSetting('studyMode', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flashcard">Flashcard Mode</SelectItem>
                  <SelectItem value="quiz">Quiz Mode</SelectItem>
                  <SelectItem value="mixed">Mixed Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Quiz Settings</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-hints">Show Hints</Label>
                <p className="text-xs text-muted-foreground">
                  Display hint text when available
                </p>
              </div>
              <Switch
                id="show-hints"
                checked={localSettings.showHints !== false}
                onCheckedChange={(checked) => updateSetting('showHints', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="multiple-attempts">Allow Multiple Attempts</Label>
                <p className="text-xs text-muted-foreground">
                  Let users retry quiz questions
                </p>
              </div>
              <Switch
                id="multiple-attempts"
                checked={localSettings.allowMultipleAttempts !== false}
                onCheckedChange={(checked) => updateSetting('allowMultipleAttempts', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
