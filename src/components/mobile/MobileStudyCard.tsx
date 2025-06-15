
import React from 'react';
import { Card } from '@/components/ui/card';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { useGestures } from '@/hooks/useGestures';
import { Flashcard } from '@/types/flashcard';
import { cn } from '@/lib/utils';

interface MobileStudyCardProps {
  card: Flashcard;
  showAnswer: boolean;
  onFlip: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onRate?: (rating: number) => void;
  className?: string;
}

export const MobileStudyCard: React.FC<MobileStudyCardProps> = ({
  card,
  showAnswer,
  onFlip,
  onNext,
  onPrevious,
  onRate,
  className
}) => {
  const { isPressed, touchHandlers } = useGestures({
    onSwipeLeft: onNext,
    onSwipeRight: onPrevious,
    onTap: onFlip,
    onSwipeUp: showAnswer ? undefined : onFlip,
    onSwipeDown: showAnswer ? onFlip : undefined,
    onLongPress: () => onRate?.(3) // Default "OK" rating
  });

  const currentElements = showAnswer ? card.back_elements : card.front_elements;
  const cardWidth = card.canvas_width || 600;
  const cardHeight = card.canvas_height || 400;

  return (
    <div className={cn("relative w-full", className)} {...touchHandlers}>
      <Card 
        className={cn(
          "relative overflow-hidden transition-all duration-200 border-2",
          isPressed ? "scale-95 border-primary" : "scale-100 border-gray-200",
          "touch-none select-none"
        )}
        style={{ 
          height: `${Math.min(cardHeight, window.innerHeight * 0.6)}px`,
          maxWidth: '100%'
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-4">
          {currentElements && currentElements.length > 0 ? (
            <StudyCardRenderer
              elements={currentElements}
              textScale={0.9}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              className="w-full h-full"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                transform: 'scale(0.9)'
              }}
            />
          ) : (
            <div className="text-center text-lg leading-relaxed p-4">
              {showAnswer ? card.answer : card.question}
            </div>
          )}
        </div>

        {/* Gesture hints */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-50">
          {!showAnswer ? "Tap to reveal • Swipe for next/prev" : "Tap to flip back • Swipe for next/prev"}
        </div>

        {/* Visual feedback for gestures */}
        {isPressed && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        )}
      </Card>

      {/* Rating overlay for SRS */}
      {showAnswer && onRate && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/90 backdrop-blur rounded-full px-4 py-2 shadow-lg">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => onRate(rating)}
              className={cn(
                "w-8 h-8 rounded-full text-sm font-semibold transition-colors",
                rating <= 2 ? "bg-red-100 text-red-700 hover:bg-red-200" :
                rating === 3 ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" :
                "bg-green-100 text-green-700 hover:bg-green-200"
              )}
            >
              {rating}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
