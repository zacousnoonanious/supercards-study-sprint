
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
      }, 200); // Half of the 400ms total animation time

      // Complete the flip animation
      const completeTimer = setTimeout(() => {
        setIsFlipping(false);
      }, 400);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div className="w-full min-h-screen perspective-1000">
      <div
        className={`w-full min-h-screen transition-all duration-400 ease-in-out transform-style-preserve-3d ${
          isFlipping ? 'rotate-y-180 scale-95' : 'rotate-y-0 scale-100'
        }`}
      >
        <div key={displayLocation.pathname} className="w-full min-h-screen backface-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};
