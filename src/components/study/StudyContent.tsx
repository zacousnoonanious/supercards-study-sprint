
import React, { useState } from 'react';
import { Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { StudyNavigationBar } from '@/components/StudyNavigationBar';
import { EmbeddedDeckPopup } from '@/components/study/EmbeddedDeckPopup';
import { TimerCountdown } from '@/components/TimerCountdown';
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
  const [embeddedDeckId, setEmbeddedDeckId] = useState<string | null>(null);

  const handleElementLink = (elementId: string, linkData: any) => {
    console.log('Element link triggered:', elementId, linkData);
    
    if (linkData.type === 'card-jump') {
      // Handle jumping to another card
      console.log('Jump to card:', linkData.targetCardId);
    } else if (linkData.type === 'action') {
      if (linkData.actionType === 'embed-deck') {
        setEmbeddedDeckId(linkData.actionData);
      } else if (linkData.actionType === 'play-audio') {
        // Handle audio playback
        console.log('Play audio:', linkData.actionData);
      } else if (linkData.actionType === 'show-hint') {
        // Handle hint display
        console.log('Show hint');
      } else if (linkData.actionType === 'reveal-answer') {
        onFlipCard();
      }
    }
  };

  const handleLaunchEmbeddedDeck = (deckId: string) => {
    setEmbeddedDeckId(deckId);
  };

  // Get the current timer value based on card side
  const currentTimerValue = showAnswer 
    ? (currentCard.countdown_timer_back || 0)
    : (currentCard.countdown_timer_front || 0);

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex justify-center mb-8 relative">
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
              onElementLink={handleElementLink}
              onLaunchEmbeddedDeck={handleLaunchEmbeddedDeck}
            />
          </div>
          
          {/* Timer display positioned at bottom of card */}
          {currentTimerValue > 0 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <TimerCountdown
                duration={currentTimerValue}
                onTimeUp={onTimeUp}
              />
            </div>
          )}
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

      {/* Embedded Deck Popup */}
      <EmbeddedDeckPopup
        isOpen={!!embeddedDeckId}
        deckId={embeddedDeckId || ''}
        onClose={() => setEmbeddedDeckId(null)}
      />
    </div>
  );
};
