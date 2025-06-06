
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { CanvasElement } from '@/types/flashcard';

interface FillInBlankEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
}

export const FillInBlankEditor: React.FC<FillInBlankEditorProps> = ({
  element,
  onUpdate,
  textScale = 1
}) => {
  const [originalText, setOriginalText] = useState(element.fillInBlankText || '');
  const [blanks, setBlanks] = useState(element.fillInBlankBlanks || []);

  useEffect(() => {
    onUpdate({
      fillInBlankText: originalText,
      fillInBlankBlanks: blanks
    });
  }, [originalText, blanks, onUpdate]);

  const handleTextChange = (text: string) => {
    setOriginalText(text);
    // Reset blanks when text changes significantly
    setBlanks([]);
  };

  const handleWordDoubleClick = (word: string, position: number) => {
    const blankId = `blank_${Date.now()}`;
    const existingBlankIndex = blanks.findIndex(blank => blank.position === position);
    
    if (existingBlankIndex >= 0) {
      // Remove blank if double-clicking on an already blanked word
      setBlanks(blanks.filter((_, index) => index !== existingBlankIndex));
    } else {
      // Add new blank
      setBlanks([...blanks, { word, position, id: blankId }]);
    }
  };

  const renderTextWithBlanks = () => {
    if (!originalText) return null;

    const words = originalText.split(/(\s+)/);
    let wordIndex = 0;

    return words.map((segment, index) => {
      if (segment.trim()) {
        const currentWordIndex = wordIndex++;
        const isBlank = blanks.some(blank => blank.position === currentWordIndex);
        
        return (
          <span
            key={index}
            className={`cursor-pointer px-1 py-0.5 rounded transition-colors ${
              isBlank 
                ? 'bg-blue-200 text-blue-800 font-medium border border-blue-300' 
                : 'hover:bg-gray-100 border border-transparent'
            }`}
            onDoubleClick={() => handleWordDoubleClick(segment.trim(), currentWordIndex)}
            style={{ fontSize: `${12 * textScale}px` }}
            title="Double-click to toggle blank"
          >
            {segment}
          </span>
        );
      }
      return <span key={index}>{segment}</span>;
    });
  };

  return (
    <Card className="w-full h-full">
      <CardContent className="p-3 space-y-3">
        <div>
          <Label className="text-xs font-medium">Enter your sentence:</Label>
          <Textarea
            value={originalText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type a sentence and double-click words to turn them into blanks"
            className="h-20 text-xs resize-none"
          />
        </div>

        {originalText && (
          <div>
            <Label className="text-xs font-medium">Double-click words to turn into blanks:</Label>
            <div 
              className="p-2 border rounded min-h-[60px] text-xs leading-relaxed bg-gray-50 dark:bg-gray-900"
              style={{ fontSize: `${10 * textScale}px` }}
            >
              {renderTextWithBlanks()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tip: Double-click any word to toggle it as a blank
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Show letter count</Label>
          <Switch
            checked={element.showLetterCount || false}
            onCheckedChange={(checked) => onUpdate({ showLetterCount: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Ignore case</Label>
          <Switch
            checked={element.ignoreCase || false}
            onCheckedChange={(checked) => onUpdate({ ignoreCase: checked })}
          />
        </div>

        {blanks.length > 0 && (
          <div className="text-xs text-gray-600">
            {blanks.length} blank(s) created
          </div>
        )}
      </CardContent>
    </Card>
  );
};
