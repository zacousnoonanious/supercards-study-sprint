
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap, BarChart3, Sparkles } from 'lucide-react';

export const CoreFeatures = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { 
      icon: BookOpen, 
      title: "Smart Organization", 
      desc: "Organize flashcards into decks and sets. Tag, filter, and search to find content instantly." 
    },
    { 
      icon: Brain, 
      title: "AI-Powered Learning", 
      desc: "Generate quizzes automatically, get study recommendations, and track your progress with AI insights." 
    },
    { 
      icon: Sparkles, 
      title: "Interactive Cards", 
      desc: "Create engaging content with polls, quizzes, media, and interactive elements that boost retention." 
    },
    { 
      icon: BarChart3, 
      title: "Progress Tracking", 
      desc: "Detailed analytics show your learning streaks, weak areas, and improvement over time." 
    },
    { 
      icon: Users, 
      title: "Collaborate & Share", 
      desc: "Share decks with teammates, study together, and access thousands of community-created sets." 
    },
    { 
      icon: Zap, 
      title: "Study Anywhere", 
      desc: "Offline support, mobile-optimized interface, and sync across all your devices seamlessly." 
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Parallax Background with floating elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
        {/* Floating geometric shapes */}
        <div 
          className="absolute top-20 left-10 w-16 h-16 bg-purple-300 rounded-full opacity-60"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        ></div>
        <div 
          className="absolute top-32 right-20 w-12 h-12 bg-blue-300 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 0.15}px) rotate(45deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute top-40 left-1/4 w-8 h-8 bg-pink-300 opacity-70"
          style={{ 
            transform: `translateY(${scrollY * 0.08}px) rotate(12deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-40 right-10 w-20 h-20 bg-blue-300 rounded-full opacity-40"
          style={{ transform: `translateY(${scrollY * 0.12}px)` }}
        ></div>
        <div 
          className="absolute bottom-60 left-16 w-10 h-10 bg-cyan-300 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * 0.2}px) rotate(45deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute top-1/3 right-1/4 w-14 h-14 bg-pink-300 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 0.18}px) rotate(12deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-1/3 left-1/3 w-18 h-18 bg-purple-300 rounded-full opacity-50"
          style={{ transform: `translateY(${scrollY * 0.14}px)` }}
        ></div>
        <div 
          className="absolute top-1/4 left-1/2 w-6 h-6 bg-cyan-400 rounded-full opacity-60"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        ></div>
      </div>

      {/* Purple character positioned on the left */}
      <div 
        className="absolute bottom-8 left-8 z-10"
        style={{ transform: `translateY(${scrollY * 0.05}px)` }}
      >
        <img 
          src="/lovable-uploads/c20a6973-ab9f-4e49-b8e9-e4da785bd109.png" 
          alt="Purple character studying" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain animate-float"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything you need to learn faster
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make studying more effective, engaging, and enjoyable.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="text-center hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-200 hover:border-purple-200 hover:scale-105"
            >
              <CardHeader>
                <feature.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
