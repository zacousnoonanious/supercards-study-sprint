
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  return (
    <div className="text-center mb-20 animate-fade-in">
      <h2 className="text-5xl font-bold text-gray-900 mb-6">
        Master Any Subject with
        <span className="text-indigo-600"> SuperCards</span>
      </h2>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Create, organize, and study flashcards like never before. Track your progress and accelerate your learning with our intelligent study system powered by AI.
      </p>
      <Link to="/auth">
        <Button size="lg" className="text-lg px-8 py-4 hover-scale">
          Start Learning Today
        </Button>
      </Link>
    </div>
  );
};
