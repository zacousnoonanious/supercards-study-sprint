
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
          @keyframes sparkle-1 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            50% { 
              opacity: 1;
              transform: scale(1) rotate(180deg);
            }
          }
          
          @keyframes sparkle-2 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(0deg);
            }
            25% { 
              opacity: 0.8;
              transform: scale(0.8) rotate(90deg);
            }
            75% { 
              opacity: 0.8;
              transform: scale(0.8) rotate(270deg);
            }
          }
          
          @keyframes sparkle-3 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(45deg);
            }
            33% { 
              opacity: 1;
              transform: scale(1.2) rotate(225deg);
            }
            66% { 
              opacity: 0.6;
              transform: scale(0.6) rotate(405deg);
            }
          }
          
          @keyframes sparkle-4 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(30deg);
            }
            40% { 
              opacity: 0.9;
              transform: scale(1.1) rotate(210deg);
            }
            80% { 
              opacity: 0.7;
              transform: scale(0.9) rotate(390deg);
            }
          }
          
          @keyframes sparkle-5 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(60deg);
            }
            20% { 
              opacity: 0.7;
              transform: scale(0.7) rotate(240deg);
            }
            60% { 
              opacity: 1;
              transform: scale(1.3) rotate(420deg);
            }
          }
          
          @keyframes sparkle-6 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(15deg);
            }
            35% { 
              opacity: 0.9;
              transform: scale(1.1) rotate(195deg);
            }
            70% { 
              opacity: 0.5;
              transform: scale(0.8) rotate(375deg);
            }
          }
          
          @keyframes sparkle-7 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(75deg);
            }
            45% { 
              opacity: 0.8;
              transform: scale(0.9) rotate(255deg);
            }
            85% { 
              opacity: 1;
              transform: scale(1.4) rotate(435deg);
            }
          }
          
          @keyframes sparkle-8 {
            0%, 100% { 
              opacity: 0;
              transform: scale(0) rotate(105deg);
            }
            30% { 
              opacity: 1;
              transform: scale(1.2) rotate(285deg);
            }
            65% { 
              opacity: 0.6;
              transform: scale(0.7) rotate(465deg);
            }
          }
          
          @keyframes rainbow-shift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          .rainbow-text {
            position: relative;
            background: linear-gradient(
              90deg,
              #FF0000, /* Red */
              #FF8C00, /* Orange */
              #FFD700, /* Yellow */
              #32CD32, /* Green */
              #0000FF, /* Blue */
              #4B0082, /* Indigo */
              #8B00FF  /* Violet */
            );
            background-size: 400% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: rainbow-shift 4s ease-in-out infinite;
          }
          
          .sparkle {
            position: absolute;
            pointer-events: none;
            color: #FFD700;
            z-index: 1;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .sparkle::before {
            content: '✨';
            color: #FFD700;
          }
          
          .sparkle-small {
            font-size: 12px;
            width: 12px;
            height: 12px;
          }
          
          .sparkle-medium {
            font-size: 16px;
            width: 16px;
            height: 16px;
          }
          
          .sparkle-large {
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
          
          /* Natural sparkle positioning across the text */
          .sparkle-1 { 
            top: -15%; 
            left: 10%; 
            animation: sparkle-1 2.5s ease-in-out infinite;
            animation-delay: 0.2s;
          }
          .sparkle-2 { 
            top: 110%; 
            left: 85%; 
            animation: sparkle-2 3s ease-in-out infinite;
            animation-delay: 0.8s;
          }
          .sparkle-3 { 
            top: 20%; 
            left: -5%; 
            animation: sparkle-3 2.8s ease-in-out infinite;
            animation-delay: 1.2s;
          }
          .sparkle-4 { 
            top: 80%; 
            left: 95%; 
            animation: sparkle-4 2.3s ease-in-out infinite;
            animation-delay: 0.5s;
          }
          .sparkle-5 { 
            top: -10%; 
            left: 70%; 
            animation: sparkle-5 3.2s ease-in-out infinite;
            animation-delay: 1.5s;
          }
          .sparkle-6 { 
            top: 105%; 
            left: 25%; 
            animation: sparkle-6 2.7s ease-in-out infinite;
            animation-delay: 0.9s;
          }
          .sparkle-7 { 
            top: 40%; 
            left: 5%; 
            animation: sparkle-7 2.4s ease-in-out infinite;
            animation-delay: 1.8s;
          }
          .sparkle-8 { 
            top: 60%; 
            left: 90%; 
            animation: sparkle-8 2.9s ease-in-out infinite;
            animation-delay: 0.3s;
          }
          .sparkle-9 { 
            top: -5%; 
            left: 40%; 
            animation: sparkle-1 3.1s ease-in-out infinite;
            animation-delay: 1.1s;
          }
          .sparkle-10 { 
            top: 100%; 
            left: 60%; 
            animation: sparkle-2 2.6s ease-in-out infinite;
            animation-delay: 0.7s;
          }
          .sparkle-11 { 
            top: 30%; 
            left: 100%; 
            animation: sparkle-3 2.8s ease-in-out infinite;
            animation-delay: 1.4s;
          }
          .sparkle-12 { 
            top: 70%; 
            left: -8%; 
            animation: sparkle-4 3.3s ease-in-out infinite;
            animation-delay: 0.6s;
          }
          .sparkle-13 { 
            top: 15%; 
            left: 25%; 
            animation: sparkle-5 2.2s ease-in-out infinite;
            animation-delay: 2.1s;
          }
          .sparkle-14 { 
            top: 85%; 
            left: 75%; 
            animation: sparkle-6 2.9s ease-in-out infinite;
            animation-delay: 1.6s;
          }
          .sparkle-15 { 
            top: 50%; 
            left: 50%; 
            animation: sparkle-7 3.4s ease-in-out infinite;
            animation-delay: 0.4s;
          }
          .sparkle-16 { 
            top: 5%; 
            left: 80%; 
            animation: sparkle-8 2.1s ease-in-out infinite;
            animation-delay: 1.9s;
          }
          
          .particle-container {
            position: relative;
            display: inline-block;
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
              <div className="sparkle sparkle-small sparkle-1"></div>
              <div className="sparkle sparkle-medium sparkle-2"></div>
              <div className="sparkle sparkle-small sparkle-3"></div>
              <div className="sparkle sparkle-large sparkle-4"></div>
              <div className="sparkle sparkle-medium sparkle-5"></div>
              <div className="sparkle sparkle-small sparkle-6"></div>
              <div className="sparkle sparkle-large sparkle-7"></div>
              <div className="sparkle sparkle-medium sparkle-8"></div>
              <div className="sparkle sparkle-small sparkle-9"></div>
              <div className="sparkle sparkle-medium sparkle-10"></div>
              <div className="sparkle sparkle-large sparkle-11"></div>
              <div className="sparkle sparkle-small sparkle-12"></div>
              <div className="sparkle sparkle-medium sparkle-13"></div>
              <div className="sparkle sparkle-small sparkle-14"></div>
              <div className="sparkle sparkle-large sparkle-15"></div>
              <div className="sparkle sparkle-medium sparkle-16"></div>
            </span>
            <span> Cards.</span>
            <br />
            <span className="particle-container rainbow-text">
              Better
              <div className="sparkle sparkle-medium sparkle-1"></div>
              <div className="sparkle sparkle-small sparkle-2"></div>
              <div className="sparkle sparkle-large sparkle-3"></div>
              <div className="sparkle sparkle-medium sparkle-4"></div>
              <div className="sparkle sparkle-small sparkle-5"></div>
              <div className="sparkle sparkle-large sparkle-6"></div>
              <div className="sparkle sparkle-medium sparkle-7"></div>
              <div className="sparkle sparkle-small sparkle-8"></div>
              <div className="sparkle sparkle-medium sparkle-9"></div>
              <div className="sparkle sparkle-large sparkle-10"></div>
              <div className="sparkle sparkle-small sparkle-11"></div>
              <div className="sparkle sparkle-medium sparkle-12"></div>
              <div className="sparkle sparkle-large sparkle-13"></div>
              <div className="sparkle sparkle-small sparkle-14"></div>
              <div className="sparkle sparkle-medium sparkle-15"></div>
              <div className="sparkle sparkle-large sparkle-16"></div>
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
