
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { InteractiveQuizRenderer } from '@/components/InteractiveQuizRenderer';
import { TextScaleControl } from '@/components/TextScaleControl';
import { Flashcard, CanvasElement } from '@/types/flashcard';

interface StudyModeContentProps {
  currentCard: Flashcard;
  showPanelView: boolean;
  showAnswer: boolean;
  showHint: boolean;
  onRevealAnswer: () => void;
  onToggleHint: () => void;
  onAnswer: (correct: boolean) => void;
  onFlipCard: () => void;
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
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<{[elementId: string]: number}>({});
  const [hasAnsweredAllQuiz, setHasAnsweredAllQuiz] = useState(false);
  const [textScale, setTextScale] = useState(1.0);

  const handlePasswordSubmit = () => {
    if (passwordInput === currentCard.password) {
      setIsPasswordCorrect(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleQuizAnswer = (elementId: string, correct: boolean, answerIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [elementId]: answerIndex }));
    
    const element = currentCard.front_elements.find(el => el.id === elementId);
    
    // Handle auto-advance if configured for this element
    if (element?.autoAdvanceOnAnswer && element?.showImmediateFeedback) {
      setTimeout(() => {
        onAnswer(correct);
      }, 2000);
      return;
    }
    
    const quizElements = currentCard.front_elements.filter(el => 
      el.type === 'multiple-choice' || el.type === 'true-false'
    );
    
    const newAnswers = { ...quizAnswers, [elementId]: answerIndex };
    const allAnswered = quizElements.every(el => newAnswers[el.id] !== undefined);
    setHasAnsweredAllQuiz(allAnswered);
    
    if (currentCard.card_type !== 'quiz-only') {
      onAnswer(correct);
    }
  };

  const handleAutoAdvance = () => {
    // This will be called by InteractiveQuizRenderer for auto-advance
    if (currentCard.card_type === 'single-sided' || currentCard.card_type === 'quiz-only') {
      const quizElements = currentCard.front_elements.filter(el => 
        el.type === 'multiple-choice' || el.type === 'true-false'
      );
      const correctAnswers = quizElements.filter(el => 
        quizAnswers[el.id] === el.correctAnswer
      ).length;
      const totalQuestions = quizElements.length;
      const isCorrect = correctAnswers === totalQuestions;
      onAnswer(isCorrect);
    } else {
      onFlipCard();
    }
  };

  // Get card dimensions for proper sizing
  const cardWidth = currentCard.canvas_width || 600;
  const cardHeight = currentCard.canvas_height || 400;

  // Show password protection for password-protected cards
  if (currentCard.card_type === 'password-protected' && !isPasswordCorrect) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Lock className="w-12 h-12 text-primary" />
          <h3 className="text-lg font-semibold">Password Protected Card</h3>
          <p className="text-muted-foreground">Enter the password to view this card</p>
        </div>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            className="text-center"
          />
          {passwordError && (
            <p className="text-red-500 text-sm">{passwordError}</p>
          )}
          <Button onClick={handlePasswordSubmit} className="w-full">
            Unlock Card
          </Button>
        </div>
      </div>
    );
  }

  const hasInteractiveElements = currentCard.front_elements.some(el => 
    el.type === 'multiple-choice' || el.type === 'true-false'
  );

  // Full screen layout for informational cards
  if (currentCard.card_type === 'informational') {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-center p-2">
          <TextScaleControl textScale={textScale} onTextScaleChange={setTextScale} />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4">
          <StudyCardRenderer 
            elements={currentCard.front_elements} 
            className="w-full h-full max-w-none max-h-none"
            style={{ width: '100vw', height: '80vh', maxWidth: 'none', aspectRatio: 'unset' }}
            onQuizAnswer={handleQuizAnswer}
            showQuizResults={showAnswer}
            quizAnswers={quizAnswers}
            textScale={textScale}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isInformationalCard={true}
          />
        </div>
        
        {currentCard.hint && (
          <div className="text-center p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
              className="text-primary"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                <strong>Hint:</strong> {currentCard.hint}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Single-sided cards only show front
  if (currentCard.card_type === 'single-sided') {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
        <div className="flex justify-center">
          <TextScaleControl textScale={textScale} onTextScaleChange={setTextScale} />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <StudyCardRenderer 
              elements={currentCard.front_elements}
              onQuizAnswer={handleQuizAnswer}
              showQuizResults={showAnswer}
              quizAnswers={quizAnswers}
              textScale={textScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </div>
        </div>
        
        {currentCard.hint && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
              className="text-primary"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                <strong>Hint:</strong> {currentCard.hint}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Quiz-only cards
  if (currentCard.card_type === 'quiz-only') {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
        <div className="flex justify-center">
          <TextScaleControl textScale={textScale} onTextScaleChange={setTextScale} />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <StudyCardRenderer 
              elements={currentCard.front_elements}
              onQuizAnswer={handleQuizAnswer}
              showQuizResults={false}
              quizAnswers={quizAnswers}
              requireAnswer={true}
              textScale={textScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </div>
        </div>
        
        {hasInteractiveElements && hasAnsweredAllQuiz && (
          <div className="text-center">
            <Button onClick={() => {
              const quizElements = currentCard.front_elements.filter(el => 
                el.type === 'multiple-choice' || el.type === 'true-false'
              );
              const correctAnswers = quizElements.filter(el => 
                quizAnswers[el.id] === el.correctAnswer
              ).length;
              const totalQuestions = quizElements.length;
              const isCorrect = correctAnswers === totalQuestions;
              onAnswer(isCorrect);
            }}>
              Submit Answers
            </Button>
          </div>
        )}
        
        {currentCard.hint && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
              className="text-primary"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                <strong>Hint:</strong> {currentCard.hint}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Standard card behavior (existing code)
  if (showPanelView) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8 p-4">
        <div className="flex justify-center">
          <TextScaleControl textScale={textScale} onTextScaleChange={setTextScale} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Question</h3>
          <div className="flex justify-center">
            <StudyCardRenderer 
              elements={currentCard.front_elements}
              onQuizAnswer={handleQuizAnswer}
              showQuizResults={showAnswer}
              quizAnswers={quizAnswers}
              textScale={textScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </div>
        </div>
        
        {currentCard.hint && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleHint}
              className="text-primary"
            >
              {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showHint ? 'Hide Hint' : 'Show Hint'}
            </Button>
            {showHint && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
                <strong>Hint:</strong> {currentCard.hint}
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          {!showAnswer ? (
            <Button 
              onClick={onRevealAnswer} 
              size="lg" 
              className="w-full sm:w-auto"
              disabled={hasInteractiveElements && !hasAnsweredAllQuiz}
            >
              Reveal Answer
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-foreground mb-4 text-center">Answer</h3>
                <div className="flex justify-center">
                  <StudyCardRenderer 
                    elements={currentCard.back_elements} 
                    cardWidth={cardWidth}
                    cardHeight={cardHeight}
                    textScale={textScale}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Button
                  onClick={() => onAnswer(false)}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
                >
                  <XCircle className="w-4 h-4" />
                  Incorrect
                </Button>
                <Button
                  onClick={() => onAnswer(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                >
                  <CheckCircle className="w-4 h-4" />
                  Correct
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-center space-y-8 p-4">
      <div className="flex justify-center">
        <TextScaleControl textScale={textScale} onTextScaleChange={setTextScale} />
      </div>
      
      <div className="flex justify-center" style={{ perspective: '1000px' }}>
        <div 
          className={`relative transition-transform duration-700 preserve-3d ${showAnswer ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="backface-hidden">
            <StudyCardRenderer 
              elements={currentCard.front_elements}
              onQuizAnswer={handleQuizAnswer}
              showQuizResults={showAnswer}
              quizAnswers={quizAnswers}
              textScale={textScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </div>
          
          <div className="absolute top-0 left-0 backface-hidden rotate-y-180">
            <StudyCardRenderer 
              elements={currentCard.back_elements} 
              textScale={textScale}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          </div>
        </div>
      </div>

      {currentCard.hint && (
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleHint}
            className="text-primary"
          >
            {showHint ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </Button>
          {showHint && (
            <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 text-xs sm:text-sm max-w-2xl mx-auto">
              <strong>Hint:</strong> {currentCard.hint}
            </div>
          )}
        </div>
      )}

      {showAnswer && (
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          <Button
            onClick={() => onAnswer(false)}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50 flex-1 sm:flex-none"
          >
            <XCircle className="w-4 h-4" />
            Incorrect
          </Button>
          <Button
            onClick={() => onAnswer(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
          >
            <CheckCircle className="w-4 h-4" />
            Correct
          </Button>
        </div>
      )}
    </div>
  );
};
