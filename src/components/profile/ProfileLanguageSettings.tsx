
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';

interface ProfileLanguageSettingsProps {
  language: string;
  onLanguageChange: (value: string) => void;
}

export const ProfileLanguageSettings: React.FC<ProfileLanguageSettingsProps> = ({
  language,
  onLanguageChange,
}) => {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <Label htmlFor="language">{t('profile.language')}</Label>
      <Select
        value={language}
        onValueChange={onLanguageChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('lang.en')}</SelectItem>
          <SelectItem value="es">{t('lang.es')}</SelectItem>
          <SelectItem value="fr">{t('lang.fr')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
