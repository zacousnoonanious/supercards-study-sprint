
import React from 'react';
import { Sparkles, Brain, Globe, BarChart3, Mic, Download } from 'lucide-react';

export const AdvancedFeatures = () => {
  const features = [
    { icon: Sparkles, title: "AI-Powered Quiz Generation", desc: "Instantly turn any set of cards into multiple-choice or true/false quizzes with immediate feedback." },
    { icon: Brain, title: "AI Deck Generator", desc: "Enter any topic and let our AI create a complete deck of 5-10 cards ready for review." },
    { icon: Globe, title: "Visual Card Editor", desc: "Drag, drop, resize, and rotate text blocks, images, and widgets directly on each card." },
    { icon: BarChart3, title: "Advanced Analytics", desc: "Track learning streaks, accuracy rates, completion times, and identify weak topics." },
    { icon: Mic, title: "Speech Tools", desc: "Text-to-speech and pronunciation analysis with accuracy scoring and feedback." },
    { icon: Download, title: "Offline Support", desc: "Download decks for offline review and sync progress when back online." }
  ];

  return (
    <div className="mb-20 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-8 animate-fade-in">
      <h3 className="text-3xl font-bold text-center mb-12">Powerful Features for Every Learner</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="text-center p-4">
            <feature.icon className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h4 className="font-semibold mb-2">{feature.title}</h4>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
