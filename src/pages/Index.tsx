
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    { front: 'Caterpillar', back: 'A larval stage of a butterfly or moth, characterized by a segmented body and multiple legs.' },
    { front: 'James Joyce', back: 'An Irish novelist and poet best known for groundbreaking works like Ulysses and Finnegans Wake.' },
    { front: 'Quasar', back: 'An extremely bright and distant active galactic nucleus powered by a supermassive black hole.' },
    { front: 'Photosynthesis', back: 'The process by which green plants and some bacteria convert sunlight into chemical energy.' },
    { front: 'Kafkaesque', back: 'Describing situations that are nightmarishly complex, bizarre, or illogical, inspired by Franz Kafka\'s writings.' },
    { front: 'Mitochondria', back: 'Organelles within eukaryotic cells responsible for producing energy (ATP) through cellular respiration.' },
    { front: 'Marie Curie', back: 'A physicist and chemist who pioneered research on radioactivity; first woman to win a Nobel Prize.' },
    { front: 'Blockchain', back: 'A decentralized digital ledger that records transactions across many computers in a way that prevents alteration.' },
    { front: 'Saffron', back: 'A spice derived from the stigma of the Crocus sativus flower, prized for its color, flavor, and high cost.' },
    { front: 'Hammurabi', back: 'An ancient Babylonian king famous for creating one of the world\'s earliest sets of laws (the Code of Hammurabi).' },
    { front: 'Hologram', back: 'A three-dimensional image formed by the interference of light beams from a laser or other coherent light source.' },
    { front: 'Viking', back: 'Norse seafarers from Scandinavia (8th–11th centuries) known for exploration, trade, and raiding across Europe.' },
    { front: 'Entropy', back: 'A measure of disorder or randomness in a system; in thermodynamics, it indicates energy dispersal.' },
    { front: 'Rosetta Stone', back: 'An ancient Egyptian granodiorite stele inscribed with a decree in three scripts, enabling the decipherment of hieroglyphs.' },
    { front: 'Penicillin', back: 'The first true antibiotic discovered by Alexander Fleming, derived from the mold Penicillium, which kills bacteria.' }
  ];

  const selectedCards = flashcardPool.slice(0, 8);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      <GlobalStyles />

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">SuperCards</h1>
            <div className="flex items-center space-x-4">
              <ThemeToggle limitedThemes={true} showSizeControls={false} />
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
