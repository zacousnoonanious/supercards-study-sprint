
import React from 'react';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface EditorFooterProps {
  currentCard: Flashcard;
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onUpdateCard: (cardId: string, updates: Partial<Flashcard>) => void;
}

export const EditorFooter: React.FC<EditorFooterProps> = ({
  currentCard,
  selectedElement,
  onUpdateElement,
  onUpdateCard,
}) => {
  const handleCardUpdate = (field: keyof Flashcard, value: any) => {
    onUpdateCard(currentCard.id, { [field]: value });
  };

  const getCountdownDisplay = () => {
    if (!currentCard.countdown_timer || currentCard.countdown_timer === 0) {
      return 'No countdown';
    }
    return `${currentCard.countdown_timer} seconds`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 max-h-48 overflow-y-auto">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card Properties */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Card Properties</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="question" className="text-xs">Question</Label>
                <Input
                  id="question"
                  value={currentCard.question || ''}
                  onChange={(e) => handleCardUpdate('question', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="answer" className="text-xs">Answer</Label>
                <Input
                  id="answer"
                  value={currentCard.answer || ''}
                  onChange={(e) => handleCardUpdate('answer', e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="countdown" className="text-xs">Countdown Timer</Label>
                <Select
                  value={currentCard.countdown_timer?.toString() || '0'}
                  onValueChange={(value) => handleCardUpdate('countdown_timer', parseInt(value))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={getCountdownDisplay()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No countdown</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">60 seconds</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Element Properties */}
          {selectedElement && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Element Properties</h3>
              <div className="space-y-2">
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <Label htmlFor="content" className="text-xs">Content</Label>
                      <Input
                        id="content"
                        value={selectedElement.content || ''}
                        onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="fontSize" className="text-xs">Font Size</Label>
                        <Input
                          id="fontSize"
                          type="number"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: parseInt(e.target.value) })}
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="color" className="text-xs">Color</Label>
                        <Input
                          id="color"
                          type="color"
                          value={selectedElement.color || '#000000'}
                          onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {selectedElement.type === 'image' && (
                  <div>
                    <Label htmlFor="imageUrl" className="text-xs">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={selectedElement.imageUrl || ''}
                      onChange={(e) => onUpdateElement(selectedElement.id, { imageUrl: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label htmlFor="x" className="text-xs">X</Label>
                    <Input
                      id="x"
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y" className="text-xs">Y</Label>
                    <Input
                      id="y"
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={selectedElement.width}
                      onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={selectedElement.height}
                      onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) })}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Actions</h3>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Card Type: {currentCard.card_type || 'standard'}
              </div>
              <div className="text-xs text-muted-foreground">
                Timer: {getCountdownDisplay()}
              </div>
              {selectedElement && (
                <div className="text-xs text-muted-foreground">
                  Selected: {selectedElement.type} element
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
