
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
      
      // Update content immediately for the incoming layer
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        
        // Complete the transition after the new content is rendered
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 200); // Delay content update slightly for smooth crossfade

      return () => {
        clearTimeout(timer);
      };
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div className="w-full min-h-screen relative">
      {/* Current/Outgoing content */}
      <div
        className={`w-full min-h-screen transition-opacity duration-200 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div key={displayLocation.pathname} className="w-full min-h-screen">
          {children}
        </div>
      </div>
      
      {/* Incoming content overlay during transition */}
      {isTransitioning && (
        <div
          className="absolute inset-0 w-full min-h-screen transition-opacity duration-200 ease-in-out opacity-0 animate-fade-in"
          style={{ animationDelay: '100ms' }}
        >
          <div key={location.pathname} className="w-full min-h-screen">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};
