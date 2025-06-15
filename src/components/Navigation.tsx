
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, GraduationCap, Shield, ArrowLeft } from 'lucide-react';
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
  
  // Show back button if user is logged in and not on dashboard
  const showBackButton = user && location.pathname !== '/dashboard';

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to dashboard if no history
      navigate('/dashboard');
    }
  };

  const navigationItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: null },
    { path: '/decks', label: t('nav.decks'), icon: null },
    { path: '/marketplace', label: t('nav.marketplace'), icon: null },
    ...(isAdminUser ? [{ path: '/admin', label: t('nav.admin'), icon: Shield }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('toolbar.back')}</span>
                </Button>
              )}
              
              <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">SuperCards</span>
              </Link>
            </div>

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
