
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export const PricingSection = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        'Up to 50 flashcards',
        'Basic templates',
        'Personal use only',
        'Community support'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      description: 'For serious learners',
      features: [
        'Unlimited flashcards',
        'AI-powered generation',
        'Team collaboration',
        'Advanced analytics',
        'Priority support'
      ],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Team',
      price: '$19',
      period: '/month',
      description: 'For organizations',
      features: [
        'Everything in Pro',
        'Admin dashboard',
        'SSO integration',
        'Custom branding',
        'Dedicated support'
      ],
      cta: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="h-full flex items-center justify-center px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade as you grow. All plans include our core features.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`
                relative bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:scale-105
                ${plan.popular 
                  ? 'border-purple-500 shadow-purple-200 shadow-2xl' 
                  : 'border-gray-200 hover:border-purple-300'
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="block">
                <Button 
                  className={`
                    w-full py-3 rounded-xl font-semibold transition-all duration-300
                    ${plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }
                  `}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
