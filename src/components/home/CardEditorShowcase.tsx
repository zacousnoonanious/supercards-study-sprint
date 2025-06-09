
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

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Unique tessellated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 via-yellow-50 to-red-100">
        {/* Hexagonal pattern elements */}
        <div 
          className="absolute top-10 left-10 w-24 h-24 bg-gradient-to-br from-orange-300/30 to-yellow-300/30"
          style={{ 
            transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.2}deg)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
          }}
        ></div>
        <div 
          className="absolute top-32 right-20 w-32 h-32 bg-gradient-to-br from-red-300/40 to-pink-300/40"
          style={{ 
            transform: `translateY(${scrollY * -0.3}px) rotate(${scrollY * -0.15}deg)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
          }}
        ></div>
        <div 
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-br from-yellow-300/50 to-orange-300/50"
          style={{ 
            transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.3}deg)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 right-1/5 w-16 h-16 bg-gradient-to-br from-pink-300/60 to-red-300/60"
          style={{ 
            transform: `translateY(${scrollY * 0.6}px) rotate(${scrollY * -0.4}deg)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
          }}
        ></div>

        {/* Floating diamond shapes */}
        <div 
          className="absolute top-20 right-1/3 w-6 h-6 bg-orange-400/70"
          style={{ 
            transform: `translateY(${scrollY * 0.8}px) rotate(${45 + scrollY * 0.5}deg)`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
        ></div>
        <div 
          className="absolute bottom-32 left-1/3 w-8 h-8 bg-yellow-400/60"
          style={{ 
            transform: `translateY(${scrollY * -0.7}px) rotate(${45 + scrollY * -0.3}deg)`,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'
          }}
        ></div>

        {/* Confetti with unique movement */}
        <div 
          className="absolute top-16 left-1/5 w-12 h-12 opacity-50"
          style={{ transform: `translateY(${scrollY * 1.1}px) rotate(${scrollY * 0.7}deg) scale(${1 + Math.sin(scrollY * 0.02) * 0.2})` }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-48 right-1/4 w-8 h-8 opacity-60"
          style={{ transform: `translateY(${scrollY * -0.9}px) rotate(${scrollY * -0.6}deg)` }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Overlay confetti with enhanced movement */}
      <div 
        className="absolute top-24 right-2/5 w-6 h-6 opacity-30 z-20"
        style={{ transform: `translateY(${scrollY * 1.3}px) rotate(${scrollY * 0.9}deg)` }}
      >
        <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
      </div>
      <div 
        className="absolute bottom-16 left-2/5 w-5 h-5 opacity-40 z-20"
        style={{ transform: `translateY(${scrollY * -1.4}px) rotate(${scrollY * 1.1}deg)` }}
      >
        <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
      </div>

      {/* Owl character with enhanced animation */}
      <div 
        className="absolute bottom-8 right-8 z-10"
        style={{ transform: `translateY(${scrollY * 0.15}px) rotate(${Math.sin(scrollY * 0.015) * 3}deg)` }}
      >
        <img 
          src="/lovable-uploads/a6282a15-30cb-4623-9be5-1d696af06c06.png" 
          alt="Orange owl character" 
          className="w-28 h-28 md:w-36 md:h-36 object-contain animate-float"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Built-in Card Editor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create stunning, interactive flashcards with our powerful visual editor. 
            No design experience needed.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Features List */}
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 bg-white/20 backdrop-blur-lg p-4 rounded-lg border border-white/30">
                  <feature.icon className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-700">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-white">
                  Try the Editor Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Editor Preview */}
          <div className="relative">
            <div className="bg-white/25 backdrop-blur-lg rounded-lg shadow-2xl p-6 border border-white/40">
              {/* Mock Editor Interface */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/30">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-600">Card Editor</div>
              </div>
              
              {/* Mock Card */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-8 border-2 border-dashed border-orange-200 min-h-[300px] flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Type className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What is React?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Click to reveal answer
                </p>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              
              {/* Mock Toolbar */}
              <div className="flex items-center justify-center mt-4 space-x-4 p-3 bg-orange-50/70 rounded-lg">
                <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                  <Type className="w-4 h-4 text-orange-600" />
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Image className="w-4 h-4 text-gray-600" />
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Palette className="w-4 h-4 text-gray-600" />
                </div>
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Layers className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full opacity-80 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-yellow-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};
