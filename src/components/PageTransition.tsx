
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
      
      // After half the animation, update content
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
    <div className="w-full min-h-screen perspective-1000 overflow-hidden">
      <div
        className={`w-full min-h-screen transition-all duration-600 ease-in-out ${
          isFlipping ? 'scale-90 opacity-80' : 'scale-100 opacity-100'
        }`}
        style={{
          transform: isFlipping ? 'rotateY(10deg) rotateX(5deg)' : 'rotateY(0deg) rotateX(0deg)',
        }}
      >
        <div key={displayLocation.pathname} className="w-full min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};
