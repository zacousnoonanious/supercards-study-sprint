
import React from 'react';
import { WebGLFlashcards } from '@/components/WebGLFlashcards';

const flashcardFacts = [
  { front: "Capital of Japan", back: "Tokyo", color: "#3b82f6" },
  { front: "Speed of Light", back: "299,792,458 m/s", color: "#8b5cf6" },
  { front: "Largest Planet", back: "Jupiter", color: "#f97316" },
  { front: "Chemical Symbol for Gold", back: "Au", color: "#eab308" },
  { front: "Author of 1984", back: "George Orwell", color: "#22c55e" },
  { front: "Pythagorean Theorem", back: "a² + b² = c²", color: "#ef4444" },
  { front: "Capital of France", back: "Paris", color: "#06b6d4" },
  { front: "Smallest Prime Number", back: "2", color: "#ec4899" },
  { front: "Water's Chemical Formula", back: "H₂O", color: "#10b981" },
  { front: "First President of USA", back: "George Washington", color: "#f59e0b" },
  { front: "Atomic Number of Carbon", back: "6", color: "#8b5cf6" },
  { front: "Capital of Italy", back: "Rome", color: "#ef4444" },
  { front: "Continent with Antarctica", back: "Antarctica", color: "#06b6d4" },
  { front: "Square Root of 64", back: "8", color: "#22c55e" },
  { front: "Inventor of the Telephone", back: "Alexander Graham Bell", color: "#f97316" },
  { front: "Largest Ocean", back: "Pacific Ocean", color: "#3b82f6" },
  { front: "Number of Continents", back: "7", color: "#ec4899" },
  { front: "Chemical Symbol for Iron", back: "Fe", color: "#eab308" },
  { front: "Author of Romeo and Juliet", back: "William Shakespeare", color: "#8b5cf6" },
  { front: "Year WWI Ended", back: "1918", color: "#ef4444" }
];

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="h-screen w-screen fixed inset-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-blue-600">
        {/* Simple geometric shapes */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-50 animate-float"></div>
        <div 
          className="absolute top-32 right-20 w-6 h-6 bg-blue-300 opacity-40 animate-float-slow"
          style={{ 
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-40 animate-float"></div>
      </div>

      {/* WebGL Flashcards */}
      <WebGLFlashcards flashcards={flashcardFacts} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center p-4 pt-16 pb-4">
        {children}
      </div>
      
      {/* CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px) rotate(45deg); }
            50% { transform: translateY(-10px) rotate(45deg); }
          }
          
          .animate-float {
            animation: float 4s ease-in-out infinite;
          }
          
          .animate-float-slow {
            animation: float-slow 5s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};
