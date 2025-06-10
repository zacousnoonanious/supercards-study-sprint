
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRoutePreloader = () => {
  const location = useLocation();

  useEffect(() => {
    // Preload likely next routes based on current location
    const preloadRoutes = () => {
      const currentPath = location.pathname;
      
      // Define likely next routes based on current location
      const routeMap: Record<string, string[]> = {
        '/dashboard': ['/decks', '/create-set', '/marketplace'],
        '/decks': ['/create-set'],
        '/sets/': ['/study/', '/edit-cards/'],
      };

      // Find matching patterns and preload routes
      Object.entries(routeMap).forEach(([pattern, routes]) => {
        if (currentPath.includes(pattern) || currentPath === pattern) {
          routes.forEach(route => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = route;
            document.head.appendChild(link);
          });
        }
      });

      // Preload study mode for current set
      if (currentPath.includes('/sets/') && !currentPath.includes('/study')) {
        const setId = currentPath.split('/sets/')[1]?.split('/')[0];
        if (setId) {
          const studyLink = document.createElement('link');
          studyLink.rel = 'prefetch';
          studyLink.href = `/study/${setId}`;
          document.head.appendChild(studyLink);
        }
      }
    };

    // Small delay to not interfere with current page load
    const timer = setTimeout(preloadRoutes, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);
};
