
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface StudyModeSettingsProps {
  showPanelView: boolean;
  allowNavigation: boolean;
  onPanelViewChange: (value: boolean) => void;
  onNavigationChange: (value: boolean) => void;
}

export const StudyModeSettings: React.FC<StudyModeSettingsProps> = ({
  showPanelView,
  allowNavigation,
  onPanelViewChange,
  onNavigationChange,
}) => {
  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center space-x-2">
          <Switch
            id="panel-view"
            checked={showPanelView}
            onCheckedChange={onPanelViewChange}
          />
          <Label htmlFor="panel-view" className="text-sm">
            Show answer as panel below (instead of card flip)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="allow-navigation"
            checked={allowNavigation}
            onCheckedChange={onNavigationChange}
          />
          <Label htmlFor="allow-navigation" className="text-sm">
            Allow navigation between cards during study
          </Label>
        </div>
      </div>
    </div>
  );
};
