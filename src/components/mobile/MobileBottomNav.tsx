
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/decks', icon: BookOpen, label: 'Decks' },
    { path: '/analytics', icon: BarChart3, label: 'Stats' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1",
                "transition-colors duration-200",
                isActive(path) 
                  ? "text-primary" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon 
                className={cn(
                  "w-6 h-6 mb-1",
                  isActive(path) ? "stroke-2" : "stroke-1.5"
                )} 
              />
              <span className={cn(
                "text-xs font-medium",
                isActive(path) ? "text-primary" : "text-gray-600"
              )}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow"
          onClick={() => window.location.href = '/create-set'}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </>
  );
};
