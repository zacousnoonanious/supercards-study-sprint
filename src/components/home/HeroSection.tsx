
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ParallaxFlashcards } from './ParallaxFlashcards';
import { GlobalStyles } from './GlobalStyles';
import { useI18n } from '@/contexts/I18nContext';
import { LanguageSelector } from '@/components/LanguageSelector';

export const HeroSection = () => {
  const { t } = useI18n();
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

  return (
    <>
      <GlobalStyles />
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes rainbow-flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 400% 50%; }
          }
          
          @keyframes particle-burst-1 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            15% {
              opacity: 1;
              transform: translateY(-5px) translateX(3px) scale(1);
            }
            100% { 
              transform: translateY(-40px) translateX(15px) scale(0.8);
              opacity: 0;
            }
          }
          
          @keyframes particle-burst-2 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            20% {
              opacity: 1;
              transform: translateY(-8px) translateX(-5px) scale(1.2);
            }
            100% { 
              transform: translateY(-50px) translateX(-20px) scale(0.6);
              opacity: 0;
            }
          }
          
          @keyframes particle-burst-3 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 1;
              transform: translateY(-3px) translateX(8px) scale(0.8);
            }
            100% { 
              transform: translateY(-35px) translateX(25px) scale(1.1);
              opacity: 0;
            }
          }
          
          @keyframes particle-burst-4 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            25% {
              opacity: 1;
              transform: translateY(-10px) translateX(-8px) scale(1);
            }
            100% { 
              transform: translateY(-45px) translateX(-18px) scale(0.9);
              opacity: 0;
            }
          }
          
          @keyframes particle-burst-5 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            18% {
              opacity: 1;
              transform: translateY(-6px) translateX(12px) scale(1.3);
            }
            100% { 
              transform: translateY(-55px) translateX(30px) scale(0.7);
              opacity: 0;
            }
          }
          
          @keyframes particle-burst-6 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            12% {
              opacity: 1;
              transform: translateY(-4px) translateX(-12px) scale(0.9);
            }
            100% { 
              transform: translateY(-42px) translateX(-28px) scale(1.2);
              opacity: 0;
            }
          }
          
          .rainbow-text {
            background: linear-gradient(
              90deg,
              #ff0000,
              #ff7f00,
              #ffff00,
              #00ff00,
              #0000ff,
              #4b0082,
              #9400d3,
              #ff0000,
              #ff7f00,
              #ffff00,
              #00ff00,
              #0000ff,
              #4b0082,
              #9400d3,
              #ff0000
            );
            background-size: 400% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow-flow 8s linear infinite;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
            position: relative;
          }
          
          .particle-container {
            position: relative;
            display: inline-block;
          }
          
          .particle {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 8px currentColor;
          }
          
          .particle:nth-child(1) { 
            top: 15%; 
            left: 25%; 
            background: radial-gradient(circle, #ff6b6b, #ff8e8e);
            animation: particle-burst-1 1.8s ease-out infinite;
            animation-delay: 0s;
          }
          .particle:nth-child(2) { 
            top: 75%; 
            left: 85%; 
            background: radial-gradient(circle, #4ecdc4, #6ee6d8);
            animation: particle-burst-2 2.1s ease-out infinite;
            animation-delay: 0.3s;
          }
          .particle:nth-child(3) { 
            top: 45%; 
            left: 15%; 
            background: radial-gradient(circle, #45b7d1, #69c9e5);
            animation: particle-burst-3 1.9s ease-out infinite;
            animation-delay: 0.6s;
          }
          .particle:nth-child(4) { 
            top: 35%; 
            left: 95%; 
            background: radial-gradient(circle, #96ceb4, #aad8c8);
            animation: particle-burst-4 2.2s ease-out infinite;
            animation-delay: 0.9s;
          }
          .particle:nth-child(5) { 
            top: 85%; 
            left: 55%; 
            background: radial-gradient(circle, #feca57, #fed976);
            animation: particle-burst-5 2.0s ease-out infinite;
            animation-delay: 1.2s;
          }
          .particle:nth-child(6) { 
            top: 25%; 
            left: 65%; 
            background: radial-gradient(circle, #a8e6cf, #c2f0db);
            animation: particle-burst-6 1.7s ease-out infinite;
            animation-delay: 1.5s;
          }
          .particle:nth-child(7) { 
            top: 55%; 
            left: 35%; 
            background: radial-gradient(circle, #ff9ff3, #ffb3f7);
            animation: particle-burst-1 2.3s ease-out infinite;
            animation-delay: 0.4s;
          }
          .particle:nth-child(8) { 
            top: 65%; 
            left: 75%; 
            background: radial-gradient(circle, #54a0ff, #74b9ff);
            animation: particle-burst-3 1.6s ease-out infinite;
            animation-delay: 1.1s;
          }
          .particle:nth-child(9) { 
            top: 20%; 
            left: 45%; 
            background: radial-gradient(circle, #5f27cd, #8854d0);
            animation: particle-burst-5 2.4s ease-out infinite;
            animation-delay: 0.7s;
          }
          .particle:nth-child(10) { 
            top: 80%; 
            left: 15%; 
            background: radial-gradient(circle, #ff3838, #ff6b6b);
            animation: particle-burst-2 1.8s ease-out infinite;
            animation-delay: 1.8s;
          }
          .particle:nth-child(11) { 
            top: 40%; 
            left: 85%; 
            background: radial-gradient(circle, #2ed573, #7bed9f);
            animation: particle-burst-4 2.1s ease-out infinite;
            animation-delay: 0.2s;
          }
          .particle:nth-child(12) { 
            top: 70%; 
            left: 25%; 
            background: radial-gradient(circle, #ffa502, #ff6348);
            animation: particle-burst-6 1.9s ease-out infinite;
            animation-delay: 1.6s;
          }
        `
      }} />
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with gradient matching the reference design */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600">
          {/* Geometric shapes scattered in background - matching the reference pattern */}
          <div 
            className="absolute top-20 left-20 w-12 h-12 bg-pink-300 opacity-70"
            style={{ 
              transform: `translateY(${scrollY * 0.1}px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute top-32 right-32 w-16 h-16 bg-blue-300 rounded-full opacity-60"
            style={{ transform: `translateY(${scrollY * 0.15}px)` }}
          ></div>
          <div 
            className="absolute top-1/4 left-1/4 w-8 h-8 bg-cyan-300 opacity-70"
            style={{ 
              transform: `translateY(${scrollY * 0.12}px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute bottom-40 right-20 w-20 h-20 bg-purple-300 rounded-full opacity-50"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/3 left-16 w-10 h-10 bg-pink-400 opacity-60"
            style={{ 
              transform: `translateY(${scrollY * 0.18}px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          <div 
            className="absolute top-1/3 right-1/4 w-6 h-6 bg-cyan-400 rounded-full opacity-80"
            style={{ transform: `translateY(${scrollY * 0.25}px)` }}
          ></div>
          <div 
            className="absolute bottom-1/4 left-1/3 w-14 h-14 bg-blue-300 rounded-full opacity-40"
            style={{ transform: `translateY(${scrollY * 0.14}px)` }}
          ></div>
          <div 
            className="absolute top-3/4 right-1/5 w-8 h-8 bg-pink-300 opacity-65"
            style={{ 
              transform: `translateY(${scrollY * 0.11}px)`,
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
        </div>

        {/* Floating flashcards in the background */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top left flashcards */}
          <div 
            className="absolute top-32 left-16 w-20 h-12 bg-white/90 rounded-lg shadow-lg border border-gray-200 opacity-80"
            style={{ 
              transform: `translateY(${Math.sin(scrollY * 0.01) * 10}px) rotate(-8deg)`,
            }}
          ></div>
          <div 
            className="absolute top-40 left-24 w-20 h-12 bg-white/90 rounded-lg shadow-lg border border-gray-200 opacity-70"
            style={{ 
              transform: `translateY(${Math.sin(scrollY * 0.01 + 1) * 12}px) rotate(-12deg)`,
            }}
          ></div>
          
          {/* Bottom right flashcards */}
          <div 
            className="absolute bottom-32 right-16 w-20 h-12 bg-white/90 rounded-lg shadow-lg border border-gray-200 opacity-75"
            style={{ 
              transform: `translateY(${Math.sin(scrollY * 0.01 + 2) * 8}px) rotate(10deg)`,
            }}
          ></div>
          <div 
            className="absolute bottom-40 right-24 w-20 h-12 bg-white/90 rounded-lg shadow-lg border border-gray-200 opacity-65"
            style={{ 
              transform: `translateY(${Math.sin(scrollY * 0.01 + 3) * 15}px) rotate(15deg)`,
            }}
          ></div>
        </div>

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
              <a href="#" className="hover:text-purple-200 transition-colors">{t('home.heroSection.home')}</a>
              <a href="#" className="hover:text-purple-200 transition-colors">{t('home.heroSection.features')}</a>
              <a href="#" className="hover:text-purple-200 transition-colors">{t('home.heroSection.pricing')}</a>
              <LanguageSelector />
              <Link to="/auth" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                {t('home.heroSection.login')}
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            <span className="particle-container rainbow-text">
              Smarter
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </span>{" "}
            Cards.
            <br />
            <span className="particle-container rainbow-text">
              Better
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </span>{" "}
            Learning.
          </h1>

          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xl px-12 py-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {t('home.heroSection.getStarted')}
            </Button>
          </Link>
        </div>

        {/* Character Assets positioned like in the reference image */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Yellow monster character (bottom left) */}
          <div 
            className="absolute bottom-8 left-8 md:left-16"
            style={{ transform: `translateY(${scrollY * 0.04}px)` }}
          >
            <img 
              src="/lovable-uploads/133e0452-917c-4305-aa4a-1d436866de4e.png" 
              alt="Yellow monster with flashcards" 
              className="w-40 h-40 md:w-48 md:h-48 object-contain animate-float"
              style={{ animationDelay: '0s' }}
            />
          </div>

          {/* Purple character at desk (center) */}
          <div 
            className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            style={{ transform: `translateX(-50%) translateY(${scrollY * 0.06}px)` }}
          >
            <img 
              src="/lovable-uploads/9587cfcb-3432-4562-81d3-492e69418674.png" 
              alt="Purple character studying at desk" 
              className="w-48 h-48 md:w-56 md:h-56 object-contain animate-float"
              style={{ animationDelay: '1s' }}
            />
          </div>

          {/* Teal robot character (bottom right) */}
          <div 
            className="absolute bottom-8 right-8 md:right-16"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <img 
              src="/lovable-uploads/04cf0a2e-0c62-48c6-b97b-b195a67b0df1.png" 
              alt="Teal robot with checkmark" 
              className="w-40 h-40 md:w-48 md:h-48 object-contain animate-float"
              style={{ animationDelay: '2s' }}
            />
          </div>

          {/* Owl character (top right) */}
          <div 
            className="absolute top-32 right-12 md:right-24"
            style={{ transform: `translateY(${scrollY * 0.03}px)` }}
          >
            <img 
              src="/lovable-uploads/3198da55-ccb8-4305-94b4-12c41dddfe6d.png" 
              alt="Orange owl character" 
              className="w-32 h-32 md:w-40 md:h-40 object-contain animate-float"
              style={{ animationDelay: '1.5s' }}
            />
          </div>
        </div>
      </div>
    </>
  );
};
