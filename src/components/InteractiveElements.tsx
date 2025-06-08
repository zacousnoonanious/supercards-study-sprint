import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, X } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ElementRendererProps {
  element: CanvasElement;
  isEditing: boolean;
  onUpdate?: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
  onAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showResults?: boolean;
  selectedAnswer?: number;
  allowMultipleAttempts?: boolean;
}

interface YouTubeRendererProps {
  element: CanvasElement;
}

export const MultipleChoiceRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isEditing, 
  onUpdate,
  textScale = 1,
  onAnswer,
  showResults = false,
  selectedAnswer,
  allowMultipleAttempts = true
}) => {
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editingOption, setEditingOption] = useState<number | null>(null);
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | null>(selectedAnswer ?? null);
  const options = element.multipleChoiceOptions || ['Option 1', 'Option 2'];
  
  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    
    // Auto-resize to fit new option
    const newHeight = Math.max(element.height, 120 + (newOptions.length * 40));
    onUpdate?.({ 
      multipleChoiceOptions: newOptions,
      height: newHeight
    });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Keep at least 2 options
    const newOptions = options.filter((_, i) => i !== index);
    const newCorrectAnswer = element.correctAnswer === index ? 0 : 
      (element.correctAnswer || 0) > index ? (element.correctAnswer || 0) - 1 : element.correctAnswer;
    
    // Auto-resize to fit remaining options
    const newHeight = Math.max(120, 120 + (newOptions.length * 40));
    onUpdate?.({ 
      multipleChoiceOptions: newOptions,
      correctAnswer: newCorrectAnswer,
      height: newHeight
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    onUpdate?.({ multipleChoiceOptions: newOptions });
  };

  const setCorrectAnswer = (index: number) => {
    onUpdate?.({ correctAnswer: index });
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isEditing && onAnswer) {
      setLocalSelectedAnswer(answerIndex);
      const correct = answerIndex === element.correctAnswer;
      onAnswer(element.id, correct, answerIndex);
    }
  };

  const getButtonVariant = (index: number) => {
    if (showResults && localSelectedAnswer !== null) {
      if (index === element.correctAnswer) {
        return 'default'; // Correct answer
      }
      if (localSelectedAnswer === index && index !== element.correctAnswer) {
        return 'destructive'; // Wrong selected answer
      }
    }
    return localSelectedAnswer === index ? 'default' : 'outline';
  };

  // Calculate minimum height needed for all content
  const minHeight = 120 + (options.length * 40);

  // Auto-resize if current height is too small
  React.useEffect(() => {
    if (element.height < minHeight) {
      onUpdate?.({ height: minHeight });
    }
  }, [options.length, element.height, minHeight, onUpdate]);

  return (
    <Card className="w-full h-full" style={{ minHeight: `${minHeight}px` }}>
      <CardContent className="p-3 space-y-3 h-full flex flex-col">
        {/* Question */}
        <div className="flex-shrink-0">
          <Label className="text-xs font-medium">Question:</Label>
          {editingQuestion ? (
            <Textarea
              value={element.content || ''}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate?.({ content: e.target.value });
              }}
              onBlur={() => setEditingQuestion(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setEditingQuestion(false);
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="h-16 text-xs resize-none"
              placeholder="Enter your question"
              autoFocus
            />
          ) : (
            <div 
              className="min-h-[40px] p-2 border rounded text-xs cursor-text hover:bg-gray-50 relative"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) setEditingQuestion(true);
              }}
            >
              {element.content ? (
                element.content
              ) : (
                <span className="text-gray-400 pointer-events-none select-none">
                  What is your question?
                </span>
              )}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="flex-1 space-y-2 overflow-auto">
          <Label className="text-xs font-medium">Options:</Label>
          <RadioGroup value={element.correctAnswer?.toString() || "0"} onValueChange={(value) => setCorrectAnswer(parseInt(value))}>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 group min-h-[32px]">
                {isEditing ? (
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`}
                    disabled={!isEditing}
                    className="flex-shrink-0"
                  />
                ) : (
                  <Button
                    variant={getButtonVariant(index)}
                    size="sm"
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResults && !allowMultipleAttempts}
                    className="w-full justify-start"
                  >
                    {option}
                  </Button>
                )}
                
                {isEditing && (
                  <>
                    {editingOption === index ? (
                      <Input
                        value={option}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateOption(index, e.target.value);
                        }}
                        onBlur={() => setEditingOption(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingOption(null);
                          }
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 h-7 text-xs"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="flex-1 text-xs cursor-pointer py-1 px-2 rounded hover:bg-gray-50 border border-transparent min-h-[28px] flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isEditing) setEditingOption(index);
                        }}
                      >
                        {option}
                      </div>
                    )}

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant={element.correctAnswer === index ? 'default' : 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCorrectAnswer(index);
                        }}
                        className="h-6 w-6 p-0"
                        title="Mark as correct answer"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      
                      {options.length > 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeOption(index);
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove option"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {element.correctAnswer === index && (
                      <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ Correct</span>
                    )}
                  </>
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                addOption();
              }}
              className="w-full text-xs h-7 mt-2"
            >
              + Add Option
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const TrueFalseRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isEditing,
  onUpdate,
  textScale = 1,
  onAnswer,
  showResults = false,
  selectedAnswer,
  allowMultipleAttempts = true
}) => {
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<number | null>(selectedAnswer ?? null);

  const handleAnswerSelect = (answerIndex: number) => {
    if (!isEditing && onAnswer) {
      setLocalSelectedAnswer(answerIndex);
      const correct = answerIndex === element.correctAnswer;
      onAnswer(element.id, correct, answerIndex);
    }
  };

  const getButtonVariant = (index: number) => {
    if (showResults && localSelectedAnswer !== null) {
      if (index === element.correctAnswer) {
        return 'default'; // Correct answer
      }
      if (localSelectedAnswer === index && index !== element.correctAnswer) {
        return 'destructive'; // Wrong selected answer
      }
    }
    return localSelectedAnswer === index ? 'default' : 'outline';
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="p-3 space-y-3">
        {/* Question */}
        <div>
          <Label className="text-xs font-medium">Question:</Label>
          {editingQuestion ? (
            <Textarea
              value={element.content || ''}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate?.({ content: e.target.value });
              }}
              onBlur={() => setEditingQuestion(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setEditingQuestion(false);
                }
                e.stopPropagation();
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="h-16 text-xs resize-none"
              placeholder="Enter your true/false question"
              autoFocus
            />
          ) : (
            <div 
              className="min-h-[40px] p-2 border rounded text-xs cursor-text hover:bg-gray-50 relative"
              onClick={(e) => {
                e.stopPropagation();
                if (isEditing) setEditingQuestion(true);
              }}
            >
              {element.content ? (
                element.content
              ) : (
                <span className="text-gray-400 pointer-events-none select-none">
                  What is your question?
                </span>
              )}
            </div>
          )}
        </div>

        {/* True/False Buttons */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button 
                variant={element.correctAnswer === 1 ? 'default' : 'outline'} 
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditing) onUpdate?.({ correctAnswer: 1 });
                }}
              >
                True {element.correctAnswer === 1 && '✓'}
              </Button>
              <Button 
                variant={element.correctAnswer === 0 ? 'default' : 'outline'} 
                size="sm"
                className="flex-1 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isEditing) onUpdate?.({ correctAnswer: 0 });
                }}
              >
                False {element.correctAnswer === 0 && '✓'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant={getButtonVariant(1)}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleAnswerSelect(1)}
                disabled={showResults && !allowMultipleAttempts}
              >
                True
              </Button>
              <Button 
                variant={getButtonVariant(0)}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleAnswerSelect(0)}
                disabled={showResults && !allowMultipleAttempts}
              >
                False
              </Button>
            </>
          )}
        </div>

        {isEditing && (
          <p className="text-xs text-gray-500">
            Click True or False to set the correct answer
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const YouTubeRenderer: React.FC<YouTubeRendererProps> = ({ element }) => {
  const getEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}${element.autoplay ? '?autoplay=1' : ''}`;
  };

  const embedUrl = element.youtubeUrl ? getEmbedUrl(element.youtubeUrl) : '';

  return (
    <Card className="w-full h-full">
      <CardContent className="p-2">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full rounded"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-100 rounded">
            YouTube Video
            <br />
            {element.youtubeUrl ? 'Invalid URL' : 'No URL set'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DeckEmbedRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-3">
        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-blue-50 rounded border-2 border-dashed border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-1">
            📚 Embedded Deck
          </div>
          {element.deckTitle && (
            <div className="text-xs text-blue-600 mb-2">{element.deckTitle}</div>
          )}
          {element.deckId ? (
            <div className="text-xs text-gray-500">ID: {element.deckId}</div>
          ) : (
            <div className="text-xs text-gray-400">No deck selected</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
