
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
      {/* Parallax Background with floating elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-yellow-50 to-purple-100">
        {/* Floating geometric shapes */}
        <div 
          className="absolute top-10 left-20 w-14 h-14 bg-orange-300 rounded-full opacity-60"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>
        <div 
          className="absolute top-24 right-16 w-10 h-10 bg-yellow-300 opacity-70"
          style={{ 
            transform: `translateY(${scrollY * 0.18}px) rotate(45deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute top-48 left-1/5 w-8 h-8 bg-purple-300 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * 0.1}px) rotate(12deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-32 right-12 w-16 h-16 bg-orange-300 rounded-full opacity-50"
          style={{ transform: `translateY(${scrollY * 0.14}px)` }}
        ></div>
        <div 
          className="absolute bottom-48 left-12 w-12 h-12 bg-yellow-300 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * 0.22}px) rotate(45deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute top-2/3 right-1/4 w-12 h-12 bg-purple-300 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 0.16}px) rotate(12deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-orange-300 rounded-full opacity-40"
          style={{ transform: `translateY(${scrollY * 0.11}px)` }}
        ></div>
        <div 
          className="absolute top-1/5 left-2/3 w-6 h-6 bg-yellow-400 rounded-full opacity-70"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        ></div>
      </div>

      {/* Owl character positioned on the right */}
      <div 
        className="absolute top-20 right-8 z-10"
        style={{ transform: `translateY(${scrollY * 0.06}px)` }}
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
                <div key={index} className="flex items-start space-x-3 bg-white/70 backdrop-blur-sm p-4 rounded-lg">
                  <feature.icon className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Try the Editor Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Editor Preview */}
          <div className="relative">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-2xl p-6 border">
              {/* Mock Editor Interface */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="text-sm text-gray-500">Card Editor</div>
              </div>
              
              {/* Mock Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-dashed border-purple-200 min-h-[300px] flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Type className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  What is React?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Click to reveal answer
                </p>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              
              {/* Mock Toolbar */}
              <div className="flex items-center justify-center mt-4 space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <Type className="w-4 h-4 text-purple-600" />
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
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full opacity-80 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};
