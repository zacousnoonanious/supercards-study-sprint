
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
      // Start fade out animation
      setTransitionStage('fadeOut');
    }
  }, [location.pathname, displayLocation.pathname]);

  const handleTransitionEnd = () => {
    if (transitionStage === 'fadeOut') {
      // Only update the displayed content after fade out completes
      setDisplayLocation(location);
      setTransitionStage('fadeIn');
    }
  };

  return (
    <div
      className={`transition-opacity duration-300 ease-in-out ${
        transitionStage === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
      onTransitionEnd={handleTransitionEnd}
    >
      <div key={displayLocation.pathname}>
        {children}
      </div>
    </div>
  );
};
