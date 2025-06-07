
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CanvasElement } from '@/types/flashcard';

interface QuizBehaviorSettingsProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
}

export const QuizBehaviorSettings: React.FC<QuizBehaviorSettingsProps> = ({
  element,
  onUpdate,
}) => {
  if (element.type !== 'multiple-choice' && element.type !== 'true-false') {
    return null;
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-background">
      <h4 className="font-medium text-sm">Quiz Behavior Settings</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="immediate-feedback" className="text-sm">
            Show immediate feedback
          </Label>
          <Switch
            id="immediate-feedback"
            checked={element.showImmediateFeedback || false}
            onCheckedChange={(checked) => 
              onUpdate({ showImmediateFeedback: checked })
            }
          />
        </div>
        
        {element.showImmediateFeedback && (
          <div className="flex items-center justify-between ml-4">
            <Label htmlFor="auto-advance" className="text-sm">
              Auto-advance after answering
            </Label>
            <Switch
              id="auto-advance"
              checked={element.autoAdvanceOnAnswer || false}
              onCheckedChange={(checked) => 
                onUpdate({ autoAdvanceOnAnswer: checked })
              }
            />
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        {element.showImmediateFeedback 
          ? "Answer feedback will be shown immediately after clicking"
          : "Answer feedback will be shown at the end of the session"
        }
      </p>
    </div>
  );
};
