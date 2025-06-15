
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { UserDropdown } from './UserDropdown';
import { OrganizationSelector } from './OrganizationSelector';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';

interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface MobileMenuProps {
  navigationItems: NavigationItem[];
  onItemClick: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ navigationItems, onItemClick }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 py-4">
        <div className="space-y-2">
          {navigationItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={onItemClick}
              className={`flex items-center gap-3 w-full px-3 py-2 text-left rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {label}
            </Link>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <OrganizationSelector />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Settings</span>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <UserDropdown />
      </div>
    </div>
  );
};
