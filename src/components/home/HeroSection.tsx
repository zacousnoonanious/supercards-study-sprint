
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ParallaxFlashcards } from './ParallaxFlashcards';
import { GlobalStyles } from './GlobalStyles';

export const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const flashcards = [
    { front: "What is React?", back: "A JavaScript library for building user interfaces" },
    { front: "What is JSX?", back: "JavaScript XML - a syntax extension for JavaScript" },
    { front: "What is a component?", back: "A reusable piece of UI that can have its own state and props" },
    { front: "What is state?", back: "Data that changes over time in a component" },
    { front: "What are props?", back: "Properties passed from parent to child components" },
    { front: "What is a hook?", back: "Functions that let you use state and other React features" },
  ];

  return (
    <>
      <GlobalStyles />
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient similar to homepage.png */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600">
          {/* Geometric shapes scattered in background - matching the homepage.png pattern */}
          <div 
            className="absolute top-20 left-10 w-8 h-8 bg-pink-300 rounded-full opacity-70"
            style={{ transform: `translateY(${scrollY * 0.1}px)` }}
          ></div>
          <div 
            className="absolute top-32 right-20 w-6 h-6 bg-blue-300 opacity-60"
            style={{ 
              transform: `translateY(${scrollY * 0.15}px) rotate(45deg)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute top-40 left-1/4 w-4 h-4 bg-yellow-300 opacity-50"
            style={{ 
              transform: `translateY(${scrollY * 0.08}px) rotate(12deg)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute bottom-40 right-10 w-10 h-10 bg-purple-300 rounded-full opacity-60"
            style={{ transform: `translateY(${scrollY * 0.12}px)` }}
          ></div>
          <div 
            className="absolute bottom-60 left-16 w-5 h-5 bg-cyan-300 opacity-70"
            style={{ 
              transform: `translateY(${scrollY * 0.2}px) rotate(45deg)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute top-1/3 right-1/4 w-6 h-6 bg-pink-300 opacity-50"
            style={{ 
              transform: `translateY(${scrollY * 0.18}px) rotate(12deg)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-blue-300 rounded-full opacity-40"
            style={{ transform: `translateY(${scrollY * 0.14}px)` }}
          ></div>
          <div 
            className="absolute top-1/4 left-1/2 w-3 h-3 bg-cyan-400 rounded-full opacity-60"
            style={{ transform: `translateY(${scrollY * 0.25}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 right-1/3 w-7 h-7 bg-pink-400 rounded-full opacity-50"
            style={{ transform: `translateY(${scrollY * 0.16}px)` }}
          ></div>
          <div 
            className="absolute top-3/4 left-1/5 w-4 h-4 bg-purple-400 opacity-65"
            style={{ 
              transform: `translateY(${scrollY * 0.11}px) rotate(45deg)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
        </div>

        {/* Parallax floating flashcards */}
        <ParallaxFlashcards flashcards={flashcards} scrollY={scrollY} />

        {/* Navigation Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded"></div>
              </div>
              <span className="text-2xl font-bold text-white">SuperDeck</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-white">
              <a href="#" className="hover:text-purple-200 transition-colors">Home</a>
              <a href="#" className="hover:text-purple-200 transition-colors">Features</a>
              <a href="#" className="hover:text-purple-200 transition-colors">Pricing</a>
              <Link to="/auth" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Log in
              </Link>
            </nav>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Main Heading */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Master your studies
            <br />
            with flashcards
          </h1>

          {/* CTA Button */}
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Button>
          </Link>
        </div>

        {/* Character Assets positioned like in homepage.png */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Yellow monster character (left side) */}
          <div 
            className="absolute bottom-8 left-8 md:left-16"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <img 
              src="/lovable-uploads/eaed28d5-3f56-44a6-a03c-4fd8d513b11a.png" 
              alt="Yellow monster with flashcards" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain animate-float"
            />
          </div>

          {/* Purple character at desk (center) */}
          <div 
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            style={{ transform: `translateX(-50%) translateY(${scrollY * 0.03}px)` }}
          >
            <img 
              src="/lovable-uploads/c20a6973-ab9f-4e49-b8e9-e4da785bd109.png" 
              alt="Purple character studying" 
              className="w-28 h-28 md:w-36 md:h-36 object-contain animate-float"
              style={{ animationDelay: '0.5s' }}
            />
          </div>

          {/* Teal robot character (right side) */}
          <div 
            className="absolute bottom-8 right-8 md:right-16"
            style={{ transform: `translateY(${scrollY * 0.04}px)` }}
          >
            <img 
              src="/lovable-uploads/f6e4da9c-18c9-4b36-bfd7-4c93052c5f0f.png" 
              alt="Teal robot with checkmark" 
              className="w-30 h-30 md:w-38 md:h-38 object-contain animate-float"
              style={{ animationDelay: '1s' }}
            />
          </div>

          {/* Owl character (top right) */}
          <div 
            className="absolute top-40 right-12 md:right-24"
            style={{ transform: `translateY(${scrollY * 0.06}px)` }}
          >
            <img 
              src="/lovable-uploads/a6282a15-30cb-4623-9be5-1d696af06c06.png" 
              alt="Orange owl character" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain animate-float"
              style={{ animationDelay: '1.5s' }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
