
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIFlashcardGeneratorProps {
  setId: string;
  onGenerated: () => void;
}

const styleOptions = [
  { value: 'straightforward', label: 'Straightforward', description: 'Clear and direct explanations' },
  { value: 'funny', label: 'Funny', description: 'Humorous and entertaining content' },
  { value: 'analytical', label: 'Analytical', description: 'Detailed and thorough analysis' },
  { value: 'creative', label: 'Creative', description: 'Imaginative and metaphorical' },
  { value: 'concise', label: 'Concise', description: 'Brief and to-the-point' },
];

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  setId,
  onGenerated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('straightforward');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic or prompt for flashcard generation.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          prompt: prompt.trim(),
          style,
          setId,
          userId: user.id,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setPrompt('');
        onGenerated();
      } else {
        throw new Error(data.error || 'Failed to generate flashcards');
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Error",
        description: "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          AI Flashcard Generator
        </CardTitle>
        <CardDescription>
          Generate flashcards automatically using AI. Describe a topic and choose a style.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Topic or Prompt
          </label>
          <Textarea
            id="prompt"
            placeholder="e.g., 'French vocabulary for beginners', 'Key concepts in photosynthesis', 'JavaScript array methods'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
            disabled={isGenerating}
          />
        </div>

        <div>
          <label htmlFor="style" className="block text-sm font-medium mb-2">
            Generation Style
          </label>
          <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a style" />
            </SelectTrigger>
            <SelectContent>
              {styleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate 5 Flashcards
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
