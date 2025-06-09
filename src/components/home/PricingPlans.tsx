
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const PricingPlans = () => {
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

  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 mb-4">
          Start free, upgrade when you need more power
        </p>
        <p className="text-sm text-gray-500">
          No credit card required • Cancel anytime • 14-day free trial on Pro
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, index) => (
          <Card 
            key={index} 
            className={`relative bg-white transition-all duration-300 hover:shadow-xl ${
              plan.isPopular 
                ? 'border-2 border-purple-200 shadow-lg scale-105' 
                : 'border border-gray-200 hover:border-purple-200'
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
              <div className="text-4xl font-bold text-gray-900 mt-2">
                {plan.price}
                {plan.priceSubtext && <span className="text-lg font-normal text-gray-600">{plan.priceSubtext}</span>}
              </div>
              <CardDescription className="text-gray-600">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <Link to="/auth" className="block">
                  <Button 
                    className={`w-full ${
                      plan.isPopular 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : ''
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
      
      <div className="text-center mt-12">
        <p className="text-sm text-gray-500">
          All plans include access to our mobile app and 24/7 customer support.
        </p>
      </div>
    </section>
  );
};
