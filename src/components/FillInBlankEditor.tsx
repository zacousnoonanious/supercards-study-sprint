import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  const [mode, setMode] = useState<FillInBlankMode>(element.fillInBlankMode || 'manual');
  const [interval, setInterval] = useState(element.fillInBlankInterval || 3);
  const [percentage, setPercentage] = useState(element.fillInBlankPercentage || 25);

  const updateParent = useCallback((updates: Partial<CanvasElement>) => {
    onUpdate(updates);
  }, [onUpdate]);

  // Function to identify significant words (nouns, verbs, adjectives, etc.)
  const isSignificantWord = (word: string): boolean => {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    
    // Skip very short words
    if (cleanWord.length < 3) return false;
    
    // Skip common function words
    const functionWords = new Set([
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 
      'after', 'above', 'below', 'between', 'among', 'this', 'that', 'these', 
      'those', 'his', 'her', 'its', 'their', 'our', 'your', 'can', 'will', 
      'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'have', 
      'has', 'had', 'been', 'being', 'was', 'were', 'are', 'is', 'am'
    ]);
    
    return !functionWords.has(cleanWord);
  };

  const processAIGeneratedText = (text: string): string => {
    // Remove any underscore placeholders that might have been added by AI
    return text.replace(/_+/g, '').replace(/\s+/g, ' ').trim();
  };

  const generateBlanks = () => {
    if (!originalText.trim()) return;

    // Clean the text first to remove any AI-generated underscores
    const cleanedText = processAIGeneratedText(originalText);
    setOriginalText(cleanedText);

    const words = cleanedText.split(/(\s+)/);
    const wordIndices: number[] = [];
    let wordIndex = 0;

    // Get actual word positions (skip whitespace)
    words.forEach((segment, index) => {
      if (segment.trim()) {
        wordIndices.push(wordIndex++);
      }
    });

    let blanksToCreate: number[] = [];

    switch (mode) {
      case 'every-nth':
        blanksToCreate = wordIndices.filter((_, index) => (index + 1) % interval === 0);
        break;
      
      case 'random':
        const numBlanks = Math.ceil((wordIndices.length * percentage) / 100);
        const shuffled = [...wordIndices].sort(() => Math.random() - 0.5);
        blanksToCreate = shuffled.slice(0, numBlanks);
        break;
      
      case 'significant-words':
        const significantIndices: number[] = [];
        let currentWordIndex = 0;
        
        words.forEach((segment) => {
          if (segment.trim() && isSignificantWord(segment)) {
            significantIndices.push(currentWordIndex);
          }
          if (segment.trim()) {
            currentWordIndex++;
          }
        });
        
        const numSignificantBlanks = Math.ceil((significantIndices.length * percentage) / 100);
        const shuffledSignificant = [...significantIndices].sort(() => Math.random() - 0.5);
        blanksToCreate = shuffledSignificant.slice(0, numSignificantBlanks);
        break;
      
      case 'sentence-start':
        const sentences = cleanedText.split(/[.!?]+/);
        let currentWordIndex = 0;
        blanksToCreate = [];
        
        sentences.forEach(sentence => {
          const sentenceWords = sentence.trim().split(/\s+/).filter(w => w.length > 0);
          if (sentenceWords.length > 0) {
            blanksToCreate.push(currentWordIndex);
          }
          currentWordIndex += sentenceWords.length;
        });
        break;
    }

    // Create blank objects
    const newBlanks = blanksToCreate.map(wordPos => {
      const wordSegments = cleanedText.split(/(\s+)/);
      let currentWordIndex = 0;
      let word = '';
      
      for (const segment of wordSegments) {
        if (segment.trim()) {
          if (currentWordIndex === wordPos) {
            word = segment.trim();
            break;
          }
          currentWordIndex++;
        }
      }
      
      return {
        word: word,
        position: wordPos,
        id: `blank_${Date.now()}_${wordPos}`
      };
    });

    setBlanks(newBlanks);
    updateParent({
      fillInBlankText: cleanedText,
      fillInBlankBlanks: newBlanks,
      fillInBlankMode: mode,
      fillInBlankInterval: interval,
      fillInBlankPercentage: percentage
    });
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
      fillInBlankMode: mode,
      fillInBlankInterval: interval,
      fillInBlankPercentage: percentage
    });
  };

  const handleModeChange = (newMode: string) => {
    const typedMode = newMode as FillInBlankMode;
    setMode(typedMode);
    updateParent({
      fillInBlankText: originalText,
      fillInBlankBlanks: blanks,
      fillInBlankMode: typedMode,
      fillInBlankInterval: interval,
      fillInBlankPercentage: percentage
    });
  };

  const handleIntervalChange = (newInterval: number) => {
    setInterval(newInterval);
    updateParent({
      fillInBlankText: originalText,
      fillInBlankBlanks: blanks,
      fillInBlankMode: mode,
      fillInBlankInterval: newInterval,
      fillInBlankPercentage: percentage
    });
  };

  const handlePercentageChange = (newPercentage: number) => {
    setPercentage(newPercentage);
    updateParent({
      fillInBlankText: originalText,
      fillInBlankBlanks: blanks,
      fillInBlankMode: mode,
      fillInBlankInterval: interval,
      fillInBlankPercentage: newPercentage
    });
  };

  const handleWordDoubleClick = (word: string, position: number) => {
    if (mode !== 'manual') return;
    
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
      fillInBlankMode: mode,
      fillInBlankInterval: interval,
      fillInBlankPercentage: percentage
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
            } ${mode !== 'manual' ? 'pointer-events-none' : ''}`}
            onDoubleClick={() => mode === 'manual' && handleWordDoubleClick(segment.trim(), currentWordIndex)}
            style={{ fontSize: `${12 * textScale}px` }}
            title={mode === 'manual' ? "Double-click to toggle blank" : ""}
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

        <div>
          <Label className="text-xs font-medium">Blank creation mode:</Label>
          <Select value={mode} onValueChange={handleModeChange}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual (double-click words)</SelectItem>
              <SelectItem value="every-nth">Every Nth word</SelectItem>
              <SelectItem value="random">Random percentage</SelectItem>
              <SelectItem value="significant-words">Significant words only</SelectItem>
              <SelectItem value="sentence-start">Start of sentences</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {mode === 'every-nth' && (
          <div>
            <Label className="text-xs font-medium">Every {interval} words:</Label>
            <Slider
              value={[interval]}
              onValueChange={(values) => setInterval(values[0])}
              min={2}
              max={10}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {(mode === 'random' || mode === 'significant-words') && (
          <div>
            <Label className="text-xs font-medium">
              {mode === 'significant-words' ? 'Percentage of significant words' : 'Percentage to blank'}: {percentage}%
            </Label>
            <Slider
              value={[percentage]}
              onValueChange={(values) => setPercentage(values[0])}
              min={10}
              max={80}
              step={5}
              className="w-full"
            />
          </div>
        )}

        {mode !== 'manual' && originalText && (
          <Button
            onClick={generateBlanks}
            size="sm"
            className="w-full text-xs"
          >
            Generate Blanks
          </Button>
        )}

        {originalText && (
          <div>
            <Label className="text-xs font-medium">
              {mode === 'manual' ? 'Double-click words to turn into blanks:' : 'Preview:'}
            </Label>
            <div 
              className="p-2 border rounded min-h-[60px] max-h-[200px] overflow-y-auto text-xs leading-relaxed bg-gray-50 dark:bg-gray-900"
              style={{ fontSize: `${10 * textScale}px` }}
            >
              {renderTextWithBlanks()}
            </div>
            {mode === 'manual' && (
              <p className="text-xs text-gray-500 mt-1">
                Tip: Double-click any word to toggle it as a blank
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Show letter count</Label>
          <Switch
            checked={element.showLetterCount || false}
            onCheckedChange={(checked) => updateParent({ showLetterCount: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Ignore case</Label>
          <Switch
            checked={element.ignoreCase || false}
            onCheckedChange={(checked) => updateParent({ ignoreCase: checked })}
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
