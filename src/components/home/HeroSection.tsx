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
          @keyframes rainbow-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes rainbow-shift-2 {
            0% { background-position: 50% 0%; }
            50% { background-position: 50% 100%; }
            100% { background-position: 50% 0%; }
          }
          
          @keyframes rainbow-shift-3 {
            0% { background-position: 100% 100%; }
            50% { background-position: 0% 0%; }
            100% { background-position: 100% 100%; }
          }
          
          @keyframes random-particle-1 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
              transform: translateY(-3px) translateX(2px) scale(0.6);
            }
            100% { 
              transform: translateY(-${Math.random() * 40 + 20}px) translateX(${Math.random() * 30 - 15}px) scale(${Math.random() * 0.5 + 0.3});
              opacity: 0;
            }
          }
          
          @keyframes random-particle-2 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            15% {
              opacity: 0.9;
              transform: translateY(-5px) translateX(-3px) scale(0.8);
            }
            100% { 
              transform: translateY(-${Math.random() * 50 + 25}px) translateX(${Math.random() * 35 - 17}px) scale(${Math.random() * 0.6 + 0.4});
              opacity: 0;
            }
          }
          
          @keyframes random-particle-3 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            8% {
              opacity: 0.7;
              transform: translateY(-2px) translateX(4px) scale(0.5);
            }
            100% { 
              transform: translateY(-${Math.random() * 45 + 22}px) translateX(${Math.random() * 32 - 16}px) scale(${Math.random() * 0.7 + 0.2});
              opacity: 0;
            }
          }
          
          @keyframes random-particle-4 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            20% {
              opacity: 0.85;
              transform: translateY(-7px) translateX(-4px) scale(0.9);
            }
            100% { 
              transform: translateY(-${Math.random() * 55 + 30}px) translateX(${Math.random() * 38 - 19}px) scale(${Math.random() * 0.8 + 0.3});
              opacity: 0;
            }
          }
          
          @keyframes random-particle-5 {
            0% { 
              transform: translateY(0px) translateX(0px) scale(0);
              opacity: 0;
            }
            12% {
              opacity: 0.75;
              transform: translateY(-4px) translateX(6px) scale(0.7);
            }
            100% { 
              transform: translateY(-${Math.random() * 42 + 28}px) translateX(${Math.random() * 28 - 14}px) scale(${Math.random() * 0.9 + 0.1});
              opacity: 0;
            }
          }
          
          .rainbow-text {
            position: relative;
            background: linear-gradient(
              90deg,
              #FF0000, /* Red */
              #FF7F00, /* Orange */
              #FFFF00, /* Yellow */
              #00FF00, /* Green */
              #0000FF, /* Blue */
              #4B0082, /* Indigo */
              #9400D3, /* Violet */
              #FF0000  /* Red again for seamless loop */
            );
            background-size: 800% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow-shift 8s ease-in-out infinite;
          }
          
          .rainbow-text::before {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              45deg,
              #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3, #FF0000
            );
            background-size: 600% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow-shift-2 12s ease-in-out infinite;
            opacity: 0.8;
            z-index: -1;
          }
          
          .rainbow-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
              135deg,
              #9400D3, #4B0082, #0000FF, #00FF00, #FFFF00, #FF7F00, #FF0000
            );
            background-size: 700% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow-shift-3 16s ease-in-out infinite;
            opacity: 0.6;
            z-index: -2;
          }
          
          .rainbow-text {
            animation: rainbow-shift 8s ease-in-out infinite;
          }
          
          .non-rainbow {
            -webkit-text-fill-color: white;
            text-shadow: none;
            filter: none;
          }
          
          .particle-container {
            position: relative;
            display: inline-block;
          }
          
          .particle {
            position: absolute;
            width: 4px;
            height: 4px;
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 6px currentColor, 0 0 12px currentColor;
          }
          
          .particle:nth-child(1) { 
            top: 20%; 
            left: 15%; 
            background: radial-gradient(circle, #e4a5ff, #f0c3ff);
            animation: random-particle-1 ${1.2 + Math.random() * 0.8}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(2) { 
            top: 80%; 
            left: 85%; 
            background: radial-gradient(circle, #b794ff, #d4b8ff);
            animation: random-particle-2 ${1.5 + Math.random() * 1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(3) { 
            top: 35%; 
            left: 10%; 
            background: radial-gradient(circle, #9d84ff, #c4a8ff);
            animation: random-particle-3 ${1.1 + Math.random() * 0.9}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(4) { 
            top: 65%; 
            left: 90%; 
            background: radial-gradient(circle, #84c7ff, #b8d9ff);
            animation: random-particle-4 ${1.4 + Math.random() * 1.1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(5) { 
            top: 90%; 
            left: 45%; 
            background: radial-gradient(circle, #70dcff, #a8e8ff);
            animation: random-particle-5 ${1.3 + Math.random() * 0.7}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(6) { 
            top: 15%; 
            left: 75%; 
            background: radial-gradient(circle, #e4a5ff, #f0c3ff);
            animation: random-particle-1 ${1.6 + Math.random() * 0.8}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(7) { 
            top: 55%; 
            left: 25%; 
            background: radial-gradient(circle, #b794ff, #d4b8ff);
            animation: random-particle-3 ${1.2 + Math.random() * 1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(8) { 
            top: 75%; 
            left: 70%; 
            background: radial-gradient(circle, #9d84ff, #c4a8ff);
            animation: random-particle-2 ${1.4 + Math.random() * 0.9}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(9) { 
            top: 25%; 
            left: 55%; 
            background: radial-gradient(circle, #84c7ff, #b8d9ff);
            animation: random-particle-5 ${1.1 + Math.random() * 1.1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(10) { 
            top: 85%; 
            left: 5%; 
            background: radial-gradient(circle, #70dcff, #a8e8ff);
            animation: random-particle-4 ${1.5 + Math.random() * 0.7}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(11) { 
            top: 45%; 
            left: 95%; 
            background: radial-gradient(circle, #e4a5ff, #f0c3ff);
            animation: random-particle-1 ${1.3 + Math.random() * 0.8}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(12) { 
            top: 60%; 
            left: 35%; 
            background: radial-gradient(circle, #b794ff, #d4b8ff);
            animation: random-particle-3 ${1.2 + Math.random() * 1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(13) { 
            top: 30%; 
            left: 80%; 
            background: radial-gradient(circle, #9d84ff, #c4a8ff);
            animation: random-particle-2 ${1.4 + Math.random() * 0.9}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(14) { 
            top: 70%; 
            left: 20%; 
            background: radial-gradient(circle, #84c7ff, #b8d9ff);
            animation: random-particle-5 ${1.1 + Math.random() * 1.1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(15) { 
            top: 10%; 
            left: 60%; 
            background: radial-gradient(circle, #70dcff, #a8e8ff);
            animation: random-particle-4 ${1.5 + Math.random() * 0.7}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(16) { 
            top: 95%; 
            left: 65%; 
            background: radial-gradient(circle, #e4a5ff, #f0c3ff);
            animation: random-particle-1 ${1.3 + Math.random() * 0.8}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(17) { 
            top: 40%; 
            left: 40%; 
            background: radial-gradient(circle, #b794ff, #d4b8ff);
            animation: random-particle-3 ${1.2 + Math.random() * 1}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
          }
          .particle:nth-child(18) { 
            top: 50%; 
            left: 50%; 
            background: radial-gradient(circle, #9d84ff, #c4a8ff);
            animation: random-particle-2 ${1.4 + Math.random() * 0.9}s ease-out infinite;
            animation-delay: ${Math.random() * 2}s;
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
            <span className="particle-container rainbow-text" data-text="Smarter">
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
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </span>
            <span> Cards.</span>
            <br />
            <span className="particle-container rainbow-text" data-text="Better">
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
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </span>
            <span> Learning.</span>
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
