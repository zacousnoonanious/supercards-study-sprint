
import React from 'react';
import { Brain, Users, BarChart3, Sparkles, Globe, Mic } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export const FeaturesSection = () => {
  const { t } = useI18n();

  const features = [
    { 
      icon: Sparkles, 
      title: 'AI-Powered Creation',
      description: 'Generate flashcards instantly with our advanced AI technology'
    },
    { 
      icon: Users, 
      title: 'Real-time Collaboration',
      description: 'Work together with your team in real-time on any device'
    },
    { 
      icon: BarChart3, 
      title: 'Progress Analytics',
      description: 'Track your learning progress with detailed insights and statistics'
    },
    { 
      icon: Brain, 
      title: 'Smart Study Modes',
      description: 'Adaptive learning algorithms that adjust to your pace'
    },
    { 
      icon: Globe, 
      title: 'Multi-language Support',
      description: 'Create and study in multiple languages with translation features'
    },
    { 
      icon: Mic, 
      title: 'Voice Integration',
      description: 'Text-to-speech and voice recording for enhanced learning'
    }
  ];

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, collaborate, and learn with interactive flashcards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-purple-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
