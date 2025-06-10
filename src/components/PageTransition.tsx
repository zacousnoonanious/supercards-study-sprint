
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
      }, 150); // Half of the 300ms total animation time

      // Complete the flip animation
      const completeTimer = setTimeout(() => {
        setIsFlipping(false);
      }, 300);

      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div className="w-full min-h-screen">
      <div
        className={`w-full min-h-screen transition-transform duration-300 ease-in-out ${
          isFlipping ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
        }`}
      >
        <div key={displayLocation.pathname} className="w-full min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};
