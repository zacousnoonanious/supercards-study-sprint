
import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TextInputModal } from './TextInputModal';
import { CanvasElement } from '@/types/flashcard';

interface FillInBlankEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
}

type FillInBlankMode = 'every-nth' | 'random' | 'sentence-start' | 'manual' | 'significant-words';

export const FillInBlankEditor: React.FC<FillInBlankEditorProps> = ({
  element,
  onUpdate,
  textScale = 1
}) => {
  const [originalText, setOriginalText] = useState(element.fillInBlankText || '');
  const [blanks, setBlanks] = useState(element.fillInBlankBlanks || []);

  const updateParent = useCallback((updates: Partial<CanvasElement>) => {
    onUpdate(updates);
  }, [onUpdate]);

  const processAIGeneratedText = (text: string): string => {
    // Remove any underscore placeholders that might have been added by AI
    return text.replace(/_+/g, '').replace(/\s+/g, ' ').trim();
  };

  const handleTextChange = (text: string) => {
    // Process AI-generated text to remove underscores
    const cleanedText = processAIGeneratedText(text);
    setOriginalText(cleanedText);
    // Reset blanks when text changes significantly
    setBlanks([]);
    updateParent({
      fillInBlankText: cleanedText,
      fillInBlankBlanks: [],
    });
  };

  const handleWordDoubleClick = (word: string, position: number) => {
    const blankId = `blank_${Date.now()}`;
    const existingBlankIndex = blanks.findIndex(blank => blank.position === position);
    
    let newBlanks;
    if (existingBlankIndex >= 0) {
      // Remove blank if double-clicking on an already blanked word
      newBlanks = blanks.filter((_, index) => index !== existingBlankIndex);
    } else {
      // Add new blank
      newBlanks = [...blanks, { word, position, id: blankId }];
    }
    
    setBlanks(newBlanks);
    updateParent({
      fillInBlankText: originalText,
      fillInBlankBlanks: newBlanks,
    });
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
          <Label className="text-xs font-medium">Enter your text:</Label>
          <div className="space-y-2">
            <TextInputModal
              value={originalText}
              onSave={handleTextChange}
              placeholder="Type a sentence, paragraph, or multiple paragraphs here. This text area will expand as you type more content..."
              buttonText={originalText ? "Edit Text" : "Add Text"}
              title="Fill-in-the-Blank Text"
            />
            {originalText && (
              <div className="text-xs text-muted-foreground p-2 bg-gray-50 dark:bg-gray-900 rounded border">
                Preview: {originalText.substring(0, 100)}{originalText.length > 100 ? '...' : ''}
                <br />
                {originalText.length} characters • {originalText.trim().split(/\s+/).filter(w => w.length > 0).length} words
              </div>
            )}
          </div>
        </div>

        {originalText && (
          <div>
            <Label className="text-xs font-medium">
              Double-click words to turn into blanks:
            </Label>
            <div 
              className="p-2 border rounded min-h-[60px] max-h-[200px] overflow-y-auto text-xs leading-relaxed bg-gray-50 dark:bg-gray-900"
              style={{ fontSize: `${10 * textScale}px` }}
            >
              {renderTextWithBlanks()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tip: Double-click any word to toggle it as a blank. Configure advanced settings in the options panel.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
