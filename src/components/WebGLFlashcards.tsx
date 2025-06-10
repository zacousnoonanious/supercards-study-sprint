
import React, { useMemo } from 'react';

interface FlashcardData {
  front: string;
  back: string;
  color: string;
}

interface WebGLFlashcardsProps {
  flashcards: FlashcardData[];
}

export const WebGLFlashcards: React.FC<WebGLFlashcardsProps> = ({ flashcards }) => {
  // Generate random positions and animation delays for each card
  const animatedCards = useMemo(() => {
    return flashcards.map((card, index) => ({
      ...card,
      left: Math.random() * 85 + 5, // 5% to 90%
      animationDelay: Math.random() * 8, // 0 to 8 seconds
      duration: 15 + Math.random() * 10, // 15 to 25 seconds for slower movement
      lane: Math.floor(Math.random() * 4), // 4 different vertical lanes
    }));
  }, [flashcards]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-down {
            0% { 
              transform: translateY(-120px) rotate(-2deg);
              opacity: 0;
            }
            10% { 
              opacity: 0.7;
            }
            90% { 
              opacity: 0.7;
            }
            100% { 
              transform: translateY(calc(100vh + 120px)) rotate(2deg);
              opacity: 0;
            }
          }
          
          .scrolling-card {
            animation: scroll-down var(--duration) linear infinite;
            animation-delay: var(--delay);
            will-change: transform;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .scrolling-card {
              animation-duration: calc(var(--duration) * 2);
            }
          }
        `
      }} />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {animatedCards.map((card, index) => (
          <div
            key={index}
            className="scrolling-card absolute w-32 h-20 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg flex items-center justify-center text-white text-sm font-medium text-center p-3"
            style={{
              left: `${card.left}%`,
              '--delay': `${card.animationDelay}s`,
              '--duration': `${card.duration}s`,
              backgroundColor: card.color + '15',
              borderColor: card.color + '30',
              top: `${card.lane * 25}%`,
            } as React.CSSProperties}
          >
            <div className="w-full overflow-hidden">
              <div className="text-xs font-semibold mb-1 leading-tight">
                {card.front}
              </div>
              <div className="text-xs opacity-80 leading-tight">
                {card.back}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
