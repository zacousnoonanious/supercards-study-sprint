
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  AlignCenter, 
  AlignLeft, 
  AlignRight, 
  Grid, 
  Layers, 
  Palette,
  Brain,
  RotateCcw,
  CheckSquare
} from 'lucide-react';
import { Flashcard, CanvasElement } from '@/types/flashcard';

interface BulkCardOperationsProps {
  selectedCards: string[];
  cards: Flashcard[];
  onClearSelection: () => void;
  onBulkUpdate: (cardIds: string[], updates: any) => void;
  onAutoArrange: (cardIds: string[], arrangeType: string) => void;
}

export const BulkCardOperations: React.FC<BulkCardOperationsProps> = ({
  selectedCards,
  cards,
  onClearSelection,
  onBulkUpdate,
  onAutoArrange,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTextAlignment = (alignment: 'left' | 'center' | 'right') => {
    const updates = {
      updateElements: true,
      elementUpdates: {
        textAlign: alignment
      },
      elementType: 'text'
    };
    onBulkUpdate(selectedCards, updates);
  };

  const handleAutoArrange = (type: 'grid' | 'center' | 'stack' | 'justify') => {
    onAutoArrange(selectedCards, type);
  };

  const handleThemeChange = (theme: string) => {
    // This would apply theme-related styling to all elements
    const updates = {
      updateElements: true,
      elementUpdates: {
        color: theme === 'dark' ? '#ffffff' : '#000000'
      }
    };
    onBulkUpdate(selectedCards, updates);
  };

  const handleAIAnalysis = async () => {
    setIsProcessing(true);
    // Placeholder for AI analysis functionality
    console.log('AI Analysis for cards:', selectedCards);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-lg z-50 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Bulk Operations
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            ✕
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedCards.length} cards selected</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Text Alignment */}
        <div>
          <h4 className="text-sm font-medium mb-2">Text Alignment</h4>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTextAlignment('left')}
              className="flex-1"
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTextAlignment('center')}
              className="flex-1"
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTextAlignment('right')}
              className="flex-1"
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Separator />

        {/* Auto Arrange */}
        <div>
          <h4 className="text-sm font-medium mb-2">Auto Arrange Elements</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoArrange('grid')}
              className="flex items-center gap-1"
            >
              <Grid className="w-3 h-3" />
              Grid
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoArrange('center')}
              className="flex items-center gap-1"
            >
              <AlignCenter className="w-3 h-3" />
              Center
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoArrange('stack')}
              className="flex items-center gap-1"
            >
              <Layers className="w-3 h-3" />
              Stack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoArrange('justify')}
              className="flex items-center gap-1"
            >
              <AlignCenter className="w-3 h-3" />
              Justify
            </Button>
          </div>
        </div>

        <Separator />

        {/* Theme Operations */}
        <div>
          <h4 className="text-sm font-medium mb-2">Theme</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleThemeChange('light')}
              className="flex-1"
            >
              Light
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleThemeChange('dark')}
              className="flex-1"
            >
              Dark
            </Button>
          </div>
        </div>

        <Separator />

        {/* AI Operations */}
        <div>
          <h4 className="text-sm font-medium mb-2">AI Operations</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAIAnalysis}
            disabled={isProcessing}
            className="w-full flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            {isProcessing ? 'Analyzing...' : 'AI Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
