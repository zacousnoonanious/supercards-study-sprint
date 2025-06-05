
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Loader2, Brain } from 'lucide-react';

interface AIFlashcardGeneratorProps {
  setId?: string;
  onGenerated: () => void;
  mode?: 'add-to-set' | 'create-new-deck' | 'generate-quiz';
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
  const [includeQuiz, setIncludeQuiz] = useState(false);
  const [quizPercentage, setQuizPercentage] = useState(20);
  const [quizTypes, setQuizTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim() && mode !== 'generate-quiz') {
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

      const requestBody = {
        prompt: prompt.trim(),
        style,
        setId: targetSetId,
        userId: user.id,
        cardCount: mode === 'create-new-deck' ? cardCount : 5,
        includeQuiz: includeQuiz || mode === 'generate-quiz',
        quizPercentage: mode === 'generate-quiz' ? 100 : quizPercentage,
        quizTypes: quizTypes,
        mode: mode,
      };

      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: requestBody,
      });

      if (error) throw error;

      if (data.success) {
        const message = mode === 'generate-quiz' 
          ? `Generated ${data.cardCount || 5} quiz cards!`
          : mode === 'create-new-deck' 
            ? `Created new deck with ${data.cardCount || cardCount} flashcards${includeQuiz ? ' including quiz cards' : ''}!`
            : data.message;

        toast({
          title: "Success",
          description: message,
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

  const getTitle = () => {
    switch (mode) {
      case 'create-new-deck':
        return 'Create AI-Generated Deck';
      case 'generate-quiz':
        return 'Generate Quiz Cards';
      default:
        return 'AI Flashcard Generator';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'create-new-deck':
        return 'Create a complete flashcard deck automatically using AI. Describe a topic and choose how many cards to generate.';
      case 'generate-quiz':
        return 'Generate interactive quiz cards (multiple choice, true/false) based on your existing deck content or a new topic.';
      default:
        return 'Generate flashcards automatically using AI. Describe a topic and choose a style.';
    }
  };

  const getButtonText = () => {
    if (isGenerating) {
      switch (mode) {
        case 'create-new-deck':
          return 'Creating Deck...';
        case 'generate-quiz':
          return 'Generating Quiz...';
        default:
          return 'Generating...';
      }
    }
    
    switch (mode) {
      case 'create-new-deck':
        return `Create Deck with ${cardCount} Cards`;
      case 'generate-quiz':
        return 'Generate Quiz Cards';
      default:
        return 'Generate 5 Flashcards';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'generate-quiz' ? (
            <Brain className="h-5 w-5 text-blue-500" />
          ) : (
            <Sparkles className="h-5 w-5 text-yellow-500" />
          )}
          {getTitle()}
        </CardTitle>
        <CardDescription>
          {getDescription()}
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

        {mode !== 'generate-quiz' && (
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
        )}

        {mode === 'generate-quiz' && (
          <div>
            <Label htmlFor="quizPrompt">Quiz Topic (Optional)</Label>
            <Textarea
              id="quizPrompt"
              placeholder="Leave empty to generate quiz from existing cards, or specify a topic for new quiz questions"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
              disabled={isGenerating}
            />
          </div>
        )}

        {mode !== 'generate-quiz' && (
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
        )}

        {(mode === 'create-new-deck' || mode === 'generate-quiz') && (
          <div className="space-y-3">
            {mode === 'create-new-deck' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeQuiz"
                  checked={includeQuiz}
                  onCheckedChange={(checked) => setIncludeQuiz(checked as boolean)}
                  disabled={isGenerating}
                />
                <Label htmlFor="includeQuiz" className="text-sm font-medium">
                  Include quiz cards in the deck
                </Label>
              </div>
            )}

            {(includeQuiz || mode === 'generate-quiz') && (
              <>
                {mode === 'create-new-deck' && (
                  <div>
                    <Label htmlFor="quizPercentage">Quiz Card Percentage (10-50%)</Label>
                    <Input
                      id="quizPercentage"
                      type="number"
                      min="10"
                      max="50"
                      value={quizPercentage}
                      onChange={(e) => setQuizPercentage(Math.min(50, Math.max(10, parseInt(e.target.value) || 20)))}
                      disabled={isGenerating}
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Quiz Types</Label>
                  <div className="flex flex-col space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="multipleChoice"
                        checked={quizTypes.multipleChoice}
                        onCheckedChange={(checked) => 
                          setQuizTypes(prev => ({ ...prev, multipleChoice: checked as boolean }))
                        }
                        disabled={isGenerating}
                      />
                      <Label htmlFor="multipleChoice" className="text-sm">
                        Multiple Choice Questions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="trueFalse"
                        checked={quizTypes.trueFalse}
                        onCheckedChange={(checked) => 
                          setQuizTypes(prev => ({ ...prev, trueFalse: checked as boolean }))
                        }
                        disabled={isGenerating}
                      />
                      <Label htmlFor="trueFalse" className="text-sm">
                        True/False Questions
                      </Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || (mode !== 'generate-quiz' && !prompt.trim()) || (mode === 'create-new-deck' && !deckTitle.trim()) || (includeQuiz && !quizTypes.multipleChoice && !quizTypes.trueFalse)}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getButtonText()}
            </>
          ) : (
            <>
              {mode === 'generate-quiz' ? (
                <Brain className="mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {getButtonText()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
