
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { Home, BookOpen, ShoppingCart, User } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive('/') && 'bg-accent text-accent-foreground'
            )}
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive('/dashboard') && 'bg-accent text-accent-foreground'
            )}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              (isActive('/decks') || location.pathname.includes('/set/') || location.pathname.includes('/deck/')) && 'bg-accent text-accent-foreground'
            )}
            onClick={() => navigate('/decks')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Decks
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive('/marketplace') && 'bg-accent text-accent-foreground'
            )}
            onClick={() => navigate('/marketplace')}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Marketplace
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            className={cn(
              navigationMenuTriggerStyle(),
              isActive('/profile') && 'bg-accent text-accent-foreground'
            )}
            onClick={() => navigate('/profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
