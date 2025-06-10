
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
      
      // After fade out completes, update the displayed content and fade in
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 200); // Half of the total transition time

      return () => clearTimeout(timer);
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div
      className={`transition-opacity duration-200 ease-in-out ${
        transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div key={displayLocation.pathname}>
        {children}
      </div>
    </div>
  );
};
