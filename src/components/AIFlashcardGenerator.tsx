
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIFlashcardGeneratorProps {
  setId?: string;
  onGenerated: () => void;
  mode?: 'add-to-set' | 'create-new-deck';
  onDeckCreated?: (deckId: string) => void;
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
  mode = 'add-to-set',
  onDeckCreated,
}) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('straightforward');
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [cardCount, setCardCount] = useState(10);
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

    if (mode === 'create-new-deck' && !deckTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a deck title.",
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
      let targetSetId = setId;

      // If creating a new deck, create it first
      if (mode === 'create-new-deck') {
        const { data: newSet, error: setError } = await supabase
          .from('flashcard_sets')
          .insert({
            title: deckTitle.trim(),
            description: deckDescription.trim() || null,
            user_id: user.id,
          })
          .select()
          .single();

        if (setError) throw setError;
        targetSetId = newSet.id;
      }

      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          prompt: prompt.trim(),
          style,
          setId: targetSetId,
          userId: user.id,
          cardCount: mode === 'create-new-deck' ? cardCount : 5,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: mode === 'create-new-deck' 
            ? `Created new deck with ${data.cardCount || cardCount} flashcards!`
            : data.message,
        });
        
        setPrompt('');
        if (mode === 'create-new-deck') {
          setDeckTitle('');
          setDeckDescription('');
          if (onDeckCreated && targetSetId) {
            onDeckCreated(targetSetId);
          }
        }
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
          {mode === 'create-new-deck' ? 'Create AI-Generated Deck' : 'AI Flashcard Generator'}
        </CardTitle>
        <CardDescription>
          {mode === 'create-new-deck' 
            ? 'Create a complete flashcard deck automatically using AI. Describe a topic and choose how many cards to generate.'
            : 'Generate flashcards automatically using AI. Describe a topic and choose a style.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mode === 'create-new-deck' && (
          <>
            <div>
              <Label htmlFor="deckTitle">Deck Title</Label>
              <Input
                id="deckTitle"
                placeholder="e.g., Spanish Vocabulary, Biology Chapter 5"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <Label htmlFor="deckDescription">Description (Optional)</Label>
              <Input
                id="deckDescription"
                placeholder="Brief description of this deck..."
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <Label htmlFor="cardCount">Number of Cards (1-15)</Label>
              <Input
                id="cardCount"
                type="number"
                min="1"
                max="15"
                value={cardCount}
                onChange={(e) => setCardCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 1)))}
                disabled={isGenerating}
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="prompt">Topic or Prompt</Label>
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
          <Label htmlFor="style">Generation Style</Label>
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
          disabled={isGenerating || !prompt.trim() || (mode === 'create-new-deck' && !deckTitle.trim())}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create-new-deck' ? 'Creating Deck...' : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {mode === 'create-new-deck' 
                ? `Create Deck with ${cardCount} Cards` 
                : 'Generate 5 Flashcards'
              }
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
