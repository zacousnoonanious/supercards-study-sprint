
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Timer } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';

interface TimerControlsProps {
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
  currentSide?: 'front' | 'back';
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  currentCard,
  onUpdateCard,
  currentSide = 'front',
}) => {
  const getCurrentTimer = () => {
    if (currentSide === 'front') {
      return currentCard?.countdown_timer_front || 0;
    }
    return currentCard?.countdown_timer_back || 0;
  };

  const getCurrentBehavior = () => {
    if (currentSide === 'front') {
      return currentCard?.countdown_behavior_front || 'flip';
    }
    return currentCard?.countdown_behavior_back || 'next';
  };

  const handleTimerUpdate = (value: number) => {
    if (currentSide === 'front') {
      onUpdateCard({ countdown_timer_front: value });
    } else {
      onUpdateCard({ countdown_timer_back: value });
    }
  };

  const handleBehaviorUpdate = (behavior: 'flip' | 'next') => {
    if (currentSide === 'front') {
      onUpdateCard({ countdown_behavior_front: behavior });
    } else {
      onUpdateCard({ countdown_behavior_back: behavior });
    }
  };

  const bothSidesHaveTimers = (currentCard?.countdown_timer_front || 0) > 0 && (currentCard?.countdown_timer_back || 0) > 0;
  const bothSidesFlip = currentCard?.countdown_behavior_front === 'flip' && currentCard?.countdown_behavior_back === 'flip';
  const showFlipCount = bothSidesHaveTimers && bothSidesFlip;

  return (
    <>
      <Card className="flex-shrink-0">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Timer className="w-3 h-3" />
            <Label className="text-xs whitespace-nowrap">{currentSide === 'front' ? 'Front' : 'Back'} Timer (s):</Label>
            <Input
              type="number"
              value={getCurrentTimer()}
              onChange={(e) => handleTimerUpdate(Number(e.target.value))}
              className="w-20 h-7 text-xs"
              min="0"
              max="300"
              placeholder="0"
            />
            {getCurrentTimer() > 0 && (
              <div className="flex items-center gap-1">
                <Label className="text-xs">Action:</Label>
                <Select
                  value={getCurrentBehavior()}
                  onValueChange={(value: 'flip' | 'next') => handleBehaviorUpdate(value)}
                >
                  <SelectTrigger className="w-20 h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flip">Flip</SelectItem>
                    <SelectItem value="next">Next</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showFlipCount && (
        <Card className="flex-shrink-0">
          <CardContent className="p-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs whitespace-nowrap">Flips before next:</Label>
              <Input
                type="number"
                value={currentCard.flips_before_next || 2}
                onChange={(e) => onUpdateCard({ flips_before_next: Number(e.target.value) || 2 })}
                className="w-16 h-7 text-xs"
                min="1"
                max="10"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
