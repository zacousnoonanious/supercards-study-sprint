
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, GraduationCap, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { UserDropdown } from './UserDropdown';
import { OrganizationSelector } from './OrganizationSelector';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import { useI18n } from '@/contexts/I18nContext';
import { MobileMenu } from './MobileMenu';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userRole } = useOrganization();
  const { t } = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isAdminUser = userRole && ['org_admin', 'super_admin'].includes(userRole);

  const navigationItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: null },
    { path: '/decks', label: t('nav.decks'), icon: null },
    { path: '/marketplace', label: t('nav.marketplace'), icon: null },
  ];

  // Add admin link for org_admin and super_admin users
  if (isAdminUser) {
    navigationItems.push({ path: '/admin', label: 'Admin', icon: Shield });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">SuperCards</span>
            </Link>

            {user && (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  {navigationItems.map(({ path, label, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                        isActive(path) ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <OrganizationSelector />
                  <LanguageSelector />
                  <ThemeToggle />
                  <UserDropdown />
                </div>

                <div className="md:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px]">
                      <MobileMenu 
                        navigationItems={navigationItems}
                        onItemClick={() => setIsMobileMenuOpen(false)}
                      />
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-4">
                <LanguageSelector />
                <ThemeToggle />
                <Button onClick={() => navigate('/auth')} size="sm">
                  {t('nav.signIn')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
