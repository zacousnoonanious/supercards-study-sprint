import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Type, Image, Layers, Zap, MousePointer } from 'lucide-react';

export const CardEditorShowcase = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Palette, title: "Visual Design", desc: "Drag and drop interface with real-time preview" },
    { icon: Type, title: "Rich Text", desc: "Advanced text formatting and typography controls" },
    { icon: Image, title: "Media Support", desc: "Add images, videos, and audio to your cards" },
    { icon: Layers, title: "Multiple Sides", desc: "Create front and back sides with different layouts" },
    { icon: Zap, title: "Templates", desc: "Start with professional templates or build from scratch" },
    { icon: MousePointer, title: "Interactive", desc: "Add quizzes, polls, and interactive elements" }
  ];

  const floatingCards = [
    { text: "Card Editor", x: 8, y: 15, delay: 0 },
    { text: "Design Tools", x: 88, y: 25, delay: 3 },
    { text: "Templates", x: 12, y: 85, delay: 1.5 },
    { text: "Rich Media", x: 85, y: 75, delay: 4.5 },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Liquid-like flowing background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-200 via-red-100 to-pink-200">
        {/* Flowing liquid shapes */}
        <div 
          className="absolute -top-60 left-1/5 w-[700px] h-[700px] bg-gradient-to-br from-orange-400/25 to-red-400/25"
          style={{ 
            transform: `translateY(${scrollY * 0.6}px) rotate(${scrollY * 0.2}deg) scale(${1.1 + Math.sin(scrollY * 0.008) * 0.4})`,
            borderRadius: `${70 + Math.sin(scrollY * 0.015) * 30}% ${30 + Math.cos(scrollY * 0.02) * 40}% ${60 + Math.sin(scrollY * 0.018) * 25}% ${80 + Math.cos(scrollY * 0.01) * 20}%`,
            filter: 'blur(120px)'
          }}
        ></div>
        <div 
          className="absolute top-1/4 -right-80 w-[800px] h-[800px] bg-gradient-to-br from-red-400/30 to-pink-400/30"
          style={{ 
            transform: `translateY(${scrollY * -0.4}px) rotate(${scrollY * -0.15}deg) scale(${1.3 + Math.cos(scrollY * 0.01) * 0.3})`,
            borderRadius: `${40 + Math.cos(scrollY * 0.02) * 35}% ${85 + Math.sin(scrollY * 0.015) * 15}% ${25 + Math.cos(scrollY * 0.018) * 45}% ${95 + Math.sin(scrollY * 0.012) * 5}%`,
            filter: 'blur(110px)'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/6 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/40 to-orange-400/40"
          style={{ 
            transform: `translateY(${scrollY * 0.7}px) rotate(${scrollY * 0.25}deg) scale(${0.9 + Math.sin(scrollY * 0.012) * 0.5})`,
            borderRadius: `${90 + Math.sin(scrollY * 0.02) * 10}% ${20 + Math.cos(scrollY * 0.025) * 50}% ${75 + Math.sin(scrollY * 0.015) * 25}% ${45 + Math.cos(scrollY * 0.018) * 35}%`,
            filter: 'blur(95px)'
          }}
        ></div>

        {/* Morphing crystalline elements */}
        <div 
          className="absolute top-20 left-1/4 w-24 h-24 bg-orange-500/50"
          style={{ 
            transform: `translateY(${scrollY * 1.4}px) rotate(${scrollY * 0.9}deg) scale(${0.8 + Math.sin(scrollY * 0.025) * 0.6})`,
            clipPath: `polygon(50% 0%, ${80 + Math.sin(scrollY * 0.02) * 20}% 38%, ${82 + Math.cos(scrollY * 0.015) * 18}% 100%, ${18 + Math.sin(scrollY * 0.018) * 20}% 100%, ${0 + Math.cos(scrollY * 0.01) * 15}% 38%)`
          }}
        ></div>
        <div 
          className="absolute bottom-32 right-1/4 w-20 h-20 bg-red-500/60"
          style={{ 
            transform: `translateY(${scrollY * -1.1}px) rotate(${scrollY * -0.7}deg)`,
            borderRadius: `${30 + Math.sin(scrollY * 0.03) * 40}% ${70 + Math.cos(scrollY * 0.02) * 30}%`
          }}
        ></div>

        {/* Enhanced confetti with wave motion */}
        <div 
          className="absolute top-32 right-1/3 w-18 h-18 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 1.6}px) rotate(${scrollY * 1.2}deg) translateX(${Math.sin(scrollY * 0.02) * 50}px) scale(${0.8 + Math.cos(scrollY * 0.015) * 0.4})`
          }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-48 left-1/5 w-14 h-14 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * -1.4}px) rotate(${scrollY * -1.0}deg) translateX(${Math.cos(scrollY * 0.018) * 35}px)`
          }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Floating editor cards */}
      {floatingCards.map((card, index) => (
        <div
          key={index}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `translateY(${Math.sin((scrollY + card.delay * 120) * 0.012) * 35}px) rotate(${Math.cos((scrollY + card.delay * 60) * 0.01) * 12}deg) scale(${0.7 + Math.sin((scrollY + card.delay * 90) * 0.015) * 0.4})`,
            opacity: 0.3 + Math.sin((scrollY + card.delay * 100) * 0.008) * 0.4
          }}
        >
          <div className="bg-orange-100/30 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-200/40 text-sm font-semibold text-orange-800">
            {card.text}
          </div>
        </div>
      ))}

      {/* Owl character with enhanced floating */}
      <div 
        className="absolute bottom-16 right-16 z-20"
        style={{ 
          transform: `translateY(${scrollY * 0.2}px) rotate(${Math.sin(scrollY * 0.018) * 6}deg) translateX(${Math.cos(scrollY * 0.012) * 20}px) scale(${1 + Math.sin(scrollY * 0.01) * 0.1})`
        }}
      >
        <img 
          src="/lovable-uploads/a6282a15-30cb-4623-9be5-1d696af06c06.png" 
          alt="Orange owl character" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain animate-float"
          style={{ animationDelay: '1.5s' }}
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
                      transform: `translateY(${Math.sin((scrollY + index * 80) * 0.008) * 8}px)`,
                      borderRadius: `${25 + Math.sin((scrollY + index * 40) * 0.015) * 10}px`
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

            {/* Enhanced Editor Preview */}
            <div className="relative">
              <div 
                className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30"
                style={{
                  transform: `translateY(${Math.sin(scrollY * 0.01) * 15}px) rotate(${Math.cos(scrollY * 0.008) * 2}deg)`,
                  borderRadius: `${30 + Math.sin(scrollY * 0.015) * 10}px`
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
                
                <div 
                  className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 rounded-2xl p-10 border-2 border-dashed border-orange-300/60 min-h-[350px] flex flex-col justify-center items-center text-center"
                  style={{
                    borderRadius: `${20 + Math.sin(scrollY * 0.02) * 10}px`
                  }}
                >
                  <div className="w-20 h-20 bg-orange-200/80 rounded-full flex items-center justify-center mb-6">
                    <Type className="w-10 h-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    What is React?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Click to reveal answer
                  </p>
                  <div className="flex space-x-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center mt-6 space-x-6 p-4 bg-orange-100/50 rounded-2xl">
                  <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center">
                    <Type className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </div>
              
              {/* Enhanced floating elements */}
              <div 
                className="absolute -top-6 -right-6 w-12 h-12 bg-orange-500 rounded-full opacity-80"
                style={{ 
                  transform: `translateY(${Math.sin(scrollY * 0.02) * 20}px) rotate(${scrollY * 0.5}deg) scale(${1 + Math.cos(scrollY * 0.015) * 0.3})`
                }}
              ></div>
              <div 
                className="absolute -bottom-6 -left-6 w-8 h-8 bg-yellow-500 rounded-full opacity-80"
                style={{ 
                  transform: `translateY(${Math.cos(scrollY * 0.018) * 15}px) rotate(${scrollY * -0.3}deg)`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
