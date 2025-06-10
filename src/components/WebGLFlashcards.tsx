
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
      left: Math.random() * 90 + 5, // 5% to 95%
      top: Math.random() * 80 + 10, // 10% to 90%
      animationDelay: Math.random() * 5, // 0 to 5 seconds
      duration: 8 + Math.random() * 4, // 8 to 12 seconds
      rotationDelay: Math.random() * 10, // 0 to 10 seconds
    }));
  }, [flashcards]);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float-card {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg);
              opacity: 0.3;
            }
            25% { 
              transform: translateY(-20px) rotate(5deg);
              opacity: 0.6;
            }
            50% { 
              transform: translateY(-10px) rotate(-3deg);
              opacity: 0.4;
            }
            75% { 
              transform: translateY(-25px) rotate(2deg);
              opacity: 0.5;
            }
          }
          
          @keyframes drift {
            0% { transform: translateX(0px); }
            33% { transform: translateX(10px); }
            66% { transform: translateX(-5px); }
            100% { transform: translateX(0px); }
          }
          
          @keyframes flip {
            0%, 80% { transform: rotateY(0deg); }
            90% { transform: rotateY(180deg); }
            100% { transform: rotateY(0deg); }
          }
          
          .floating-card {
            animation: float-card var(--duration) ease-in-out infinite,
                       drift calc(var(--duration) * 1.5) ease-in-out infinite,
                       flip calc(var(--duration) * 2) ease-in-out infinite;
            animation-delay: var(--delay), calc(var(--delay) + 1s), var(--rotation-delay);
          }
        `
      }} />
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {animatedCards.map((card, index) => (
          <div
            key={index}
            className="floating-card absolute w-24 h-16 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 shadow-lg flex items-center justify-center text-white text-xs font-medium text-center p-2"
            style={{
              left: `${card.left}%`,
              top: `${card.top}%`,
              '--delay': `${card.animationDelay}s`,
              '--duration': `${card.duration}s`,
              '--rotation-delay': `${card.rotationDelay}s`,
              backgroundColor: card.color + '20',
              borderColor: card.color + '40',
            } as React.CSSProperties}
          >
            <span className="truncate">{card.front}</span>
          </div>
        ))}
      </div>
    </>
  );
};
