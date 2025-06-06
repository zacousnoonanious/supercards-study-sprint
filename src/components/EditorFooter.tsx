
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Timer, MapPin, Calendar } from 'lucide-react';
import { Flashcard, CanvasElement } from '@/types/flashcard';

interface EditorFooterProps {
  currentCard: Flashcard;
  selectedElement: CanvasElement | null;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateCard?: (cardId: string, updates: Partial<Flashcard>) => void;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({
  currentCard,
  selectedElement,
  onUpdateElement,
  onUpdateCard,
}) => {
  const [countdownTime, setCountdownTime] = useState(currentCard.countdown_timer || 30);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  const handleCountdownChange = (value: number) => {
    setCountdownTime(value);
    onUpdateCard?.(currentCard.id, { countdown_timer: value });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    if (!selectedElement || !onUpdateElement) return;
    onUpdateElement(selectedElement.id, {
      [axis]: value
    });
  };

  const handleSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (!selectedElement || !onUpdateElement) return;
    onUpdateElement(selectedElement.id, {
      [dimension]: value
    });
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-background/95 backdrop-blur-sm border-t border-border z-40">
      <div className="container max-w-full h-full flex items-center justify-between px-4 gap-4">
        
        {/* Countdown Timer Setting */}
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <Label className="text-xs">Timer:</Label>
          <Input
            type="number"
            value={countdownTime}
            onChange={(e) => handleCountdownChange(parseInt(e.target.value) || 30)}
            className="w-16 h-6 text-xs"
            min="1"
            max="300"
          />
          <span className="text-xs text-muted-foreground">sec</span>
        </div>

        {/* Element/Card Position and Size */}
        {selectedElement ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Label className="text-xs">Position:</Label>
              <div className="flex items-center gap-1">
                <Label className="text-xs">X:</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.x || 0)}
                  onChange={(e) => handlePositionChange('x', parseInt(e.target.value) || 0)}
                  className="w-12 h-6 text-xs"
                />
                <Label className="text-xs">Y:</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.y || 0)}
                  onChange={(e) => handlePositionChange('y', parseInt(e.target.value) || 0)}
                  className="w-12 h-6 text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs">Size:</Label>
              <div className="flex items-center gap-1">
                <Label className="text-xs">W:</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.width || 0)}
                  onChange={(e) => handleSizeChange('width', parseInt(e.target.value) || 0)}
                  className="w-12 h-6 text-xs"
                />
                <Label className="text-xs">H:</Label>
                <Input
                  type="number"
                  value={Math.round(selectedElement.height || 0)}
                  onChange={(e) => handleSizeChange('height', parseInt(e.target.value) || 0)}
                  className="w-12 h-6 text-xs"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">No element selected</span>
          </div>
        )}

        {/* Card Creation Date/Time */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <div className="text-xs">
            <div className="text-muted-foreground">Created:</div>
            <div>{formatDate(currentCard.created_at)}</div>
          </div>
        </div>

        {/* Current Time */}
        <div className="text-xs text-muted-foreground">
          {currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
