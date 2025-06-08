import React, { useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { StudyCardRenderer } from './StudyCardRenderer';

interface StudyModeContentProps {
  currentCard: Flashcard;
  showPanelView: boolean;
  showAnswer: boolean;
  showHint: boolean;
  onRevealAnswer: () => void;
  onToggleHint: () => void;
  onAnswer: (correct: boolean) => void;
  onFlipCard: () => void;
  onFillInBlankAnswer?: (elementId: string, correct: boolean) => void;
  fillInBlankResults?: {[elementId: string]: boolean};
}

export const StudyModeContent: React.FC<StudyModeContentProps> = ({
  currentCard,
  showPanelView,
  showAnswer,
  showHint,
  onRevealAnswer,
  onToggleHint,
  onAnswer,
  onFlipCard,
  onFillInBlankAnswer,
  fillInBlankResults = {},
}) => {
  const { t } = useI18n();
  const [quizAnswers, setQuizAnswers] = useState<{[elementId: string]: number}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  
  const hasFillInBlank = currentCard.front_elements?.some(el => el.type === 'fill-in-blank') || 
                        currentCard.back_elements?.some(el => el.type === 'fill-in-blank');

  const hasInteractiveElements = currentCard.front_elements?.some(el => 
    el.type === 'multiple-choice' || el.type === 'true-false'
  ) || currentCard.back_elements?.some(el => 
    el.type === 'multiple-choice' || el.type === 'true-false'
  );

  const handleQuizAnswer = (elementId: string, correct: boolean, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [elementId]: answerIndex }));
    setShowQuizResults(true);
    
    // Auto-advance after a delay if configured
    setTimeout(() => {
      onAnswer(correct);
    }, 2000);
  };

  const renderCard = (elements: CanvasElement[], side: 'front' | 'back') => (
    <StudyCardRenderer
      elements={elements}
      className="w-full h-full"
      onQuizAnswer={handleQuizAnswer}
      showQuizResults={showQuizResults}
      quizAnswers={quizAnswers}
      onFillInBlankAnswer={onFillInBlankAnswer}
      fillInBlankResults={fillInBlankResults}
      textScale={1}
      cardWidth={currentCard.canvas_width || 600}
      cardHeight={currentCard.canvas_height || 400}
      isInformationalCard={currentCard.card_type === 'informational'}
    />
  );

  if (showPanelView) {
    return (
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">{t('editor.frontSide')}</h3>
          <Card className="w-full aspect-[3/2]">
            <CardContent className="p-0 h-full">
              {renderCard(currentCard.front_elements || [], 'front')}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center">{t('editor.backSide')}</h3>
          <Card className="w-full aspect-[3/2]">
            <CardContent className="p-0 h-full">
              {renderCard(currentCard.back_elements || [], 'back')}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Single card view with flip animation
  if (currentCard.card_type === 'single-sided' || currentCard.card_type === 'informational') {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="w-full aspect-[3/2]">
          <CardContent className="p-0 h-full">
            {renderCard(currentCard.front_elements || [], 'front')}
          </CardContent>
        </Card>
        
        {currentCard.hint && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleHint}
              className="gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showHint ? t('study.hideHint') : t('study.showHint')}
            </Button>
            {showHint && (
              <Card className="mt-2">
                <CardContent className="p-3">
                  <p className="text-sm text-muted-foreground">{currentCard.hint}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative w-full aspect-[3/2] preserve-3d transition-transform duration-700" 
           style={{ 
             transform: showAnswer ? 'rotateY(180deg)' : 'rotateY(0deg)',
             transformStyle: 'preserve-3d'
           }}>
        
        {/* Front of card */}
        <Card className="absolute inset-0 backface-hidden">
          <CardContent className="p-0 h-full">
            {renderCard(currentCard.front_elements || [], 'front')}
          </CardContent>
        </Card>
        
        {/* Back of card */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180">
          <CardContent className="p-0 h-full">
            {renderCard(currentCard.back_elements || [], 'back')}
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="mt-6 flex flex-col items-center gap-4">
        {currentCard.hint && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleHint}
            className="gap-2"
          >
            <Lightbulb className="w-4 h-4" />
            {showHint ? t('study.hideHint') : t('study.showHint')}
          </Button>
        )}
        
        {showHint && currentCard.hint && (
          <Card className="w-full max-w-md">
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground text-center">{currentCard.hint}</p>
            </CardContent>
          </Card>
        )}

        {!showAnswer && !hasInteractiveElements && !hasFillInBlank && (
          <Button onClick={onRevealAnswer} className="gap-2">
            <Eye className="w-4 h-4" />
            {t('study.revealAnswer')}
          </Button>
        )}

        {showAnswer && !hasInteractiveElements && !hasFillInBlank && (
          <div className="flex gap-3">
            <Button
              onClick={() => onAnswer(false)}
              variant="outline"
              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4" />
              {t('study.incorrect')}
            </Button>
            <Button
              onClick={() => onAnswer(true)}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4" />
              {t('study.correct')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
