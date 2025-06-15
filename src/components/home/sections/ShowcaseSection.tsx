
import React from 'react';

export const ShowcaseSection = () => {
  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left content */}
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              See It In Action
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Watch how our intuitive editor makes creating interactive flashcards 
            a breeze. Drag, drop, and customize with ease.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Visual drag-and-drop editor</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Rich media support</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="text-gray-700">Interactive elements</span>
            </div>
          </div>
        </div>

        {/* Right content - Mascots showcase */}
        <div className="relative">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-purple-100">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <img 
                  src="/lovable-uploads/133e0452-917c-4305-aa4a-1d436866de4e.png" 
                  alt="Yellow monster with flashcards" 
                  className="w-20 h-20 mx-auto object-contain animate-float"
                />
                <p className="text-sm text-gray-600 mt-2">Create</p>
              </div>
              <div className="text-center">
                <img 
                  src="/lovable-uploads/04cf0a2e-0c62-48c6-b97b-b195a67b0df1.png" 
                  alt="Teal robot with checkmark" 
                  className="w-20 h-20 mx-auto object-contain animate-float"
                  style={{ animationDelay: '0.5s' }}
                />
                <p className="text-sm text-gray-600 mt-2">Study</p>
              </div>
              <div className="text-center col-span-2">
                <img 
                  src="/lovable-uploads/3198da55-ccb8-4305-94b4-12c41dddfe6d.png" 
                  alt="Orange owl character" 
                  className="w-24 h-24 mx-auto object-contain animate-float"
                  style={{ animationDelay: '1s' }}
                />
                <p className="text-sm text-gray-600 mt-2">Master</p>
              </div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 w-6 h-6 bg-purple-300 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-4 h-4 bg-blue-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
