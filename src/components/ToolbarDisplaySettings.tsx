
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

interface ToolbarDisplaySettingsProps {
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
}

export const ToolbarDisplaySettings: React.FC<ToolbarDisplaySettingsProps> = ({
  showLabels,
  onShowLabelsChange,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Toolbar Display</h4>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-labels">Show Labels</Label>
            <Switch
              id="show-labels"
              checked={showLabels}
              onCheckedChange={onShowLabelsChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Toggle to show or hide text labels on toolbar buttons
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
