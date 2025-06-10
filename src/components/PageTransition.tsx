
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Start the flip animation
      setIsFlipping(true);
      
      // After half the animation (when card is perpendicular), update content
      const timer = setTimeout(() => {
        setDisplayLocation(location);
      }, 300); // Half of the 600ms total animation time

      // Complete the flip animation
      const completeTimer = setTimeout(() => {
        setIsFlipping(false);
      }, 600);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div className="min-h-screen perspective-1000">
      <div
        className={`w-full min-h-screen transition-transform duration-300 ease-in-out transform-style-preserve-3d ${
          isFlipping ? 'rotate-y-180' : 'rotate-y-0'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        <div 
          key={displayLocation.pathname}
          className="w-full min-h-screen backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
