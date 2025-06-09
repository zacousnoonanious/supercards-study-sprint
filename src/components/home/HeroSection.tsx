
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
    { front: "Photosynthesis", back: "The process by which plants convert sunlight into energy" },
    { front: "Democracy", back: "A system of government where citizens vote for their leaders" },
    { front: "Osmosis", back: "The movement of water through a semi-permeable membrane" },
    { front: "Renaissance", back: "A period of cultural rebirth in Europe (14th-17th centuries)" },
    { front: "Ecosystem", back: "A community of living organisms interacting with their environment" },
    { front: "Gravity", back: "The force that attracts objects toward the center of the Earth" },
  ];

  // Generate glitter particles
  const glitterParticles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));

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
          {/* Main Heading with effects */}
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight relative">
            <div className="relative inline-block">
              <span 
                className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'rainbow 3s ease-in-out infinite'
                }}
              >
                Smarter
              </span>
              
              {/* Glitter particles for "Smarter" */}
              {glitterParticles.slice(0, 8).map((particle) => (
                <div
                  key={`smarter-${particle.id}`}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-80"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    animation: `glitter ${particle.duration}s ease-in-out infinite`,
                    animationDelay: `${particle.delay}s`
                  }}
                />
              ))}
            </div>
            {' '}Cards.{' '}
            <br />
            <div className="relative inline-block">
              <span 
                className="bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-pulse"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'rainbow 3s ease-in-out infinite 1.5s'
                }}
              >
                Better
              </span>
              
              {/* Glitter particles for "Better" */}
              {glitterParticles.slice(8).map((particle) => (
                <div
                  key={`better-${particle.id}`}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-80"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    animation: `glitter ${particle.duration}s ease-in-out infinite`,
                    animationDelay: `${particle.delay + 1.5}s`
                  }}
                />
              ))}
            </div>
            {' '}Learning.
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

        {/* Character Assets positioned like in homepage.png - only teal robot and owl */}
        <div className="absolute bottom-0 left-0 right-0">
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

        {/* Additional styles for rainbow and glitter effects */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes rainbow {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            
            @keyframes glitter {
              0%, 100% { 
                opacity: 0;
                transform: translateY(0px) scale(0);
              }
              50% { 
                opacity: 1;
                transform: translateY(-10px) scale(1);
              }
            }
          `
        }} />
      </div>
    </>
  );
};
