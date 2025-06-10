
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setDisplayLocation(location);
    }
  }, [location.pathname, displayLocation.pathname]);

  return (
    <div className="w-full min-h-screen">
      <div key={displayLocation.pathname} className="w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};
