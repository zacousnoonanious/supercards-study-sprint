
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Brain, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIFlashcardGeneratorProps {
  onAddElement?: (type: string) => void;
  selectedElement?: any;
  onUpdateElement?: (id: string, updates: any) => void;
  setId?: string;
  onGenerated?: () => void;
  mode?: string;
  onDeckCreated?: (deckId: string) => void;
}

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
  setId,
  onGenerated,
  mode = 'add-to-set',
  onDeckCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState([5]);
  const [style, setStyle] = useState('standard');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [quizPercentage, setQuizPercentage] = useState([30]);
  const [quizTypes, setQuizTypes] = useState({
    multipleChoice: true,
    trueFalse: true,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  const generateCards = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic for the flashcards.",
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
        description: "You must be logged in to generate cards.",
        variant: "destructive",
      });
      return;
    }

    // Validate quiz settings
    if (includeQuiz && !quizTypes.multipleChoice && !quizTypes.trueFalse) {
      toast({
        title: "Error",
        description: "Please select at least one quiz type if including quiz questions.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      let targetSetId = setId;

      // Create new deck if in create-new-deck mode
      if (mode === 'create-new-deck') {
        const { data: newSet, error: setError } = await supabase
          .from('flashcard_sets')
          .insert({
            title: deckTitle,
            description: deckDescription || `AI-generated educational content about ${topic}`,
            user_id: user.id,
          })
          .select()
          .single();

        if (setError) throw setError;
        targetSetId = newSet.id;
      }

      if (!targetSetId) {
        throw new Error('No set ID available for card generation');
      }

      // Call the edge function to generate flashcards
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: {
          prompt: topic,
          style,
          setId: targetSetId,
          userId: user.id,
          cardCount: cardCount[0],
          includeQuiz,
          quizPercentage: quizPercentage[0],
          quizTypes,
          mode,
        },
      });

      if (error) throw error;

      if (data.success) {
        const totalCards = data.cardCount || cardCount[0];
        const quizCards = data.quizCards || 0;
        const informationalCards = data.informationalCards || 0;
        
        toast({
          title: "Success",
          description: `Generated ${totalCards} cards successfully! (${informationalCards} informational, ${quizCards} quiz)`,
        });

        if (mode === 'create-new-deck' && onDeckCreated) {
          onDeckCreated(targetSetId);
        } else if (onGenerated) {
          onGenerated();
        }

        // Reset form
        setTopic('');
        setCardCount([5]);
        setDeckTitle('');
        setDeckDescription('');
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
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Educational Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {mode === 'create-new-deck' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deck-title">Deck Title</Label>
              <Input
                id="deck-title"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                placeholder="e.g., History of Castles, Introduction to Physics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deck-description">Description (Optional)</Label>
              <Input
                id="deck-description"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Brief description of this educational content..."
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="topic">Educational Topic</Label>
          <Textarea
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., 'History of Medieval Castles', 'Introduction to Photosynthesis', 'Roman Empire Timeline'"
            className="min-h-[80px]"
          />
          <p className="text-xs text-muted-foreground">
            The AI will create informational slides with images and quiz questions throughout the content.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Number of Cards: {cardCount[0]}</Label>
          <Slider
            value={cardCount}
            onValueChange={setCardCount}
            max={20}
            min={3}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>3</span>
            <span>20</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Content Style</Label>
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="funny">Engaging & Fun</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-quiz"
              checked={includeQuiz}
              onCheckedChange={(checked) => setIncludeQuiz(checked as boolean)}
            />
            <Label htmlFor="include-quiz" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Include Interactive Quiz Questions
            </Label>
          </div>

          {includeQuiz && (
            <div className="pl-6 space-y-4">
              <div className="space-y-2">
                <Label>Quiz Percentage: {quizPercentage[0]}%</Label>
                <Slider
                  value={quizPercentage}
                  onValueChange={setQuizPercentage}
                  max={50}
                  min={20}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>20%</span>
                  <span>50%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of cards that will be quiz questions (mixed throughout the content)
                </p>
              </div>

              <div className="space-y-2">
                <Label>Quiz Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="multiple-choice"
                      checked={quizTypes.multipleChoice}
                      onCheckedChange={(checked) =>
                        setQuizTypes(prev => ({ ...prev, multipleChoice: checked as boolean }))
                      }
                    />
                    <Label htmlFor="multiple-choice">Multiple Choice (4 options)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="true-false"
                      checked={quizTypes.trueFalse}
                      onCheckedChange={(checked) =>
                        setQuizTypes(prev => ({ ...prev, trueFalse: checked as boolean }))
                      }
                    />
                    <Label htmlFor="true-false">True/False</Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Quiz questions will be automatically positioned and include explanations
                </p>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={generateCards} 
          disabled={isGenerating || !topic.trim()} 
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating Educational Content...
            </>
          ) : (
            <>
              <BookOpen className="w-4 h-4 mr-2" />
              Generate {cardCount[0]} Educational Card{cardCount[0] !== 1 ? 's' : ''}
              {includeQuiz && ` (${Math.ceil((cardCount[0] * quizPercentage[0]) / 100)} quiz)`}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
