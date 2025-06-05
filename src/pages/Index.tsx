
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GlobalStyles } from '@/components/home/GlobalStyles';
import { ParallaxFlashcards } from '@/components/home/ParallaxFlashcards';
import { HeroSection } from '@/components/home/HeroSection';
import { CoreFeatures } from '@/components/home/CoreFeatures';
import { AdvancedFeatures } from '@/components/home/AdvancedFeatures';
import { CardTypes } from '@/components/home/CardTypes';
import { PricingPlans } from '@/components/home/PricingPlans';
import { Testimonials } from '@/components/home/Testimonials';
import { FinalCTA } from '@/components/home/FinalCTA';

const Index = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const flashcardPool = [
    { front: 'What is React?', back: 'A JavaScript library for building user interfaces' },
    { front: 'CSS Flexbox', back: 'A layout method for arranging items in rows or columns' },
    { front: 'HTTP Status 404', back: 'Not Found - The requested resource could not be found' },
    { front: 'JavaScript const', back: 'Declares a block-scoped constant variable' },
    { front: 'Git commit', back: 'Records changes to the repository' },
    { front: 'Machine Learning', back: 'AI technique that enables computers to learn from data' },
    { front: 'Photosynthesis', back: 'Process plants use to convert sunlight into energy' },
    { front: 'DNA', back: 'Deoxyribonucleic acid - carries genetic information' },
    { front: 'Newton\'s First Law', back: 'An object at rest stays at rest unless acted upon by force' },
    { front: 'Mitochondria', back: 'The powerhouse of the cell' },
    { front: 'Supply & Demand', back: 'Economic principle of price determination' },
    { front: 'World War II', back: 'Global conflict from 1939-1945' },
    { front: 'Pythagorean Theorem', back: 'a² + b² = c² for right triangles' },
    { front: 'Spanish: Hola', back: 'English: Hello' },
    { front: 'Quantum Physics', back: 'Study of matter and energy at atomic scale' },
    { front: 'Marketing Mix', back: 'Product, Price, Place, Promotion (4 Ps)' },
    { front: 'Cellular Respiration', back: 'Process cells use to break down glucose for energy' },
    { front: 'French Revolution', back: 'Political revolution in France (1789-1799)' },
    { front: 'Binary Code', back: 'Computer language using only 0s and 1s' },
    { front: 'Ecosystem', back: 'Community of living organisms and their environment' }
  ];

  const selectedCards = flashcardPool.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      <GlobalStyles />

      <header className="bg-white shadow-sm border-b relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
            <div className="space-x-4">
              <Link to="/auth">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <ParallaxFlashcards flashcards={selectedCards} scrollY={scrollY} />

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <HeroSection />
        <CoreFeatures />
        <AdvancedFeatures />
        <CardTypes />
        <PricingPlans />
        <Testimonials />
        <FinalCTA />
      </main>
    </div>
  );
};

export default Index;
