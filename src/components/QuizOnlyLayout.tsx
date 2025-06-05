
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface QuizOnlyLayoutProps {
  elements: CanvasElement[];
  onAddElement: (type: string, position: number) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  title: string;
  onTitleChange: (title: string) => void;
  textScale?: number;
}

export const QuizOnlyLayout: React.FC<QuizOnlyLayoutProps> = ({
  elements,
  onAddElement,
  onUpdateElement,
  title,
  onTitleChange,
  textScale = 1
}) => {
  const getElementInPosition = (position: number) => {
    return elements.find(el => el.zIndex === position);
  };

  const renderQuadrant = (position: number) => {
    const element = getElementInPosition(position);
    const quadrantLabels = ['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right'];
    
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col">
        <div className="text-xs text-gray-500 mb-2">{quadrantLabels[position]}</div>
        
        {element ? (
          <div className="flex-1">
            {element.type === 'multiple-choice' && (
              <div className="space-y-2">
                <Input
                  value={element.content || ''}
                  onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                  placeholder="Question..."
                  className="h-8 text-xs"
                />
                {(element.multipleChoiceOptions || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={element.correctAnswer === index}
                      onChange={() => onUpdateElement(element.id, { correctAnswer: index })}
                      className="w-3 h-3"
                    />
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(element.multipleChoiceOptions || [])];
                        newOptions[index] = e.target.value;
                        onUpdateElement(element.id, { multipleChoiceOptions: newOptions });
                      }}
                      className="h-6 text-xs flex-1"
                      placeholder={`Option ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {element.type === 'true-false' && (
              <div className="space-y-2">
                <Input
                  value={element.content || ''}
                  onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                  placeholder="True/False statement..."
                  className="h-8 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    variant={element.correctAnswer === 1 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateElement(element.id, { correctAnswer: 1 })}
                    className="text-xs"
                  >
                    True ✓
                  </Button>
                  <Button
                    variant={element.correctAnswer === 0 ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdateElement(element.id, { correctAnswer: 0 })}
                    className="text-xs"
                  >
                    False ✓
                  </Button>
                </div>
              </div>
            )}
            
            {element.type === 'fill-in-blank' && (
              <div className="text-xs text-gray-600">
                Fill-in-blank element (edit in toolbar)
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-2">
            <p className="text-xs text-gray-400 text-center mb-3">Add a quiz element:</p>
            <div className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddElement('multiple-choice', position)}
                className="text-xs w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Multiple Choice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddElement('true-false', position)}
                className="text-xs w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                True/False
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddElement('fill-in-blank', position)}
                className="text-xs w-full"
              >
                <Plus className="w-3 h-3 mr-1" />
                Fill in Blank
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 space-y-4">
      <div>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Quiz Title..."
          className="text-lg font-semibold h-12"
          style={{ fontSize: `${16 * textScale}px` }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 h-[calc(100%-80px)]">
        {[0, 1, 2, 3].map(position => (
          <div key={position}>
            {renderQuadrant(position)}
          </div>
        ))}
      </div>
    </div>
  );
};
