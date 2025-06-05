
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement } from '@/types/flashcard';

interface InteractiveCardCreatorProps {
  setId: string;
  onCardCreated: () => void;
  onClose: () => void;
}

export const InteractiveCardCreator: React.FC<InteractiveCardCreatorProps> = ({
  setId,
  onCardCreated,
  onClose,
}) => {
  const [cardType, setCardType] = useState<'standard' | 'informational' | 'no-back' | 'password-protected'>('standard');
  const [interactiveType, setInteractiveType] = useState<'none' | 'multiple-choice' | 'true-false' | 'fill-blank'>('none');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [password, setPassword] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Multiple choice options
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  // True/False
  const [tfAnswer, setTfAnswer] = useState(true);
  
  // Fill in the blank
  const [blankText, setBlankText] = useState('');
  const [blankAnswer, setBlankAnswer] = useState('');

  const { toast } = useToast();

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for AI generation.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-single-card', {
        body: {
          prompt: aiPrompt.trim(),
          cardType,
          interactiveType,
          setId,
        },
      });

      if (error) throw error;

      if (data.success) {
        setQuestion(data.card.question);
        setAnswer(data.card.answer);
        if (data.card.mcOptions) {
          setMcOptions(data.card.mcOptions);
          setCorrectAnswer(data.card.correctAnswer || 0);
        }
        toast({
          title: "Success",
          description: "Card content generated successfully!",
        });
      } else {
        throw new Error(data.error || 'Failed to generate card');
      }
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: "Error",
        description: "Failed to generate card content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createCard = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }

    let finalAnswer = answer;
    let interactiveData: any = {};

    // Handle interactive elements
    if (interactiveType === 'multiple-choice') {
      interactiveData = {
        options: mcOptions.filter(opt => opt.trim()),
        correctAnswer,
      };
      finalAnswer = mcOptions[correctAnswer] || answer;
    } else if (interactiveType === 'true-false') {
      interactiveData = { correctAnswer: tfAnswer };
      finalAnswer = tfAnswer.toString();
    } else if (interactiveType === 'fill-blank') {
      interactiveData = { 
        text: blankText,
        correctAnswer: blankAnswer 
      };
      finalAnswer = blankAnswer;
    }

    // Create default elements
    const defaultFrontElement: CanvasElement = {
      id: `front-text-${Date.now()}`,
      type: 'text',
      x: 150,
      y: 180,
      width: 300,
      height: 60,
      rotation: 0,
      content: question,
      fontSize: cardType === 'informational' ? 18 : 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center'
    };

    const defaultBackElement: CanvasElement = {
      id: `back-text-${Date.now()}`,
      type: 'text',
      x: 150,
      y: 180,
      width: 300,
      height: 60,
      rotation: 0,
      content: finalAnswer,
      fontSize: cardType === 'informational' ? 16 : 24,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center'
    };

    try {
      const cardData: any = {
        set_id: setId,
        question,
        answer: finalAnswer,
        hint: hint || null,
        front_elements: [defaultFrontElement],
        back_elements: cardType === 'no-back' ? [] : [defaultBackElement],
        card_type: cardType,
        interactive_type: interactiveType === 'none' ? null : interactiveType,
        interactive_data: Object.keys(interactiveData).length > 0 ? interactiveData : null,
      };

      if (cardType === 'password-protected' && password) {
        cardData.password = password;
      }

      const { error } = await supabase
        .from('flashcards')
        .insert(cardData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Card created successfully!",
      });
      
      onCardCreated();
      onClose();
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: "Error",
        description: "Failed to create card.",
        variant: "destructive",
      });
    }
  };

  const updateMcOption = (index: number, value: string) => {
    const newOptions = [...mcOptions];
    newOptions[index] = value;
    setMcOptions(newOptions);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Card</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Generation */}
        <div className="space-y-2">
          <Label>AI Card Generation (Optional)</Label>
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., 'Create a card about photosynthesis' or 'Make a multiple choice question about World War 2'"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateWithAI} disabled={isGenerating}>
              {isGenerating ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Card Type */}
        <div className="space-y-2">
          <Label>Card Type</Label>
          <Select value={cardType} onValueChange={setCardType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard Card</SelectItem>
              <SelectItem value="informational">Informational Card (Full View)</SelectItem>
              <SelectItem value="no-back">No Back Side</SelectItem>
              <SelectItem value="password-protected">Password Protected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Password field for protected cards */}
        {cardType === 'password-protected' && (
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter card password"
            />
          </div>
        )}

        {/* Interactive Type */}
        <div className="space-y-2">
          <Label>Interactive Elements</Label>
          <Select value={interactiveType} onValueChange={setInteractiveType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              <SelectItem value="true-false">True/False</SelectItem>
              <SelectItem value="fill-blank">Fill in the Blank</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question..."
            className={cardType === 'informational' ? 'min-h-[120px]' : 'min-h-[80px]'}
          />
        </div>

        {/* Interactive Elements Configuration */}
        {interactiveType === 'multiple-choice' && (
          <div className="space-y-4">
            <Label>Multiple Choice Options</Label>
            {mcOptions.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option}
                  onChange={(e) => updateMcOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                <Button
                  variant={correctAnswer === index ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCorrectAnswer(index)}
                >
                  Correct
                </Button>
              </div>
            ))}
          </div>
        )}

        {interactiveType === 'true-false' && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select value={tfAnswer.toString()} onValueChange={(value) => setTfAnswer(value === 'true')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {interactiveType === 'fill-blank' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Text with Blank (use _____ for the blank)</Label>
              <Textarea
                value={blankText}
                onChange={(e) => setBlankText(e.target.value)}
                placeholder="The capital of France is _____."
              />
            </div>
            <div className="space-y-2">
              <Label>Correct Answer for Blank</Label>
              <Input
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                placeholder="Paris"
              />
            </div>
          </div>
        )}

        {/* Answer (for non-interactive or fallback) */}
        {(interactiveType === 'none' || cardType !== 'no-back') && (
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer..."
              className={cardType === 'informational' ? 'min-h-[120px]' : 'min-h-[80px]'}
            />
          </div>
        )}

        {/* Hint */}
        <div className="space-y-2">
          <Label>Hint (Optional)</Label>
          <Input
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="Enter a helpful hint..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={createCard} className="flex-1">
            Create Card
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
