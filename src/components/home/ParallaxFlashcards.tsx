
import React from 'react';

interface FlashcardData {
  front: string;
  back: string;
}

interface ParallaxFlashcardsProps {
  flashcards: FlashcardData[];
  scrollY: number;
}

export const ParallaxFlashcards: React.FC<ParallaxFlashcardsProps> = ({ flashcards, scrollY }) => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {flashcards.map((card, index) => {
        const cardOffset = scrollY * (0.1 + index * 0.03);
        const rotation = (scrollY * 0.02 + index * 10) % 360;
        const isFlipped = (scrollY + index * 150) % 600 > 300;
        const opacity = Math.max(0.05, 0.15 - (scrollY * 0.0002));
        
        return (
          <div
            key={index}
            className="absolute transition-all duration-1000 ease-out parallax-element"
            style={{
              left: `${10 + (index % 3) * 30}%`,
              top: `${20 + Math.floor(index / 3) * 25}%`,
              transform: `translateY(${cardOffset}px) rotate(${rotation}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
              transformStyle: 'preserve-3d',
              opacity: opacity,
              animation: `floatCards ${4 + index * 0.5}s ease-in-out infinite`,
              animationDelay: `${index * 0.3}s`,
            }}
          >
            <div className="relative w-40 h-28 [perspective:1000px]">
              <div
                className="absolute inset-0 w-full h-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div className="absolute inset-0 w-full h-full bg-white border-2 border-purple-200 rounded-lg shadow-lg p-3 flex items-center justify-center [backface-visibility:hidden]">
                  <p className="text-xs font-medium text-purple-900 text-center leading-tight">{card.front}</p>
                </div>
                <div 
                  className="absolute inset-0 w-full h-full bg-purple-100 border-2 border-purple-300 rounded-lg shadow-lg p-3 flex items-center justify-center [backface-visibility:hidden]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <p className="text-xs text-purple-800 text-center leading-tight">{card.back}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
