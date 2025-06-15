import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Sparkles, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CanvasElement, CardTemplate } from '@/types/flashcard';
import { TemplateLibrary } from './TemplateLibrary';
import { useI18n } from '@/contexts/I18nContext';

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
  const { t } = useI18n();
  const [cardType, setCardType] = useState<'standard' | 'informational' | 'no-back' | 'password-protected'>('standard');
  const [interactiveType, setInteractiveType] = useState<'none' | 'multiple-choice' | 'true-false' | 'fill-in-blank'>('none');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [password, setPassword] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  
  // Multiple choice options
  const [mcOptions, setMcOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  
  // True/False
  const [tfAnswer, setTfAnswer] = useState(true);
  
  // Fill in the blank
  const [blankText, setBlankText] = useState('');
  const [blankAnswers, setBlankAnswers] = useState<string[]>(['']);

  const { toast } = useToast();

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: t('common.error'),
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
        
        if (data.card.fillInBlankText) {
          setBlankText(data.card.fillInBlankText);
          setBlankAnswers(data.card.fillInBlankAnswers || ['']);
        }
        
        toast({
          title: t('common.success'),
          description: t('editor.cardContentGenerated'),
        });
      } else {
        throw new Error(data.error || 'Failed to generate card');
      }
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: t('common.error'),
        description: t('editor.errorGeneratingCard'),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createCard = async () => {
    if (!question.trim()) {
      toast({
        title: t('common.error'),
        description: t('editor.questionRequiredError'),
        variant: "destructive",
      });
      return;
    }

    let finalAnswer = answer;
    let frontElements: CanvasElement[] = [];
    let backElements: CanvasElement[] = [];

    // Create elements based on interactive type
    if (interactiveType === 'fill-in-blank') {
      // Create fill-in-blank element for front
      const blanks = blankAnswers.map((answer, index) => ({
        word: answer.trim(),
        position: index,
        id: `blank_${Date.now()}_${index}`
      })).filter(blank => blank.word);

      const fillInBlankElement: CanvasElement = {
        id: `fill-blank-${Date.now()}`,
        type: 'fill-in-blank',
        x: 50,
        y: 100,
        width: 500,
        height: 200,
        fillInBlankText: blankText,
        fillInBlankBlanks: blanks,
        fillInBlankMode: true,
        showLetterCount: true,
        ignoreCase: true
      };

      frontElements = [fillInBlankElement];
      finalAnswer = blankAnswers.join(', ');
      
      // Add answer element to back
      const answerElement: CanvasElement = {
        id: `answer-text-${Date.now()}`,
        type: 'text',
        x: 150,
        y: 180,
        width: 300,
        height: 60,
        content: `${t('editor.answer')}: ${blankAnswers.join(', ')}`,
        fontSize: 18,
        color: '#000000',
        textAlign: 'center'
      };
      backElements = [answerElement];
      
    } else if (interactiveType === 'multiple-choice') {
      // Create multiple choice element
      const mcElement: CanvasElement = {
        id: `mc-${Date.now()}`,
        type: 'multiple-choice',
        x: 50,
        y: 80,
        width: 500,
        height: 300,
        content: question,
        multipleChoiceOptions: mcOptions.filter(opt => opt.trim()),
        correctAnswer,
        showImmediateFeedback: true
      };
      frontElements = [mcElement];
      finalAnswer = mcOptions[correctAnswer] || answer;
      
    } else if (interactiveType === 'true-false') {
      // Create true/false element
      const tfElement: CanvasElement = {
        id: `tf-${Date.now()}`,
        type: 'true-false',
        x: 50,
        y: 100,
        width: 500,
        height: 200,
        content: question,
        correctAnswer: tfAnswer ? 1 : 0,
        showImmediateFeedback: true
      };
      frontElements = [tfElement];
      finalAnswer = tfAnswer.toString();
      
    } else {
      // Standard text elements
      const questionElement: CanvasElement = {
        id: `front-text-${Date.now()}`,
        type: 'text',
        x: 150,
        y: 180,
        width: 300,
        height: 60,
        content: question,
        fontSize: cardType === 'informational' ? 18 : 24,
        color: '#000000',
        textAlign: 'center'
      };
      frontElements = [questionElement];

      if (cardType !== 'no-back') {
        const answerElement: CanvasElement = {
          id: `back-text-${Date.now()}`,
          type: 'text',
          x: 150,
          y: 180,
          width: 300,
          height: 60,
          content: finalAnswer,
          fontSize: cardType === 'informational' ? 16 : 24,
          color: '#000000',
          textAlign: 'center'
        };
        backElements = [answerElement];
      }
    }

    try {
      const cardData: any = {
        set_id: setId,
        question,
        answer: finalAnswer,
        hint: hint || null,
        front_elements: frontElements,
        back_elements: backElements,
        card_type: cardType,
        interactive_type: interactiveType === 'none' ? null : interactiveType,
      };

      if (cardType === 'password-protected' && password) {
        cardData.password = password;
      }

      const { error } = await supabase
        .from('flashcards')
        .insert(cardData);

      if (error) throw error;

      toast({
        title: t('common.success'),
        description: t('editor.cardCreatedSuccess'),
      });
      
      onCardCreated();
      onClose();
    } catch (error) {
      console.error('Error creating card:', error);
      toast({
        title: t('common.error'),
        description: t('editor.errorCreatingCard'),
        variant: "destructive",
      });
    }
  };

  const updateMcOption = (index: number, value: string) => {
    const newOptions = [...mcOptions];
    newOptions[index] = value;
    setMcOptions(newOptions);
  };

  const updateBlankAnswer = (index: number, value: string) => {
    const newAnswers = [...blankAnswers];
    newAnswers[index] = value;
    setBlankAnswers(newAnswers);
  };

  const addBlankAnswer = () => {
    setBlankAnswers([...blankAnswers, '']);
  };

  const removeBlankAnswer = (index: number) => {
    if (blankAnswers.length > 1) {
      setBlankAnswers(blankAnswers.filter((_, i) => i !== index));
    }
  };

  const handleCardTypeChange = (value: string) => {
    setCardType(value as 'standard' | 'informational' | 'no-back' | 'password-protected');
  };

  const handleInteractiveTypeChange = (value: string) => {
    setInteractiveType(value as 'none' | 'multiple-choice' | 'true-false' | 'fill-in-blank');
  };

  const handleTemplateSelect = (template: CardTemplate) => {
    // Create card from template
    const createCardFromTemplate = async () => {
      try {
        const cardData: any = {
          set_id: setId,
          question: template.name,
          answer: template.description,
          front_elements: template.front_elements,
          back_elements: template.back_elements || [],
          card_type: template.card_type,
          canvas_width: template.canvas_width,
          canvas_height: template.canvas_height,
        };

        const { error } = await supabase
          .from('flashcards')
          .insert(cardData);

        if (error) throw error;

        toast({
          title: t('common.success'),
          description: t('editor.cardCreatedSuccess'),
        });
        
        onCardCreated();
        onClose();
      } catch (error) {
        console.error('Error creating card from template:', error);
        toast({
          title: t('common.error'),
          description: t('editor.errorCreatingFromTemplate'),
          variant: "destructive",
        });
      }
    };

    createCardFromTemplate();
    setShowTemplateLibrary(false);
  };

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{t('toolbar.createNewCard')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Generation */}
          <div className="space-y-2">
            <Label>{t('editor.aiCardGenerationOptional')}</Label>
            <div className="flex gap-2">
              <Textarea
                placeholder={t('editor.aiPromptPlaceholder')}
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
            <Label>{t('editor.cardType')}</Label>
            <Select value={cardType} onValueChange={handleCardTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('toolbar.normal')}</SelectItem>
                <SelectItem value="informational">{t('toolbar.informational')}</SelectItem>
                <SelectItem value="no-back">{t('editor.noBackSide')}</SelectItem>
                <SelectItem value="password-protected">{t('toolbar.passwordProtected')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password field for protected cards */}
          {cardType === 'password-protected' && (
            <div className="space-y-2">
              <Label>{t('common.password')}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('editor.enterCardPassword')}
              />
            </div>
          )}

          {/* Interactive Type */}
          <div className="space-y-2">
            <Label>{t('editor.interactiveElements')}</Label>
            <Select value={interactiveType} onValueChange={handleInteractiveTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('common.none')}</SelectItem>
                <SelectItem value="multiple-choice">{t('toolbar.addMultipleChoice')}</SelectItem>
                <SelectItem value="true-false">{t('toolbar.addTrueFalse')}</SelectItem>
                <SelectItem value="fill-in-blank">{t('toolbar.addFillInBlank')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Question */}
          <div className="space-y-2">
            <Label>{t('editor.question')}</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('editor.questionPlaceholder')}
              className={cardType === 'informational' ? 'min-h-[120px]' : 'min-h-[80px]'}
            />
          </div>

          {/* Interactive Elements Configuration */}
          {interactiveType === 'multiple-choice' && (
            <div className="space-y-4">
              <Label>{t('editor.mcOptions')}</Label>
              {mcOptions.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={option}
                    onChange={(e) => updateMcOption(index, e.target.value)}
                    placeholder={t('editor.mcOptionPlaceholder', { index: index + 1 })}
                    className="flex-1"
                  />
                  <Button
                    variant={correctAnswer === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCorrectAnswer(index)}
                  >
                    {t('common.correct')}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {interactiveType === 'true-false' && (
            <div className="space-y-2">
              <Label>{t('editor.correctAnswer')}</Label>
              <Select value={tfAnswer.toString()} onValueChange={(value) => setTfAnswer(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">{t('editor.true')}</SelectItem>
                  <SelectItem value="false">{t('editor.false')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {interactiveType === 'fill-in-blank' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('editor.textWithBlanks')}</Label>
                <Textarea
                  value={blankText}
                  onChange={(e) => setBlankText(e.target.value)}
                  placeholder={t('editor.textWithBlanksPlaceholder')}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  {t('editor.textWithBlanksHint')}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>{t('editor.blankAnswers')}</Label>
                {blankAnswers.map((answer, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={answer}
                      onChange={(e) => updateBlankAnswer(index, e.target.value)}
                      placeholder={t('editor.blankAnswerPlaceholder', { index: index + 1 })}
                      className="flex-1"
                    />
                    {blankAnswers.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBlankAnswer(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBlankAnswer}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('editor.addAnotherBlank')}
                </Button>
              </div>
            </div>
          )}

          {/* Answer (for non-interactive or fallback) */}
          {(interactiveType === 'none' || cardType !== 'no-back') && (
            <div className="space-y-2">
              <Label>{t('editor.answer')}</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t('editor.answerPlaceholder')}
                className={cardType === 'informational' ? 'min-h-[120px]' : 'min-h-[80px]'}
              />
            </div>
          )}

          {/* Hint */}
          <div className="space-y-2">
            <Label>{t('editor.hintOptional')}</Label>
            <Input
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder={t('editor.hintPlaceholder')}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline" className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button onClick={createCard} className="flex-1">
                {t('editor.createCard')}
              </Button>
            </div>
            
            {/* Template Library Button */}
            <Button 
              onClick={() => setShowTemplateLibrary(true)} 
              variant="outline" 
              className="w-full flex items-center gap-2"
            >
              <LayoutTemplate className="w-4 h-4" />
              {t('editor.browseTemplates')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Library Dialog */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}
    </>
  );
};
