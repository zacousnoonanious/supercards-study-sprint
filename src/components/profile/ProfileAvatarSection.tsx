
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface ProfileAvatarSectionProps {
  avatarUrl: string | null;
  onChangeAvatar: () => void;
}

export const ProfileAvatarSection: React.FC<ProfileAvatarSectionProps> = ({
  avatarUrl,
  onChangeAvatar,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={avatarUrl || '/placeholder.svg'} alt="Profile" />
        <AvatarFallback className="bg-indigo-100 text-indigo-600">
          <User className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      <Button
        type="button"
        variant="outline"
        onClick={onChangeAvatar}
      >
        {t('profile.changeAvatar')}
      </Button>
    </div>
  );
};
