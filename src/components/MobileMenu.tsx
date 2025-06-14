
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { useOrganization } from '@/contexts/OrganizationContext';

interface MobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, signOut } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const { currentOrganization } = useOrganization();

  if (!mobileMenuOpen) return null;

  return (
    <div className="md:hidden" id="mobile-menu">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t border-border">
        {user ? (
          <>
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.dashboard')}
            </Link>
            <Link
              to="/decks"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                location.pathname === '/decks'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('nav.decks')}
            </Link>
            
            {currentOrganization && (
              <Link
                to="/assignments"
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location.pathname === '/assignments'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Assignments
              </Link>
            )}

            <button
              onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
              location.pathname === '/auth'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.login')}
          </Link>
        )}
      </div>
    </div>
  );
};
