
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap, BarChart3, Sparkles } from 'lucide-react';

export const CoreFeatures = () => {
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
    <section className="py-20">
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
            className="text-center hover:shadow-lg transition-all duration-300 bg-white border-gray-200 hover:border-purple-200 hover:scale-105"
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
    </section>
  );
};
