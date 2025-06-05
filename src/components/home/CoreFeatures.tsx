
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Users, Zap } from 'lucide-react';

export const CoreFeatures = () => {
  const features = [
    { icon: BookOpen, title: "Create Sets", desc: "Organize your flashcards into custom sets for different subjects and topics." },
    { icon: Brain, title: "Smart Study", desc: "Study mode with instant feedback to track your progress and identify weak areas." },
    { icon: Zap, title: "Track Progress", desc: "Monitor your learning with detailed statistics and performance tracking." },
    { icon: Users, title: "Share & Collaborate", desc: "Share decks with others and collaborate on learning materials." }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
      {features.map((feature, index) => (
        <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 bg-white/90 backdrop-blur-sm hover-scale" style={{ animationDelay: `${index * 0.1}s` }}>
          <CardHeader>
            <feature.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <CardTitle>{feature.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{feature.desc}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
