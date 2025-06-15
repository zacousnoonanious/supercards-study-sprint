
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
  style?: React.CSSProperties;
  onQuizAnswer?: (elementId: string, correct: boolean, answerIndex: number) => void;
  showQuizResults?: boolean;
  quizAnswers?: {[elementId: string]: number};
  onFillInBlankAnswer?: (elementId: string, correct: boolean) => void;
  fillInBlankResults?: {[elementId: string]: boolean};
  textScale?: number;
  cardWidth?: number;
  cardHeight?: number;
  allowMultipleAttempts?: boolean;
  isInformationalCard?: boolean;
  onElementLink?: (elementId: string, linkData: any) => void;
  onLaunchEmbeddedDeck?: (deckId: string) => void;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({
  elements,
  className = '',
  style,
  onQuizAnswer,
  showQuizResults = false,
  quizAnswers = {},
  onFillInBlankAnswer,
  fillInBlankResults = {},
  textScale = 1,
  cardWidth = 600,
  cardHeight = 400,
  allowMultipleAttempts = true,
  isInformationalCard = false,
  onElementLink,
  onLaunchEmbeddedDeck,
}) => {
  const canvasStyle = {
    width: cardWidth,
    height: cardHeight,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  };

  if (!elements || elements.length === 0) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center ${className}`} style={canvasStyle}>
        <p className="text-gray-500 text-center">No content</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={canvasStyle}>
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
          <CanvasElementRenderer
            element={element}
            editingElement={null}
            onUpdateElement={() => {}}
            onEditingChange={() => {}}
            textScale={textScale}
            isStudyMode={true}
            onElementLink={onElementLink}
            onLaunchEmbeddedDeck={onLaunchEmbeddedDeck}
          />
        </div>
      ))}
    </div>
  );
};
