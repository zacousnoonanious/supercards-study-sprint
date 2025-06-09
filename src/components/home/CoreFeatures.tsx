
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

  const flashcards = [
    { front: "Mitochondria", back: "The powerhouse of the cell that produces energy", x: 15, y: 20, delay: 0 },
    { front: "Magna Carta", back: "1215 document that limited the power of English kings", x: 85, y: 40, delay: 2 },
    { front: "Photosynthesis", back: "Process where plants convert sunlight into chemical energy", x: 10, y: 70, delay: 4 },
    { front: "Newton's First Law", back: "An object in motion stays in motion unless acted upon by a force", x: 90, y: 80, delay: 1 },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Full-width gradient background with organic morphing shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-100 to-blue-200">
        {/* Morphing organic blobs that change shape with subtle constant motion */}
        <div 
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/30 to-pink-400/30"
          style={{ 
            transform: `translateY(${scrollY * 0.4 + Math.sin(Date.now() * 0.001) * 10}px) translateX(${scrollY * 0.1 + Math.cos(Date.now() * 0.0015) * 8}px) scale(${1 + Math.sin(scrollY * 0.01 + Date.now() * 0.0008) * 0.3})`,
            borderRadius: `${40 + Math.sin(scrollY * 0.02 + Date.now() * 0.0012) * 20}% ${60 + Math.cos(scrollY * 0.015 + Date.now() * 0.001) * 25}% ${50 + Math.sin(scrollY * 0.018 + Date.now() * 0.0009) * 30}% ${70 + Math.cos(scrollY * 0.012 + Date.now() * 0.0011) * 20}%`,
            filter: 'blur(80px)'
          }}
        ></div>
        <div 
          className="absolute top-1/3 -right-60 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/40 to-purple-400/40"
          style={{ 
            transform: `translateY(${scrollY * -0.3 + Math.cos(Date.now() * 0.0012) * 12}px) translateX(${scrollY * -0.2 + Math.sin(Date.now() * 0.001) * 10}px) rotate(${scrollY * 0.1 + Date.now() * 0.0005}deg)`,
            borderRadius: `${60 + Math.cos(scrollY * 0.01 + Date.now() * 0.0008) * 30}% ${40 + Math.sin(scrollY * 0.02 + Date.now() * 0.001) * 25}% ${80 + Math.cos(scrollY * 0.015 + Date.now() * 0.0007) * 20}% ${30 + Math.sin(scrollY * 0.018 + Date.now() * 0.0013) * 35}%`,
            filter: 'blur(100px)'
          }}
        ></div>
        <div 
          className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-400/50 to-yellow-400/50"
          style={{ 
            transform: `translateY(${scrollY * 0.5 + Math.sin(Date.now() * 0.0009) * 8}px) rotate(${scrollY * 0.15 + Date.now() * 0.0006}deg) scale(${1.2 + Math.cos(scrollY * 0.008 + Date.now() * 0.0004) * 0.4})`,
            borderRadius: `${50 + Math.sin(scrollY * 0.025 + Date.now() * 0.001) * 40}% ${90 + Math.cos(scrollY * 0.02 + Date.now() * 0.0008) * 10}% ${30 + Math.sin(scrollY * 0.015 + Date.now() * 0.0012) * 50}% ${70 + Math.cos(scrollY * 0.018 + Date.now() * 0.0007) * 30}%`,
            filter: 'blur(90px)'
          }}
        ></div>

        {/* Dynamic geometric elements with subtle constant motion */}
        <div 
          className="absolute top-32 left-20 w-16 h-16 bg-purple-500/60"
          style={{ 
            transform: `translateY(${scrollY * 0.8 + Math.sin(Date.now() * 0.002) * 5}px) rotate(${scrollY * 0.6 + Date.now() * 0.001}deg) scale(${1 + Math.sin(scrollY * 0.02 + Date.now() * 0.0015) * 0.5})`,
            borderRadius: `${20 + Math.sin(scrollY * 0.03 + Date.now() * 0.001) * 30}%`,
          }}
        ></div>
        <div 
          className="absolute top-60 right-32 w-12 h-12 bg-pink-500/70"
          style={{ 
            transform: `translateY(${scrollY * 1.2 + Math.cos(Date.now() * 0.0018) * 6}px) rotate(${scrollY * -0.4 + Date.now() * 0.0008}deg)`,
            clipPath: `polygon(50% 0%, ${20 + Math.sin(scrollY * 0.02 + Date.now() * 0.001) * 30}% 100%, ${80 + Math.cos(scrollY * 0.015 + Date.now() * 0.0012) * 20}% 100%)`
          }}
        ></div>

        {/* Enhanced confetti with subtle floating */}
        <div 
          className="absolute top-40 left-1/3 w-16 h-16 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * 1.5 + Math.sin(Date.now() * 0.002) * 8}px) rotate(${scrollY * 0.8 + Date.now() * 0.001}deg) translateX(${Math.sin(scrollY * 0.015 + Date.now() * 0.0015) * 40}px)`
          }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-60 left-1/5 w-12 h-12 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * -1.3 + Math.cos(Date.now() * 0.0012) * 7}px) rotate(${scrollY * -0.7 + Date.now() * 0.0009}deg) translateX(${Math.cos(scrollY * 0.01 + Date.now() * 0.0008) * 30}px)`
          }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Floating flashcards with realistic flip animations */}
      {flashcards.map((card, index) => (
        <div
          key={index}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `translateY(${Math.sin((scrollY + card.delay * 100 + Date.now() * 0.001) * 0.01) * 20}px) rotate(${Math.cos((scrollY + card.delay * 50 + Date.now() * 0.0008) * 0.008) * 8}deg)`,
            opacity: 0.3 + Math.sin((scrollY + card.delay * 80 + Date.now() * 0.0012) * 0.01) * 0.3
          }}
        >
          <div 
            className="relative w-32 h-20 [perspective:1000px]"
            style={{
              transform: `rotateY(${Math.sin((scrollY + card.delay * 150 + Date.now() * 0.0015) * 0.005) > 0 ? 0 : 180}deg)`,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.8s ease-in-out'
            }}
          >
            {/* Front of card */}
            <div className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-purple-200/50 p-3 flex items-center justify-center [backface-visibility:hidden]">
              <p className="text-xs font-medium text-purple-900 text-center">{card.front}</p>
            </div>
            {/* Back of card */}
            <div 
              className="absolute inset-0 w-full h-full bg-purple-100/80 backdrop-blur-sm rounded-lg shadow-lg border border-purple-300/50 p-3 flex items-center justify-center [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              <p className="text-xs text-purple-800 text-center">{card.back}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Purple character floating with enhanced but subtle motion */}
      <div 
        className="absolute bottom-12 left-12 z-20"
        style={{ 
          transform: `translateY(${scrollY * 0.25 + Math.sin(Date.now() * 0.002) * 5}px) rotate(${Math.sin(scrollY * 0.015 + Date.now() * 0.001) * 3}deg) translateX(${Math.cos(scrollY * 0.01 + Date.now() * 0.0008) * 10}px)`
        }}
      >
        <img 
          src="/lovable-uploads/c20a6973-ab9f-4e49-b8e9-e4da785bd109.png" 
          alt="Purple character studying" 
          className="w-36 h-36 md:w-44 md:h-44 object-contain"
          style={{
            animation: 'float 4s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />
      </div>

      <div className="relative z-10 w-full px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything you need to learn faster
            </h2>
            <p className="text-2xl text-gray-700 max-w-4xl mx-auto">
              Powerful features designed to make studying more effective, engaging, and enjoyable.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-2xl transition-all duration-500 bg-white/15 backdrop-blur-lg border-white/20 hover:border-purple-300/40 hover:scale-110 group"
                style={{
                  transform: `translateY(${Math.sin((scrollY + index * 100 + Date.now() * 0.001) * 0.01) * 8}px)`,
                  borderRadius: `${20 + Math.sin((scrollY + index * 50 + Date.now() * 0.0008) * 0.02) * 15}px`
                }}
              >
                <CardHeader>
                  <feature.icon className="w-14 h-14 text-purple-600 mx-auto mb-6 group-hover:scale-125 transition-transform duration-300" />
                  <CardTitle className="text-2xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-800 text-lg">{feature.desc}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
