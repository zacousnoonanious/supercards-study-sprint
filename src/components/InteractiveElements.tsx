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
}

interface YouTubeRendererProps {
  element: CanvasElement;
}

export const MultipleChoiceRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isEditing, 
  onUpdate,
  textScale = 1
}) => {
  const [editingQuestion, setEditingQuestion] = useState(false);
  const [editingOption, setEditingOption] = useState<number | null>(null);
  const options = element.multipleChoiceOptions || ['Option 1', 'Option 2'];
  
  const addOption = () => {
    const newOptions = [...options, `Option ${options.length + 1}`];
    onUpdate?.({ multipleChoiceOptions: newOptions });
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Keep at least 2 options
    const newOptions = options.filter((_, i) => i !== index);
    const newCorrectAnswer = element.correctAnswer === index ? 0 : 
      element.correctAnswer > index ? element.correctAnswer - 1 : element.correctAnswer;
    onUpdate?.({ 
      multipleChoiceOptions: newOptions,
      correctAnswer: newCorrectAnswer
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

  return (
    <Card className="w-full h-full">
      <CardContent className="p-3 space-y-3">
        {/* Question */}
        <div>
          <Label className="text-xs font-medium">Question:</Label>
          {editingQuestion ? (
            <Textarea
              value={element.content || ''}
              onChange={(e) => onUpdate?.({ content: e.target.value })}
              onBlur={() => setEditingQuestion(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setEditingQuestion(false);
                }
              }}
              className="h-16 text-xs resize-none"
              placeholder="Enter your question"
              autoFocus
            />
          ) : (
            <div 
              className="min-h-[40px] p-2 border rounded text-xs cursor-text hover:bg-gray-50"
              onClick={() => isEditing && setEditingQuestion(true)}
            >
              {element.content || 'Click to add question'}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Options:</Label>
          <RadioGroup value={element.correctAnswer?.toString() || "0"} onValueChange={(value) => setCorrectAnswer(parseInt(value))}>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 group">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  disabled={!isEditing}
                />
                
                {editingOption === index ? (
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    onBlur={() => setEditingOption(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setEditingOption(null);
                      }
                    }}
                    className="flex-1 h-7 text-xs"
                    autoFocus
                  />
                ) : (
                  <div 
                    className="flex-1 text-xs cursor-pointer py-1 px-2 rounded hover:bg-gray-50 border border-transparent"
                    onClick={() => isEditing && setEditingOption(index)}
                  >
                    {option}
                  </div>
                )}

                {isEditing && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant={element.correctAnswer === index ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCorrectAnswer(index)}
                      className="h-6 w-6 p-0"
                      title="Mark as correct answer"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    
                    {options.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove option"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}

                {isEditing && element.correctAnswer === index && (
                  <span className="text-xs text-green-600 font-medium">✓ Correct</span>
                )}
              </div>
            ))}
          </RadioGroup>
          
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full text-xs h-7"
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
  textScale = 1
}) => {
  const [editingQuestion, setEditingQuestion] = useState(false);

  return (
    <Card className="w-full h-full">
      <CardContent className="p-3 space-y-3">
        {/* Question */}
        <div>
          <Label className="text-xs font-medium">Question:</Label>
          {editingQuestion ? (
            <Textarea
              value={element.content || ''}
              onChange={(e) => onUpdate?.({ content: e.target.value })}
              onBlur={() => setEditingQuestion(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  setEditingQuestion(false);
                }
              }}
              className="h-16 text-xs resize-none"
              placeholder="Enter your true/false question"
              autoFocus
            />
          ) : (
            <div 
              className="min-h-[40px] p-2 border rounded text-xs cursor-text hover:bg-gray-50"
              onClick={() => isEditing && setEditingQuestion(true)}
            >
              {element.content || 'Click to add question'}
            </div>
          )}
        </div>

        {/* True/False Buttons */}
        <div className="flex gap-2">
          <Button 
            variant={element.correctAnswer === 1 ? 'default' : 'outline'} 
            size="sm"
            className="flex-1 text-xs"
            onClick={() => isEditing && onUpdate?.({ correctAnswer: 1 })}
          >
            True {isEditing && element.correctAnswer === 1 && '✓'}
          </Button>
          <Button 
            variant={element.correctAnswer === 0 ? 'default' : 'outline'} 
            size="sm"
            className="flex-1 text-xs"
            onClick={() => isEditing && onUpdate?.({ correctAnswer: 0 })}
          >
            False {isEditing && element.correctAnswer === 0 && '✓'}
          </Button>
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
