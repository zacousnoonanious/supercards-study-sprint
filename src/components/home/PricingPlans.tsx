
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const PricingPlans = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "Create up to 3 decks and 50 cards",
        "Basic AI quiz generation (5 questions/day)",
        "Community marketplace access",
        "Basic progress tracking",
        "Mobile app access"
      ],
      buttonText: "Get Started Free",
      variant: "outline" as const,
      isPopular: false
    },
    {
      name: "Pro",
      price: "$12",
      priceSubtext: "/month",
      description: "or $120/year (save 17%)",
      features: [
        "Unlimited decks and cards",
        "Full AI quiz generator (unlimited)",
        "AI deck generator (20 cards/topic)",
        "Advanced analytics & progress summaries",
        "Priority email support",
        "Upload media up to 10 MB per card",
        "Offline study mode",
        "Advanced card templates"
      ],
      buttonText: "Start Pro Trial",
      variant: "default" as const,
      isPopular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For teams and organizations",
      features: [
        "All Pro features included",
        "Organization management dashboard",
        "SSO & bulk user provisioning",
        "Custom branding options",
        "Dedicated customer success",
        "Advanced security & compliance",
        "API access",
        "Custom integrations"
      ],
      buttonText: "Contact Sales",
      variant: "outline" as const,
      isPopular: false
    }
  ];

  const floatingCards = [
    { text: "Free Plan", x: 5, y: 20, delay: 0 },
    { text: "Pro Features", x: 92, y: 30, delay: 2.5 },
    { text: "$12/month", x: 8, y: 75, delay: 1 },
    { text: "Enterprise", x: 88, y: 85, delay: 3.5 },
  ];

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Prismatic crystal background */}
      <div className="absolute inset-0 bg-gradient-to-bl from-yellow-200 via-green-100 to-teal-200">
        {/* Large prismatic formations that shift and change */}
        <div 
          className="absolute -top-40 left-1/6 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400/20 to-green-400/20"
          style={{ 
            transform: `translateY(${scrollY * 0.5}px) rotate(${scrollY * 0.18}deg) scale(${1.2 + Math.sin(scrollY * 0.01) * 0.4})`,
            clipPath: `polygon(${30 + Math.sin(scrollY * 0.015) * 20}% 0%, ${70 + Math.cos(scrollY * 0.02) * 30}% 0%, ${100 + Math.sin(scrollY * 0.012) * 0}% ${50 + Math.cos(scrollY * 0.018) * 30}%, ${70 + Math.sin(scrollY * 0.015) * 30}% 100%, ${30 + Math.cos(scrollY * 0.01) * 20}% 100%, ${0 + Math.sin(scrollY * 0.008) * 10}% ${50 + Math.cos(scrollY * 0.022) * 20}%)`,
            filter: 'blur(100px)'
          }}
        ></div>
        <div 
          className="absolute top-1/4 -right-60 w-[800px] h-[800px] bg-gradient-to-br from-green-400/25 to-teal-400/25"
          style={{ 
            transform: `translateY(${scrollY * -0.6}px) rotate(${scrollY * -0.12}deg) scale(${1.4 + Math.cos(scrollY * 0.008) * 0.3})`,
            clipPath: `polygon(${25 + Math.cos(scrollY * 0.02) * 25}% 0%, ${75 + Math.sin(scrollY * 0.015) * 25}% 0%, ${100 + Math.cos(scrollY * 0.01) * 0}% ${40 + Math.sin(scrollY * 0.018) * 35}%, ${80 + Math.cos(scrollY * 0.012) * 20}% 100%, ${20 + Math.sin(scrollY * 0.015) * 30}% 100%, ${0 + Math.cos(scrollY * 0.008) * 15}% ${60 + Math.sin(scrollY * 0.02) * 25}%)`,
            filter: 'blur(130px)'
          }}
        ></div>
        <div 
          className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-teal-400/30 to-blue-400/30"
          style={{ 
            transform: `translateY(${scrollY * 0.8}px) rotate(${scrollY * 0.25}deg) scale(${0.9 + Math.sin(scrollY * 0.015) * 0.5})`,
            clipPath: `polygon(${40 + Math.sin(scrollY * 0.025) * 30}% 0%, ${60 + Math.cos(scrollY * 0.02) * 40}% 0%, ${100 + Math.sin(scrollY * 0.01) * 0}% ${35 + Math.cos(scrollY * 0.015) * 30}%, ${85 + Math.sin(scrollY * 0.018) * 15}% 100%, ${15 + Math.cos(scrollY * 0.012) * 25}% 100%, ${0 + Math.sin(scrollY * 0.008) * 12}% ${65 + Math.cos(scrollY * 0.02) * 20}%)`,
            filter: 'blur(110px)'
          }}
        ></div>

        {/* Dynamic diamond elements with morphing */}
        <div 
          className="absolute top-32 right-1/5 w-16 h-16 bg-yellow-500/50"
          style={{ 
            transform: `translateY(${scrollY * 1.8}px) rotate(${45 + scrollY * 1.2}deg) scale(${0.7 + Math.sin(scrollY * 0.03) * 0.8})`,
            clipPath: `polygon(50% ${0 + Math.sin(scrollY * 0.02) * 20}%, ${100 + Math.cos(scrollY * 0.015) * 0}% 50%, 50% ${100 + Math.sin(scrollY * 0.018) * 0}%, ${0 + Math.cos(scrollY * 0.012) * 20}% 50%)`
          }}
        ></div>
        <div 
          className="absolute bottom-40 left-1/5 w-20 h-20 bg-green-500/60"
          style={{ 
            transform: `translateY(${scrollY * -1.5}px) rotate(${45 + scrollY * -0.8}deg) scale(${1.1 + Math.cos(scrollY * 0.02) * 0.4})`,
            clipPath: `polygon(50% ${10 + Math.cos(scrollY * 0.025) * 15}%, ${90 + Math.sin(scrollY * 0.02) * 10}% 50%, 50% ${90 + Math.cos(scrollY * 0.015) * 10}%, ${10 + Math.sin(scrollY * 0.018) * 15}% 50%)`
          }}
        ></div>

        {/* Enhanced confetti with complex motion */}
        <div 
          className="absolute top-48 left-2/5 w-20 h-20 opacity-50"
          style={{ 
            transform: `translateY(${scrollY * 2.0}px) rotate(${scrollY * 1.5}deg) translateX(${Math.sin(scrollY * 0.025) * 60}px) scale(${0.6 + Math.cos(scrollY * 0.02) * 0.8})`
          }}
        >
          <img src="/lovable-uploads/fa7f4349-db22-4c04-9c52-c7f01c093a26.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
        <div 
          className="absolute bottom-60 right-2/5 w-16 h-16 opacity-60"
          style={{ 
            transform: `translateY(${scrollY * -1.8}px) rotate(${scrollY * -1.3}deg) translateX(${Math.cos(scrollY * 0.02) * 45}px) scale(${0.8 + Math.sin(scrollY * 0.018) * 0.6})`
          }}
        >
          <img src="/lovable-uploads/e69b608a-21ef-4079-a2bb-d3eb308bf7d7.png" alt="Confetti" className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Floating pricing cards */}
      {floatingCards.map((card, index) => (
        <div
          key={index}
          className="absolute z-30 pointer-events-none"
          style={{
            left: `${card.x}%`,
            top: `${card.y}%`,
            transform: `translateY(${Math.sin((scrollY + card.delay * 140) * 0.015) * 40}px) rotate(${Math.cos((scrollY + card.delay * 70) * 0.012) * 15}deg) scale(${0.6 + Math.sin((scrollY + card.delay * 110) * 0.018) * 0.5})`,
            opacity: 0.25 + Math.sin((scrollY + card.delay * 120) * 0.01) * 0.45
          }}
        >
          <div className="bg-yellow-100/40 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-yellow-200/50 text-sm font-bold text-yellow-800">
            {card.text}
          </div>
        </div>
      ))}

      {/* Yellow mascot character with wave motion */}
      <div 
        className="absolute bottom-12 right-12 z-20"
        style={{ 
          transform: `translateY(${scrollY * 0.3}px) rotate(${Math.sin(scrollY * 0.02) * 7}deg) translateX(${Math.cos(scrollY * 0.015) * 25}px) scale(${1 + Math.sin(scrollY * 0.012) * 0.15})`
        }}
      >
        <img 
          src="/lovable-uploads/eaed28d5-3f56-44a6-a03c-4fd8d513b11a.png" 
          alt="Yellow monster with flashcards" 
          className="w-36 h-36 md:w-44 md:h-44 object-contain animate-float"
        />
      </div>

      <div className="relative z-10 w-full px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-2xl text-gray-700 mb-6">
              Start free, upgrade when you need more power
            </p>
            <p className="text-lg text-gray-600">
              No credit card required • Cancel anytime • 14-day free trial on Pro
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-white/12 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl border-white/30 group ${
                  plan.isPopular 
                    ? 'border-2 border-yellow-300/50 shadow-xl scale-110' 
                    : 'hover:border-yellow-300/50 hover:scale-105'
                }`}
                style={{
                  transform: `translateY(${Math.sin((scrollY + index * 120) * 0.01) * 12}px) ${plan.isPopular ? 'scale(1.1)' : ''}`,
                  borderRadius: `${25 + Math.sin((scrollY + index * 60) * 0.018) * 12}px`
                }}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl text-gray-900 group-hover:text-yellow-700 transition-colors">{plan.name}</CardTitle>
                  <div className="text-5xl font-bold text-gray-900 mt-4">
                    {plan.price}
                    {plan.priceSubtext && <span className="text-xl font-normal text-gray-600">{plan.priceSubtext}</span>}
                  </div>
                  <CardDescription className="text-gray-800 text-lg">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-6 h-6 text-green-500 mr-4 mt-1 flex-shrink-0" />
                        <span className="text-gray-800 text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-8">
                    <Link to="/auth" className="block">
                      <Button 
                        className={`w-full text-lg py-6 rounded-2xl transition-all duration-300 ${
                          plan.isPopular 
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-xl' 
                            : 'hover:scale-105'
                        }`} 
                        variant={plan.variant}
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <p className="text-lg text-gray-700">
              All plans include access to our mobile app and 24/7 customer support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
