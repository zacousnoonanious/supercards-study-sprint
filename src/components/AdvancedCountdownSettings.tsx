
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Flashcard } from '@/types/flashcard';

interface AdvancedCountdownSettingsProps {
  card: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
}

export const AdvancedCountdownSettings: React.FC<AdvancedCountdownSettingsProps> = ({
  card,
  onUpdateCard,
}) => {
  const hasFrontTimer = (card.countdown_timer_front || 0) > 0;
  const hasBackTimer = (card.countdown_timer_back || 0) > 0;
  const bothSidesFlip = card.countdown_behavior_front === 'flip' && card.countdown_behavior_back === 'flip';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Advanced Timer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Front Side Timer */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Front Side Timer</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Timer (seconds)</Label>
              <Input
                type="number"
                min="0"
                value={card.countdown_timer_front || 0}
                onChange={(e) => onUpdateCard({ countdown_timer_front: parseInt(e.target.value) || 0 })}
                placeholder="0 = no timer"
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">When timer expires</Label>
              <Select
                value={card.countdown_behavior_front || 'flip'}
                onValueChange={(value) => onUpdateCard({ countdown_behavior_front: value as 'flip' | 'next' })}
                disabled={!hasFrontTimer}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flip">Flip to back</SelectItem>
                  <SelectItem value="next">Next card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Back Side Timer */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Back Side Timer</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500">Timer (seconds)</Label>
              <Input
                type="number"
                min="0"
                value={card.countdown_timer_back || 0}
                onChange={(e) => onUpdateCard({ countdown_timer_back: parseInt(e.target.value) || 0 })}
                placeholder="0 = no timer"
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500">When timer expires</Label>
              <Select
                value={card.countdown_behavior_back || 'next'}
                onValueChange={(value) => onUpdateCard({ countdown_behavior_back: value as 'flip' | 'next' })}
                disabled={!hasBackTimer}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flip">Flip to front</SelectItem>
                  <SelectItem value="next">Next card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Flip Count (only show if both sides are set to flip) */}
        {hasFrontTimer && hasBackTimer && bothSidesFlip && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Flip Behavior</Label>
            <div>
              <Label className="text-xs text-gray-500">Number of flips before next card</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={card.flips_before_next || 2}
                onChange={(e) => onUpdateCard({ flips_before_next: parseInt(e.target.value) || 2 })}
                placeholder="2"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Card will flip back and forth this many times before moving to next card
              </p>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Set different timers for front and back sides</li>
            <li>Choose what happens when each timer expires: flip or next card</li>
            <li>If both sides flip, set how many times to repeat before next card</li>
            <li>Perfect for vocabulary practice: word → definition → repeat</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
