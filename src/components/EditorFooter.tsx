
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
    
    const seconds = currentCard.countdown_timer;
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}min`;
    }
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
                    <SelectItem value="1">1s</SelectItem>
                    <SelectItem value="2">2s</SelectItem>
                    <SelectItem value="3">3s</SelectItem>
                    <SelectItem value="4">4s</SelectItem>
                    <SelectItem value="5">5s</SelectItem>
                    <SelectItem value="10">10s</SelectItem>
                    <SelectItem value="20">20s</SelectItem>
                    <SelectItem value="60">1min</SelectItem>
                    <SelectItem value="180">3min</SelectItem>
                    <SelectItem value="300">5min</SelectItem>
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

                {selectedElement.type === 'multiple-choice' && (
                  <div>
                    <Label className="text-xs">Question & Options</Label>
                    <Input
                      value={selectedElement.content || ''}
                      onChange={(e) => onUpdateElement(selectedElement.id, { content: e.target.value })}
                      placeholder="Enter question"
                      className="h-8 text-xs mb-2"
                    />
                    <div className="space-y-1">
                      {(selectedElement.multipleChoiceOptions || []).map((option, index) => (
                        <div key={index} className="flex gap-1 items-center">
                          <Input
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(selectedElement.multipleChoiceOptions || [])];
                              newOptions[index] = e.target.value;
                              onUpdateElement(selectedElement.id, { multipleChoiceOptions: newOptions });
                            }}
                            className="h-6 text-xs flex-1"
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            variant={selectedElement.correctAnswer === index ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onUpdateElement(selectedElement.id, { correctAnswer: index })}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            ✓
                          </Button>
                          {(selectedElement.multipleChoiceOptions?.length || 0) > 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newOptions = (selectedElement.multipleChoiceOptions || []).filter((_, i) => i !== index);
                                const currentCorrectAnswer = typeof selectedElement.correctAnswer === 'number' ? selectedElement.correctAnswer : 0;
                                const newCorrectAnswer = currentCorrectAnswer === index ? 0 : 
                                  currentCorrectAnswer > index ? currentCorrectAnswer - 1 : currentCorrectAnswer;
                                
                                // Auto-resize element when removing options
                                const newHeight = Math.max(120, 120 + (newOptions.length * 40));
                                
                                onUpdateElement(selectedElement.id, { 
                                  multipleChoiceOptions: newOptions,
                                  correctAnswer: newCorrectAnswer,
                                  height: newHeight
                                });
                              }}
                              className="h-6 w-6 p-0 text-red-500"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentOptions = selectedElement.multipleChoiceOptions || [];
                          const newOptions = [...currentOptions, `Option ${currentOptions.length + 1}`];
                          
                          // Auto-resize element when adding options
                          const newHeight = Math.max(selectedElement.height, 120 + (newOptions.length * 40));
                          
                          onUpdateElement(selectedElement.id, { 
                            multipleChoiceOptions: newOptions,
                            height: newHeight
                          });
                        }}
                        className="h-6 text-xs w-full"
                      >
                        + Add Option
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label htmlFor="x" className="text-xs">X</Label>
                    <Input
                      id="x"
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => onUpdateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="y" className="text-xs">Y</Label>
                    <Input
                      id="y"
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => onUpdateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-xs">W</Label>
                    <Input
                      id="width"
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => onUpdateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">H</Label>
                    <Input
                      id="height"
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => onUpdateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })}
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
              {selectedElement && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    // Delete selected element
                    const elementToDelete = selectedElement.id;
                    onUpdateElement(elementToDelete, {});
                    // This will trigger the delete in the parent component
                  }}
                  className="text-xs w-full"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete Element
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
