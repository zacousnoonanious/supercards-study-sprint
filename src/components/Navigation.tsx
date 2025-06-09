
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { Home, BookOpen, ShoppingBag, Menu, X } from 'lucide-react';
import { UserDropdown } from './UserDropdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/decks', label: 'My Decks', icon: BookOpen },
    { path: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const NavItems = () => (
    <>
      {navigationItems.map(({ path, label, icon: Icon }) => (
        <Button
          key={path}
          variant={isActive(path) ? "default" : "ghost"}
          size="sm"
          onClick={() => handleNavigation(path)}
          className="flex items-center space-x-2 h-8"
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </>
  );

  return (
    <nav className="bg-background border-b border-border h-12 px-4 flex items-center justify-between">
      {/* Left side - Logo and Navigation */}
      <div className="flex items-center space-x-4">
        <h1 
          className="text-xl font-bold text-indigo-600 cursor-pointer" 
          onClick={() => navigate('/dashboard')}
        >
          SuperCards
        </h1>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          <NavItems />
        </div>
      </div>

      {/* Right side - User Dropdown and Mobile Menu */}
      <div className="flex items-center space-x-2">
        {user && <UserDropdown />}
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                </div>
                <div className="flex flex-col space-y-2">
                  <NavItems />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
