import React, { useState, useEffect, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, FillInBlankRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { EmbeddedDeckViewer } from './EmbeddedDeckViewer';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: { [elementId: string]: number };
  onFillInBlankAnswer?: (elementId: string, correct: boolean) => void;
  fillInBlankResults?: { [elementId: string]: boolean };
  isInformationalCard?: boolean;
  textScale?: number;
  cardWidth?: number;
  cardHeight?: number;
  allowMultipleAttempts?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({
  elements,
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  onFillInBlankAnswer,
  fillInBlankResults = {},
  isInformationalCard = false,
  textScale = 1,
  cardWidth = 600,
  cardHeight = 450,
  allowMultipleAttempts = true,
  className = '',
  style = {},
}) => {
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showFeedback, setShowFeedback] = useState<{[key: string]: boolean}>({});
  const [attemptCounts, setAttemptCounts] = useState<{[key: string]: number}>({});

  const handleAnswerChange = useCallback((elementId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [elementId]: answer }));
  }, []);

  const handleSubmitAnswer = useCallback((elementId: string, correctAnswer: string, isCorrect: boolean) => {
    setShowFeedback(prev => ({ ...prev, [elementId]: true }));
  }, []);

  return (
    <div 
      className={`relative bg-white overflow-hidden ${className}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        minWidth: cardWidth,
        minHeight: cardHeight,
        maxWidth: cardWidth,
        maxHeight: cardHeight,
        ...style
      }}
    >
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            transformOrigin: 'center',
            zIndex: element.zIndex || 0,
          }}
        >
          {/* Element rendering logic */}
          {element.type === 'text' && (
            <div
              className="w-full h-full flex items-center justify-center text-center break-words overflow-hidden"
              style={{
                fontSize: `${(element.fontSize || 16) * textScale}px`,
                color: element.color || '#000000',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'left',
                backgroundColor: element.backgroundColor || 'transparent',
                fontFamily: element.fontFamily || 'inherit',
              }}
            >
              {element.hyperlink ? (
                <a 
                  href={element.hyperlink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {element.content || ''}
                </a>
              ) : (
                element.content || ''
              )}
            </div>
          )}

          {element.type === 'image' && (
            element.hyperlink ? (
              <a href={element.hyperlink} target="_blank" rel="noopener noreferrer">
                <img
                  src={element.imageUrl || element.content || '/placeholder.svg'}
                  alt="Card element"
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </a>
            ) : (
              <img
                src={element.imageUrl || element.content || '/placeholder.svg'}
                alt="Card element"
                className="w-full h-full object-cover"
                draggable={false}
              />
            )
          )}

          {element.type === 'multiple-choice' && (
            <MultipleChoiceRenderer 
              element={element}
              textScale={textScale}
              onAnswer={(correct, answerIndex) => {
                if (onQuizAnswer) {
                  onQuizAnswer(element.id, correct, answerIndex);
                }
              }}
              showResult={showQuizResults && element.id in quizAnswers}
              selectedAnswer={quizAnswers[element.id]}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          )}

          {element.type === 'true-false' && (
            <TrueFalseRenderer 
              element={element}
              textScale={textScale}
              onAnswer={(correct, answerIndex) => {
                if (onQuizAnswer) {
                  onQuizAnswer(element.id, correct, answerIndex);
                }
              }}
              showResult={showQuizResults && element.id in quizAnswers}
              selectedAnswer={quizAnswers[element.id]}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          )}

          {element.type === 'fill-in-blank' && (
            <FillInBlankRenderer
              element={element}
              textScale={textScale}
              onAnswer={(correct) => {
                if (onFillInBlankAnswer) {
                  onFillInBlankAnswer(element.id, correct);
                }
              }}
              showResult={element.id in fillInBlankResults}
              isCorrect={fillInBlankResults[element.id]}
              allowMultipleAttempts={allowMultipleAttempts}
            />
          )}

          {element.type === 'youtube' && (
            <YouTubeRenderer element={element} />
          )}

          {element.type === 'deck-embed' && (
            <EmbeddedDeckViewer
              deckId={element.deckId || ''}
              width={element.width}
              height={element.height}
              textScale={textScale}
            />
          )}

          {element.type === 'audio' && element.audioUrl && (
            <audio
              controls
              className="w-full h-full"
              style={{ fontSize: `${12 * textScale}px` }}
            >
              <source src={element.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          )}

          {element.type === 'drawing' && element.drawingData && (
            <div className="w-full h-full">
              <img
                src={element.drawingData}
                alt="Drawing"
                className="w-full h-full object-contain"
                draggable={false}
              />
            </div>
          )}
        </div>
      ))}

      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p style={{ fontSize: `${16 * textScale}px` }}>No content to display</p>
        </div>
      )}
    </div>
  );
};
