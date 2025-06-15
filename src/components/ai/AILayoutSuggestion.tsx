
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useToast } from '@/components/ui/use-toast';

interface AILayoutSuggestionProps {
  elements: CanvasElement[];
  cardWidth: number;
  cardHeight: number;
  onApplyLayout: (updatedElements: CanvasElement[]) => void;
}

export const AILayoutSuggestion: React.FC<AILayoutSuggestionProps> = ({
  elements,
  cardWidth,
  cardHeight,
  onApplyLayout,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeAndSuggestLayout = async () => {
    if (elements.length === 0) {
      toast({
        title: "No elements to reorganize",
        description: "Add some elements to your card first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Analyze content density and suggest optimal layout
      const textElements = elements.filter(el => el.type === 'text');
      const imageElements = elements.filter(el => el.type === 'image');
      const interactiveElements = elements.filter(el => ['multiple-choice', 'true-false', 'fill-in-blank'].includes(el.type));

      const updatedElements = [...elements];
      let yOffset = 20;
      const padding = 15;

      // Title/header text at top
      const titleElements = textElements.filter(el => (el.fontSize || 16) > 20);
      titleElements.forEach((element, index) => {
        const updatedElement = { ...element };
        updatedElement.x = (cardWidth - element.width) / 2; // Center horizontally
        updatedElement.y = yOffset;
        updatedElement.zIndex = 10 + index;
        yOffset += element.height + padding;
        
        const elementIndex = updatedElements.findIndex(el => el.id === element.id);
        if (elementIndex >= 0) {
          updatedElements[elementIndex] = updatedElement;
        }
      });

      // Images in left column
      imageElements.forEach((element, index) => {
        const updatedElement = { ...element };
        updatedElement.x = 20;
        updatedElement.y = yOffset;
        updatedElement.zIndex = 5 + index;
        yOffset += element.height + padding;
        
        const elementIndex = updatedElements.findIndex(el => el.id === element.id);
        if (elementIndex >= 0) {
          updatedElements[elementIndex] = updatedElement;
        }
      });

      // Body text in right column
      const bodyText = textElements.filter(el => (el.fontSize || 16) <= 20);
      let rightColumnY = titleElements.length > 0 ? titleElements[0].height + 40 : 20;
      const rightColumnX = imageElements.length > 0 ? Math.max(...imageElements.map(el => el.x + el.width)) + padding : 20;

      bodyText.forEach((element, index) => {
        const updatedElement = { ...element };
        updatedElement.x = rightColumnX;
        updatedElement.y = rightColumnY;
        updatedElement.zIndex = 3 + index;
        rightColumnY += element.height + padding;
        
        const elementIndex = updatedElements.findIndex(el => el.id === element.id);
        if (elementIndex >= 0) {
          updatedElements[elementIndex] = updatedElement;
        }
      });

      // Interactive elements at bottom
      let interactiveY = Math.max(yOffset, rightColumnY) + 20;
      interactiveElements.forEach((element, index) => {
        const updatedElement = { ...element };
        updatedElement.x = (cardWidth - element.width) / 2;
        updatedElement.y = interactiveY;
        updatedElement.zIndex = 1 + index;
        interactiveY += element.height + padding;
        
        const elementIndex = updatedElements.findIndex(el => el.id === element.id);
        if (elementIndex >= 0) {
          updatedElements[elementIndex] = updatedElement;
        }
      });

      onApplyLayout(updatedElements);
      
      toast({
        title: "Layout optimized!",
        description: "Elements have been reorganized based on content hierarchy.",
      });

    } catch (error) {
      console.error('Layout analysis error:', error);
      toast({
        title: "Layout analysis failed",
        description: "Could not analyze and reorganize layout.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <Button
            onClick={analyzeAndSuggestLayout}
            disabled={isAnalyzing}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'AI Layout'}
          </Button>
          <span className="text-xs text-gray-600">
            Reorganize elements based on content density
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
