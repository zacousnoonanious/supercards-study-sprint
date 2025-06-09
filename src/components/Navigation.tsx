
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
import { Home, BookOpen, ShoppingCart } from 'lucide-react';

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-12">
      <NavigationMenu className="h-full">
        <NavigationMenuList className="h-full">
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "h-10 px-3",
                isActive('/') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigate('/')}
            >
              <Home className="w-4 h-4 mr-1" />
              Home
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "h-10 px-3",
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
                "h-10 px-3",
                (isActive('/decks') || location.pathname.includes('/set/') || location.pathname.includes('/deck/')) && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigate('/decks')}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Decks
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                "h-10 px-3",
                isActive('/marketplace') && 'bg-accent text-accent-foreground'
              )}
              onClick={() => navigate('/marketplace')}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Marketplace
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};
