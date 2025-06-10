
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Start the transition
      setIsTransitioning(true);
      
      // After fade out, update content
      const timer = setTimeout(() => {
        setDisplayLocation(location);
      }, 150); // Half of the 300ms total animation time

      // Complete the transition
      const completeTimer = setTimeout(() => {
        setIsTransitioning(false);
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
        className={`w-full min-h-screen transition-opacity duration-300 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div key={displayLocation.pathname} className="w-full min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};
