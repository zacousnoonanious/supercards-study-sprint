
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Type, Image, Layers, Zap, MousePointer } from 'lucide-react';

export const CardEditorShowcase = () => {
  const [scrollY, setScrollY] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation for step 1
  useEffect(() => {
    if (animationStep === 1) {
      const text = "What is Photosynthesis?";
      setTypingText('');
      let currentIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= text.length) {
          setTypingText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 100);

      return () => clearInterval(typingInterval);
    }
  }, [animationStep]);

  // Cursor dragging animation for step 2
  useEffect(() => {
    if (animationStep === 2) {
      setCursorPosition({ x: 20, y: 20 });
      
      const dragInterval = setInterval(() => {
        setCursorPosition(prev => ({
          x: Math.min(prev.x + 2, 80),
          y: Math.min(prev.y + 1, 60)
        }));
      }, 50);

      setTimeout(() => clearInterval(dragInterval), 2000);
      return () => clearInterval(dragInterval);
    }
  }, [animationStep]);

  const features = [
    { icon: Palette, title: "Visual Design", desc: "Drag and drop interface with real-time preview" },
    { icon: Type, title: "Rich Text", desc: "Advanced text formatting and typography controls" },
    { icon: Image, title: "Media Support", desc: "Add images, videos, and audio to your cards" },
    { icon: Layers, title: "Multiple Sides", desc: "Create front and back sides with different layouts" },
    { icon: Zap, title: "Templates", desc: "Start with professional templates or build from scratch" },
    { icon: MousePointer, title: "Interactive", desc: "Add quizzes, polls, and interactive elements" }
  ];

  // Move floating cards away from the editor demo area (left side only)
  const flashcards = [
    { front: "Ecosystem", back: "A community of organisms and their environment", x: 2, y: 15, delay: 0 },
    { front: "Renaissance", back: "Period of cultural rebirth in 14th-17th century Europe", x: 8, y: 65, delay: 3 },
    { front: "Mitochondria", back: "Organelle that produces energy in cells", x: 5, y: 85, delay: 1.5 },
    { front: "Democracy", back: "Government system where citizens choose leaders", x: 12, y: 45, delay: 4.5 },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Liquid-like flowing background with subtle motion */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 via-red-100 to-pink-200">
        {/* Flowing liquid shapes with constant subtle motion */}
        <div 
          className="absolute -top-60 left-1/5 w-[700px] h-[700px] bg-gradient-to-br from-orange-400/25 to-red-400/25"
          style={{ 
            transform: `translateY(${scrollY * 0.6 + Math.sin(Date.now() * 0.0008) * 15}px) rotate(${scrollY * 0.2 + Date.now() * 0.0004}deg) scale(${1.1 + Math.sin(scrollY * 0.008 + Date.now() * 0.0006) * 0.4})`,
            borderRadius: `${70 + Math.sin(scrollY * 0.015 + Date.now() * 0.001) * 30}% ${30 + Math.cos(scrollY * 0.02 + Date.now() * 0.0012) * 40}% ${60 + Math.sin(scrollY * 0.018 + Date.now() * 0.0009) * 25}% ${80 + Math.cos(scrollY * 0.01 + Date.now() * 0.0007) * 20}%`,
            filter: 'blur(120px)'
          }}
        ></div>
        <div 
          className="absolute top-1/4 -right-80 w-[800px] h-[800px] bg-gradient-to-br from-red-400/30 to-pink-400/30"
          style={{ 
            transform: `translateY(${scrollY * -0.4 + Math.cos(Date.now() * 0.001) * 12}px) rotate(${scrollY * -0.15 + Date.now() * 0.0005}deg) scale(${1.3 + Math.cos(scrollY * 0.01 + Date.now() * 0.0008) * 0.3})`,
            borderRadius: `${40 + Math.cos(scrollY * 0.02 + Date.now() * 0.0009) * 35}% ${85 + Math.sin(scrollY * 0.015 + Date.now() * 0.0011) * 15}% ${25 + Math.cos(scrollY * 0.018 + Date.now() * 0.0006) * 45}% ${95 + Math.sin(scrollY * 0.012 + Date.now() * 0.001) * 5}%`,
            filter: 'blur(110px)'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/6 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/40 to-orange-400/40"
          style={{ 
            transform: `translateY(${scrollY * 0.7 + Math.sin(Date.now() * 0.0009) * 10}px) rotate(${scrollY * 0.25 + Date.now() * 0.0006}deg) scale(${0.9 + Math.sin(scrollY * 0.012 + Date.now() * 0.0004) * 0.5})`,
            borderRadius: `${90 + Math.sin(scrollY * 0.02 + Date.now() * 0.001) * 10}% ${20 + Math.cos(scrollY * 0.025 + Date.now() * 0.0008) * 50}% ${75 + Math.sin(scrollY * 0.015 + Date.now() * 0.0012) * 25}% ${45 + Math.cos(scrollY * 0.018 + Date.now() * 0.0007) * 35}%`,
            filter: 'blur(95px)'
          }}
        ></div>

        {/* Morphing crystalline elements with subtle motion */}
        <div 
          className="absolute top-20 left-1/4 w-24 h-24 bg-orange-500/50"
          style={{ 
            transform: `translateY(${scrollY * 1.4 + Math.sin(Date.now() * 0.002) * 8}px) rotate(${scrollY * 0.9 + Date.now() * 0.001}deg) scale(${0.8 + Math.sin(scrollY * 0.025 + Date.now() * 0.0015) * 0.6})`,
            clipPath: `polygon(50% 0%, ${80 + Math.sin(scrollY * 0.02 + Date.now() * 0.001) * 20}% 38%, ${82 + Math.cos(scrollY * 0.015 + Date.now() * 0.0012) * 18}% 100%, ${18 + Math.sin(scrollY * 0.018 + Date.now() * 0.0009) * 20}% 100%, ${0 + Math.cos(scrollY * 0.01 + Date.now() * 0.0008) * 15}% 38%)`
          }}
        ></div>

        {/* Enhanced confetti with subtle floating */}
        <div 
          className="absolute top-32 right-1/3 w-18 h-18 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 1.6 + Math.sin(Date.now() * 0.0018) * 6}px) rotate(${scrollY * 1.2 + Date.now() * 0.001}deg) translateX(${Math.sin(scrollY * 0.02 + Date.now() * 0.0012) * 50}px) scale(${0.8 + Math.cos(scrollY * 0.015 + Date.now() * 0.0008) * 0.4})`
          }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-48 left-1/5 w-14 h-14 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * -1.4 + Math.cos(Date.now() * 0.0015) * 7}px) rotate(${scrollY * -1.0 + Date.now() * 0.0009}deg) translateX(${Math.cos(scrollY * 0.018 + Date.now() * 0.001) * 35}px)`
          }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Floating editor flashcards - moved to left side only */}
      {flashcards.map((card, index) => (
        <div
          key={index}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `translateY(${Math.sin((scrollY + card.delay * 120 + Date.now() * 0.001) * 0.012) * 25}px) rotate(${Math.cos((scrollY + card.delay * 60 + Date.now() * 0.0008) * 0.01) * 6}deg)`,
            opacity: 0.25 + Math.sin((scrollY + card.delay * 100 + Date.now() * 0.0012) * 0.008) * 0.35
          }}
        >
          <div 
            className="relative w-28 h-18 [perspective:1000px]"
            style={{
              transform: `rotateY(${Math.sin((scrollY + card.delay * 180 + Date.now() * 0.0016) * 0.004) > 0 ? 0 : 180}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.8s ease-in-out'
            }}
          >
            {/* Front of card */}
            <div className="absolute inset-0 w-full h-full bg-orange-100/60 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/40 p-3 flex items-center justify-center [backface-visibility:hidden]">
              <p className="text-xs font-semibold text-orange-800 text-center">{card.front}</p>
            </div>
            <div 
              className="absolute inset-0 w-full h-full bg-red-100/60 backdrop-blur-sm rounded-xl shadow-lg border border-red-200/40 p-3 flex items-center justify-center [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-red-800 text-center">{card.back}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Owl character with subtle enhanced floating */}
      <div 
        className="absolute bottom-16 right-16 z-20"
        style={{ 
          transform: `translateY(${scrollY * 0.2 + Math.sin(Date.now() * 0.0018) * 6}px) rotate(${Math.sin(scrollY * 0.018 + Date.now() * 0.001) * 4}deg) translateX(${Math.cos(scrollY * 0.012 + Date.now() * 0.0008) * 12}px) scale(${1 + Math.sin(scrollY * 0.01 + Date.now() * 0.0006) * 0.08})`
        }}
      >
        <img 
          src="/lovable-uploads/a6282a15-30cb-4623-9be5-1d696af06c06.png" 
          alt="Orange owl character" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain"
          style={{ 
            animation: 'float 3.5s ease-in-out infinite',
            animationDelay: '1.5s'
          }}
        />
      </div>

      <div className="relative z-10 w-full px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our Built-in Card Editor
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto">
              Create stunning, interactive flashcards with our powerful visual editor. 
              No design experience needed.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Features List */}
            <div className="space-y-10">
              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-4 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
                    style={{
                      transform: `translateY(${Math.sin((scrollY + index * 80 + Date.now() * 0.0008) * 0.008) * 6}px)`,
                      borderRadius: `${25 + Math.sin((scrollY + index * 40 + Date.now() * 0.001) * 0.015) * 10}px`
                    }}
                  >
                    <feature.icon className="w-8 h-8 text-orange-600 mt-1 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                      <p className="text-gray-800">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="pt-8">
                <Link to="/auth">
                  <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 text-xl rounded-full">
                    Try the Editor Free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Editor Preview with Reduced Movement */}
            <div className="relative">
              <div 
                className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
                style={{
                  transform: `translateY(${Math.sin(scrollY * 0.001 + Date.now() * 0.0002) * 2}px) rotate(${Math.cos(scrollY * 0.0005 + Date.now() * 0.0001) * 0.3}deg)`,
                  borderRadius: `${30 + Math.sin(scrollY * 0.002 + Date.now() * 0.0002) * 2}px`
                }}
              >
                {/* Mock Editor Interface */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/30">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                    <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="text-gray-700 font-medium">Card Editor</div>
                </div>
                
                {/* Enhanced Animated Card Building Demo */}
                <div 
                  className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 rounded-2xl p-10 border-2 border-dashed border-orange-300/60 min-h-[350px] flex flex-col justify-center items-center text-center relative overflow-hidden"
                  style={{
                    borderRadius: `${20 + Math.sin(scrollY * 0.002 + Date.now() * 0.0002) * 2}px`
                  }}
                >
                  {/* Animated cursor */}
                  <div 
                    className={`absolute w-6 h-6 transition-all duration-1000 pointer-events-none z-20 ${
                      animationStep === 0 ? 'top-4 left-4' : 
                      animationStep === 1 ? 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' :
                      animationStep === 2 ? `top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2` :
                      'bottom-4 right-4'
                    }`}
                    style={animationStep === 2 ? {
                      left: `${cursorPosition.x}%`,
                      top: `${cursorPosition.y}%`
                    } : {}}
                  >
                    <MousePointer className="w-6 h-6 text-orange-600" />
                  </div>

                  {/* Step 1: Empty state */}
                  {animationStep === 0 && (
                    <div className="animate-fade-in">
                      <div className="w-20 h-20 bg-orange-200/80 rounded-full flex items-center justify-center mb-6">
                        <Type className="w-10 h-10 text-orange-600" />
                      </div>
                      <p className="text-gray-600">Click to add text...</p>
                    </div>
                  )}

                  {/* Step 2: Adding title with typing animation */}
                  {animationStep === 1 && (
                    <div className="animate-scale-in">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {typingText}
                        <span className="animate-pulse">|</span>
                      </h3>
                    </div>
                  )}

                  {/* Step 3: Adding image with dragging animation */}
                  {animationStep === 2 && (
                    <div className="animate-fade-in">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        What is Photosynthesis?
                      </h3>
                      <div 
                        className="relative bg-orange-100 rounded-lg border-2 border-dashed border-orange-300 transition-all duration-100"
                        style={{
                          width: `${Math.min(120 + (cursorPosition.x - 20) * 2, 200)}px`,
                          height: `${Math.min(80 + (cursorPosition.y - 20) * 1.5, 120)}px`
                        }}
                      >
                        <Image className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Drag to resize</p>
                    </div>
                  )}

                  {/* Step 4: Completed card preview */}
                  {animationStep === 3 && (
                    <div className="animate-scale-in">
                      <div className="bg-white/90 rounded-xl p-6 shadow-lg border border-green-200 max-w-xs">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">
                          What is Photosynthesis?
                        </h3>
                        <div className="bg-green-100 rounded-lg p-3 mb-4 flex items-center justify-center">
                          <div className="w-16 h-12 bg-green-200 rounded flex items-center justify-center">
                            <span className="text-xs text-green-700">🌱</span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">
                          The process by which plants convert sunlight into energy
                        </p>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-green-600 font-medium">Card Ready!</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Toolbar */}
                <div className="flex items-center justify-center mt-6 space-x-6 p-4 bg-orange-100/50 rounded-2xl">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    animationStep === 1 ? 'bg-orange-500 scale-110' : 'bg-orange-200'
                  }`}>
                    <Type className={`w-5 h-5 ${animationStep === 1 ? 'text-white' : 'text-orange-600'}`} />
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    animationStep === 2 ? 'bg-orange-500 scale-110' : 'bg-gray-200'
                  }`}>
                    <Image className={`w-5 h-5 ${animationStep === 2 ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-500 ${
                    animationStep === 3 ? 'bg-green-500 scale-110' : 'bg-gray-200'
                  }`}>
                    <Palette className={`w-5 h-5 ${animationStep === 3 ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
              
              {/* Floating elements with reduced movement */}
              <div 
                className="absolute -top-6 -right-6 w-12 h-12 bg-orange-500 rounded-full opacity-80"
                style={{ 
                  transform: `translateY(${Math.sin(scrollY * 0.002 + Date.now() * 0.0003) * 2}px) rotate(${scrollY * 0.025 + Date.now() * 0.0002}deg) scale(${1 + Math.cos(scrollY * 0.002 + Date.now() * 0.0002) * 0.04})`
                }}
              ></div>
              <div 
                className="absolute -bottom-6 -left-6 w-8 h-8 bg-yellow-500 rounded-full opacity-80"
                style={{ 
                  transform: `translateY(${Math.cos(scrollY * 0.002 + Date.now() * 0.0003) * 2}px) rotate(${scrollY * -0.02 + Date.now() * 0.0001}deg)`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
