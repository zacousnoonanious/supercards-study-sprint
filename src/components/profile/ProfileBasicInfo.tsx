
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useI18n } from '@/contexts/I18nContext';
import { User } from '@supabase/supabase-js';

interface ProfileBasicInfoProps {
  firstName: string | null;
  lastName: string | null;
  user: User | null;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
}

export const ProfileBasicInfo: React.FC<ProfileBasicInfoProps> = ({
  firstName,
  lastName,
  user,
  onFirstNameChange,
  onLastNameChange,
}) => {
  const { t } = useI18n();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t('profile.firstName')}</Label>
          <Input
            id="firstName"
            type="text"
            value={firstName || ''}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder={t('placeholders.enterFirstName')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">{t('profile.lastName')}</Label>
          <Input
            id="lastName"
            type="text"
            value={lastName || ''}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder={t('placeholders.enterLastName')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('profile.email')}</Label>
        <Input
          id="email"
          type="email"
          value={user?.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          {t('profile.emailCannotChange') || 'Email address cannot be changed here.'}
        </p>
      </div>
    </>
  );
};
