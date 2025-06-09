
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Palette, Type, Image, Layers, Zap, MousePointer } from 'lucide-react';

export const CardEditorShowcase = () => {
  const features = [
    { icon: Palette, title: "Visual Design", desc: "Drag and drop interface with real-time preview" },
    { icon: Type, title: "Rich Text", desc: "Advanced text formatting and typography controls" },
    { icon: Image, title: "Media Support", desc: "Add images, videos, and audio to your cards" },
    { icon: Layers, title: "Multiple Sides", desc: "Create front and back sides with different layouts" },
    { icon: Zap, title: "Templates", desc: "Start with professional templates or build from scratch" },
    { icon: MousePointer, title: "Interactive", desc: "Add quizzes, polls, and interactive elements" }
  ];

  return (
    <section className="py-20">
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
              <div key={index} className="flex items-start space-x-3">
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
          <div className="bg-white rounded-lg shadow-2xl p-6 border">
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
    </section>
  );
};
