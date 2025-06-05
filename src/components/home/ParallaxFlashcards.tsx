
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
        const cardOffset = scrollY * (0.2 + index * 0.08);
        const rotation = (scrollY * 0.05 + index * 15) % 360;
        const isFlipped = (scrollY + index * 120) % 500 > 250;
        
        return (
          <div
            key={index}
            className="absolute transition-all duration-1000 ease-out opacity-20 hover:opacity-30"
            style={{
              left: `${5 + (index % 4) * 25}%`,
              top: `${15 + Math.floor(index / 4) * 35}%`,
              transform: `translateY(${cardOffset}px) rotate(${rotation}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
              transformStyle: 'preserve-3d',
              animation: `float ${3 + index * 0.5}s ease-in-out infinite`,
            }}
          >
            <div className="relative w-56 h-36 [perspective:1000px]">
              <div
                className="absolute inset-0 w-full h-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                <div className="absolute inset-0 w-full h-full bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-4 flex items-center justify-center [backface-visibility:hidden]">
                  <p className="text-sm font-medium text-indigo-900 text-center">{card.front}</p>
                </div>
                <div 
                  className="absolute inset-0 w-full h-full bg-indigo-100 border-2 border-indigo-300 rounded-lg shadow-lg p-4 flex items-center justify-center [backface-visibility:hidden]"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <p className="text-xs text-indigo-800 text-center">{card.back}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
