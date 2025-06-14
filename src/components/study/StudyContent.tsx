
import React from 'react';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
import { Flashcard } from '@/types/flashcard';

interface StudyContentProps {
  currentCard: Flashcard;
  showAnswer: boolean;
  hideHints: boolean;
  singleAttempt: boolean;
  answerResult: boolean | null;
  currentCardIndex: number;
  totalCards: number;
  activeTimer: number;
  onNavigate: (direction: 'prev' | 'next') => void;
  onFlipCard: () => void;
  onTimeUp: () => void;
  onAnswerSubmit: (elementId: string, correct: boolean, answerIndex: number) => void;
  onFillInBlankAnswer: (elementId: string, correct: boolean) => void;
}

export const StudyContent: React.FC<StudyContentProps> = ({
  currentCard,
  showAnswer,
  hideHints,
  singleAttempt,
  answerResult,
  currentCardIndex,
  totalCards,
  activeTimer,
  onNavigate,
  onFlipCard,
  onTimeUp,
  onAnswerSubmit,
  onFillInBlankAnswer,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-8">
          <div 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg"
            style={{ 
              width: `${currentCard.canvas_width || 600}px`,
              height: `${currentCard.canvas_height || 450}px`,
            }}
          >
            <StudyCardRenderer
              elements={showAnswer ? currentCard.back_elements : currentCard.front_elements}
              textScale={1}
              cardWidth={currentCard.canvas_width || 600}
              cardHeight={currentCard.canvas_height || 450}
              allowMultipleAttempts={!singleAttempt}
              onQuizAnswer={onAnswerSubmit}
              onFillInBlankAnswer={onFillInBlankAnswer}
            />
          </div>
        </div>

        {currentCard.hint && !hideHints && (
          <div className="text-sm text-muted-foreground flex justify-center mb-4">
            <div className="flex items-center">
              <Lightbulb className="w-4 h-4 mr-1" />
              {t('study.hint')}: {currentCard.hint}
            </div>
          </div>
        )}

        {answerResult !== null && (
          <div className={`flex items-center justify-center text-lg font-semibold mb-4 ${answerResult ? 'text-green-500' : 'text-red-500'}`}>
            {answerResult ? (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                {t('common.correct')}!
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 mr-2" />
                {t('common.incorrect')}.
              </>
            )}
          </div>
        )}
      </div>

      <StudyNavigationBar
        currentIndex={currentCardIndex}
        totalCards={totalCards}
        onNavigate={onNavigate}
        onFlipCard={onFlipCard}
        showAnswer={showAnswer}
        countdownTimer={activeTimer}
        onTimeUp={onTimeUp}
        allowNavigation={true}
      />
    </div>
  );
};
