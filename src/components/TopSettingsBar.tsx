
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CanvasElement, Flashcard } from '@/types/flashcard';

interface TopSettingsBarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  currentCard?: Flashcard;
  onUpdateCard?: (updates: Partial<Flashcard>) => void;
}

export const TopSettingsBar: React.FC<TopSettingsBarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  currentCard,
  onUpdateCard,
}) => {
  if (!selectedElement && !currentCard) return null;

  return (
    <div className="bg-background border-b border-border p-2 sm:p-3">
      <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
        {/* Card Settings */}
        {currentCard && onUpdateCard && (
          <>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
              <Label className="text-xs sm:text-sm font-medium whitespace-nowrap">Canvas:</Label>
              <Input
                type="number"
                value={canvasWidth}
                onChange={(e) => onCanvasSizeChange(parseInt(e.target.value) || 600, canvasHeight)}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="W"
              />
              <span className="text-xs text-muted-foreground">×</span>
              <Input
                type="number"
                value={canvasHeight}
                onChange={(e) => onCanvasSizeChange(canvasWidth, parseInt(e.target.value) || 450)}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="H"
              />
            </div>

            <Separator orientation="vertical" className="h-6 sm:h-7" />

            {/* Advanced Timer Settings - More Compact */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
              <div className="flex items-center gap-1 min-w-0">
                <Label className="text-xs font-medium whitespace-nowrap hidden sm:inline">Front:</Label>
                <Label className="text-xs font-medium whitespace-nowrap sm:hidden">F:</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentCard.countdown_timer_front || 0}
                  onChange={(e) => onUpdateCard({ countdown_timer_front: parseInt(e.target.value) || 0 })}
                  className="w-10 sm:w-12 h-6 sm:h-7 text-xs"
                  placeholder="0"
                />
                <Select
                  value={currentCard.countdown_behavior_front || 'flip'}
                  onValueChange={(value) => onUpdateCard({ countdown_behavior_front: value as 'flip' | 'next' })}
                  disabled={!currentCard.countdown_timer_front || currentCard.countdown_timer_front === 0}
                >
                  <SelectTrigger className="w-12 sm:w-16 h-6 sm:h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flip">Flip</SelectItem>
                    <SelectItem value="next">Next</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1 min-w-0">
                <Label className="text-xs font-medium whitespace-nowrap hidden sm:inline">Back:</Label>
                <Label className="text-xs font-medium whitespace-nowrap sm:hidden">B:</Label>
                <Input
                  type="number"
                  min="0"
                  value={currentCard.countdown_timer_back || 0}
                  onChange={(e) => onUpdateCard({ countdown_timer_back: parseInt(e.target.value) || 0 })}
                  className="w-10 sm:w-12 h-6 sm:h-7 text-xs"
                  placeholder="0"
                />
                <Select
                  value={currentCard.countdown_behavior_back || 'next'}
                  onValueChange={(value) => onUpdateCard({ countdown_behavior_back: value as 'flip' | 'next' })}
                  disabled={!currentCard.countdown_timer_back || currentCard.countdown_timer_back === 0}
                >
                  <SelectTrigger className="w-12 sm:w-16 h-6 sm:h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flip">Flip</SelectItem>
                    <SelectItem value="next">Next</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Flip Count (only if both sides flip) */}
              {currentCard.countdown_timer_front && 
               currentCard.countdown_timer_back && 
               currentCard.countdown_behavior_front === 'flip' && 
               currentCard.countdown_behavior_back === 'flip' && (
                <div className="flex items-center gap-1 min-w-0">
                  <Label className="text-xs font-medium whitespace-nowrap">Flips:</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={currentCard.flips_before_next || 2}
                    onChange={(e) => onUpdateCard({ flips_before_next: parseInt(e.target.value) || 2 })}
                    className="w-10 sm:w-12 h-6 sm:h-7 text-xs"
                  />
                </div>
              )}
            </div>

            <Separator orientation="vertical" className="h-6 sm:h-7" />
          </>
        )}

        {/* Element Settings */}
        {selectedElement && (
          <>
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
              <Label className="text-xs sm:text-sm font-medium whitespace-nowrap">Pos:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="X"
              />
              <Input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="Y"
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
              <Label className="text-xs sm:text-sm font-medium whitespace-nowrap">Size:</Label>
              <Input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="W"
              />
              <Input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })}
                className="w-12 sm:w-14 h-6 sm:h-7 text-xs"
                placeholder="H"
              />
            </div>

            {/* Text Element Properties */}
            {selectedElement.type === 'text' && (
              <>
                <Separator orientation="vertical" className="h-6 sm:h-7" />
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
                  <Input
                    value={selectedElement.content || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                    className="w-20 sm:w-28 h-6 sm:h-7 text-xs"
                    placeholder="Text"
                  />
                  <Input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) || 16 })}
                    className="w-12 h-6 sm:h-7 text-xs"
                    placeholder="Size"
                  />
                  <Input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                    className="w-8 sm:w-10 h-6 sm:h-7"
                  />
                  <Select
                    value={selectedElement.textAlign || 'left'}
                    onValueChange={(value) => onUpdateElement(selectedElement.id, { textAlign: value as 'left' | 'center' | 'right' | 'justify' })}
                  >
                    <SelectTrigger className="w-12 sm:w-16 h-6 sm:h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">L</SelectItem>
                      <SelectItem value="center">C</SelectItem>
                      <SelectItem value="right">R</SelectItem>
                      <SelectItem value="justify">J</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Image Element Properties */}
            {selectedElement.type === 'image' && (
              <>
                <Separator orientation="vertical" className="h-6 sm:h-7" />
                <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink-0">
                  <Input
                    value={selectedElement.imageUrl || ''}
                    onChange={(e) => onUpdateElement(selectedElement.id, { imageUrl: e.target.value })}
                    className="w-32 sm:w-40 h-6 sm:h-7 text-xs"
                    placeholder="Image URL"
                  />
                </div>
              </>
            )}

            <Separator orientation="vertical" className="h-6 sm:h-7" />

            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteElement(selectedElement.id)}
              className="h-6 sm:h-7 px-2 text-xs shrink-0"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
