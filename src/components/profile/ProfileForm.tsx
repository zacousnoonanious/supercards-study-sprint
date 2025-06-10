
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { User } from '@supabase/supabase-js';
import { ProfileAvatarSection } from './ProfileAvatarSection';
import { ProfileBasicInfo } from './ProfileBasicInfo';
import { ProfileLanguageSettings } from './ProfileLanguageSettings';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  language: string;
}

interface ProfileFormProps {
  profile: Profile;
  user: User | null;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onProfileChange: (updates: Partial<Profile>) => void;
  onShowAvatarSelector: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  user,
  saving,
  onSubmit,
  onProfileChange,
  onShowAvatarSelector,
}) => {
  const { t } = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.personalInfo')}</CardTitle>
        <CardDescription>
          Update your personal information and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <ProfileAvatarSection
            avatarUrl={profile.avatar_url}
            onChangeAvatar={onShowAvatarSelector}
          />

          <ProfileBasicInfo
            firstName={profile.first_name}
            lastName={profile.last_name}
            user={user}
            onFirstNameChange={(value) => onProfileChange({ first_name: value })}
            onLastNameChange={(value) => onProfileChange({ last_name: value })}
          />

          <ProfileLanguageSettings
            language={profile.language}
            onLanguageChange={(value) => onProfileChange({ language: value })}
          />

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? t('loading') : t('save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
