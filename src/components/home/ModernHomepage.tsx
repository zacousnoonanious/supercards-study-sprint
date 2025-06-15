
import React, { useState, useEffect, useRef } from 'react';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { ShowcaseSection } from './sections/ShowcaseSection';
import { PricingSection } from './sections/PricingSection';
import { ModernNavigation } from './ModernNavigation';
import { SectionIndicator } from './SectionIndicator';

const sections = ['hero', 'features', 'showcase', 'pricing'] as const;
type Section = typeof sections[number];

export const ModernHomepage = () => {
  const [currentSection, setCurrentSection] = useState<Section>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number>(0);

  const navigateToSection = (section: Section) => {
    if (isTransitioning || section === currentSection) return;
    
    setIsTransitioning(true);
    setCurrentSection(section);
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800);
  };

  const handleWheel = (e: WheelEvent) => {
    if (isTransitioning) return;
    
    e.preventDefault();
    const currentIndex = sections.indexOf(currentSection);
    
    if (e.deltaY > 0 && currentIndex < sections.length - 1) {
      // Scroll down
      navigateToSection(sections[currentIndex + 1]);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      // Scroll up
      navigateToSection(sections[currentIndex - 1]);
    }
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isTransitioning) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    const threshold = 50;
    
    if (Math.abs(deltaY) > threshold) {
      const currentIndex = sections.indexOf(currentSection);
      
      if (deltaY > 0 && currentIndex < sections.length - 1) {
        // Swipe up (scroll down)
        navigateToSection(sections[currentIndex + 1]);
      } else if (deltaY < 0 && currentIndex > 0) {
        // Swipe down (scroll up)
        navigateToSection(sections[currentIndex - 1]);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentSection, isTransitioning]);

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'hero':
        return <HeroSection />;
      case 'features':
        return <FeaturesSection />;
      case 'showcase':
        return <ShowcaseSection />;
      case 'pricing':
        return <PricingSection />;
      default:
        return <HeroSection />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100"
    >
      <ModernNavigation 
        currentSection={currentSection}
        onNavigate={navigateToSection}
        isTransitioning={isTransitioning}
      />
      
      <div className={`
        h-full transition-all duration-700 ease-in-out
        ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
      `}>
        {renderCurrentSection()}
      </div>
      
      <SectionIndicator 
        sections={sections}
        currentSection={currentSection}
        onNavigate={navigateToSection}
        isTransitioning={isTransitioning}
      />
    </div>
  );
};
