
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';

export const HeroSection = () => {
  const { t } = useI18n();

  return (
    <div className="h-full flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-300 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-indigo-300 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating cards */}
        <div className="absolute top-32 left-16 w-20 h-14 bg-white/80 rounded-lg shadow-lg rotate-12 animate-float"></div>
        <div className="absolute bottom-40 left-1/4 w-18 h-12 bg-white/80 rounded-lg shadow-lg -rotate-6 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 right-16 w-22 h-16 bg-white/80 rounded-lg shadow-lg rotate-6 animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left content */}
        <div className="text-left">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smarter Cards.
            </span>
            <br />
            <span className="text-gray-800">
              Better Learning.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create interactive flashcards with AI assistance, collaborate in real-time, 
            and track your progress with our modern learning platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                {t('home.heroSection.getStarted')}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold px-8 py-4 rounded-xl transition-all duration-300"
            >
              Watch Demo
            </Button>
          </div>
          
          <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* Right content - Purple mascot */}
        <div className="relative">
          <div className="relative z-10">
            <img 
              src="/lovable-uploads/9587cfcb-3432-4562-81d3-492e69418674.png" 
              alt="Purple character studying at desk" 
              className="w-full max-w-md mx-auto object-contain animate-float"
            />
          </div>
          
          {/* Decorative elements around mascot */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-8 -left-4 w-6 h-6 bg-pink-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 -left-8 w-4 h-4 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        </div>
      </div>
    </div>
  );
};
