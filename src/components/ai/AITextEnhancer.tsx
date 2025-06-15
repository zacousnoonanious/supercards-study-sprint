
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';
import { useToast } from '@/components/ui/use-toast';

interface AITextEnhancerProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}

export const AITextEnhancer: React.FC<AITextEnhancerProps> = ({
  element,
  onUpdate,
  onClose,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');
  const [enhancementType, setEnhancementType] = useState('clarity');
  const { toast } = useToast();

  const enhanceText = async () => {
    if (!element.content) {
      toast({
        title: "No text to enhance",
        description: "Please add some text content first.",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      // Simulate AI text enhancement based on type
      let enhanced = '';
      const originalText = element.content;

      switch (enhancementType) {
        case 'clarity':
          enhanced = await simulateTextClarity(originalText);
          break;
        case 'examples':
          enhanced = await simulateAddExamples(originalText);
          break;
        case 'analogies':
          enhanced = await simulateAddAnalogies(originalText);
          break;
        case 'simplify':
          enhanced = await simulateSimplify(originalText);
          break;
        default:
          enhanced = originalText;
      }

      setEnhancedText(enhanced);
      
      toast({
        title: "Text enhanced!",
        description: "Review the suggested improvements below.",
      });

    } catch (error) {
      console.error('Text enhancement error:', error);
      toast({
        title: "Enhancement failed",
        description: "Could not enhance the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Simulate AI text enhancement functions
  const simulateTextClarity = async (text: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple text clarity improvements
    return text
      .replace(/\b(um|uh|like|you know)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split('. ')
      .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
      .join('. ')
      .replace(/\. $/, '.');
  };

  const simulateAddExamples = async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (text.toLowerCase().includes('photosynthesis')) {
      return `${text}\n\nFor example: When a plant leaf absorbs sunlight, it uses that energy to convert carbon dioxide from the air and water from the roots into glucose sugar.`;
    }
    
    return `${text}\n\nFor example: [This concept can be seen when...]`;
  };

  const simulateAddAnalogies = async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (text.toLowerCase().includes('memory')) {
      return `${text}\n\nThink of memory like a library: information is stored in different sections, and you need the right "address" to find what you're looking for.`;
    }
    
    return `${text}\n\nThis is like [familiar concept]: [explanation of similarity].`;
  };

  const simulateSimplify = async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return text
      .replace(/utilize/gi, 'use')
      .replace(/facilitate/gi, 'help')
      .replace(/commence/gi, 'start')
      .replace(/approximately/gi, 'about')
      .replace(/subsequently/gi, 'then');
  };

  const applyEnhancement = () => {
    onUpdate({ content: enhancedText });
    onClose();
    toast({
      title: "Text updated!",
      description: "Enhanced text has been applied to your element.",
    });
  };

  return (
    <Card className="w-96 max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5" />
          AI Text Enhancer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Enhancement Type</label>
          <Select value={enhancementType} onValueChange={setEnhancementType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clarity">Improve Clarity</SelectItem>
              <SelectItem value="examples">Add Examples</SelectItem>
              <SelectItem value="analogies">Add Analogies</SelectItem>
              <SelectItem value="simplify">Simplify Language</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Original Text</label>
          <Textarea
            value={element.content || ''}
            readOnly
            className="min-h-20 bg-gray-50"
          />
        </div>

        {enhancedText && (
          <div>
            <label className="text-sm font-medium mb-2 block">Enhanced Text</label>
            <Textarea
              value={enhancedText}
              onChange={(e) => setEnhancedText(e.target.value)}
              className="min-h-24"
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={enhanceText}
            disabled={isEnhancing}
            className="flex-1"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Enhance
              </>
            )}
          </Button>
        </div>

        {enhancedText && (
          <div className="flex gap-2">
            <Button onClick={applyEnhancement} size="sm" className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              Apply
            </Button>
            <Button onClick={onClose} variant="outline" size="sm" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
