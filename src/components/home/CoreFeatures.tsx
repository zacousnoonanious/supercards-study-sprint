
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
      {/* Organic gradient background with morphing shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        {/* Large organic blob shapes */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full"
          style={{ 
            transform: `translateY(${scrollY * 0.3}px) translateX(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0005})`,
            filter: 'blur(60px)'
          }}
        ></div>
        <div 
          className="absolute top-1/3 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/50 to-purple-300/50 rounded-full"
          style={{ 
            transform: `translateY(${scrollY * -0.2}px) translateX(${scrollY * -0.15}px) scale(${1 + scrollY * 0.0003})`,
            filter: 'blur(80px)'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-300/60 to-yellow-300/60 rounded-full"
          style={{ 
            transform: `translateY(${scrollY * 0.4}px) rotate(${scrollY * 0.1}deg)`,
            filter: 'blur(70px)'
          }}
        ></div>
        
        {/* Floating geometric elements */}
        <div 
          className="absolute top-20 left-16 w-8 h-8 bg-purple-400/70 rounded-full"
          style={{ transform: `translateY(${scrollY * 0.6}px) rotate(${scrollY * 0.5}deg)` }}
        ></div>
        <div 
          className="absolute top-40 right-24 w-6 h-6 bg-pink-400/60"
          style={{ 
            transform: `translateY(${scrollY * 0.8}px) rotate(${scrollY * 0.3}deg)`,
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}
        ></div>
        <div 
          className="absolute bottom-32 right-16 w-12 h-12 bg-blue-400/50"
          style={{ 
            transform: `translateY(${scrollY * -0.4}px) rotate(${scrollY * 0.2}deg)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        ></div>
        <div 
          className="absolute top-1/2 left-20 w-4 h-4 bg-yellow-400/80 rounded-full"
          style={{ transform: `translateY(${scrollY * 0.7}px) scale(${1 + Math.sin(scrollY * 0.01) * 0.3})` }}
        ></div>

        {/* Confetti elements with enhanced parallax */}
        <div 
          className="absolute top-24 right-1/3 w-10 h-10 opacity-40"
          style={{ transform: `translateY(${scrollY * 0.9}px) rotate(${scrollY * 0.4}deg)` }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-40 left-1/5 w-8 h-8 opacity-50"
          style={{ transform: `translateY(${scrollY * 1.2}px) rotate(${scrollY * -0.3}deg)` }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Overlay confetti with stronger parallax */}
      <div 
        className="absolute top-16 left-1/4 w-6 h-6 opacity-30 z-20"
        style={{ transform: `translateY(${scrollY * 1.5}px) rotate(${scrollY * 0.6}deg)` }}
      >
        <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
      </div>
      <div 
        className="absolute bottom-24 right-1/3 w-4 h-4 opacity-40 z-20"
        style={{ transform: `translateY(${scrollY * -1.1}px) rotate(${scrollY * 0.8}deg)` }}
      >
        <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
      </div>

      {/* Purple character with enhanced floating */}
      <div 
        className="absolute bottom-8 left-8 z-10"
        style={{ transform: `translateY(${scrollY * 0.2}px) rotate(${Math.sin(scrollY * 0.01) * 2}deg)` }}
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
              className="text-center hover:shadow-lg transition-all duration-300 bg-white/30 backdrop-blur-md border-white/40 hover:border-purple-200/60 hover:scale-105"
            >
              <CardHeader>
                <feature.icon className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-700">{feature.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
