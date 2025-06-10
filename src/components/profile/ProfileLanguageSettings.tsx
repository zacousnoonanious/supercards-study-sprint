
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
  const { t, setLanguage } = useI18n();

  const handleLanguageChange = (value: string) => {
    // Update both the profile language and the global I18n context
    setLanguage(value);
    onLanguageChange(value);
  };

  const availableLanguages = [
    { code: 'en', label: t('lang.en') || 'English' },
    { code: 'zh-CN', label: t('lang.zh-CN') || '简体中文' },
    { code: 'zh-TW', label: t('lang.zh-TW') || '繁體中文' },
    { code: 'hi', label: t('lang.hi') || 'हिन्दी' },
    { code: 'es', label: t('lang.es') || 'Español' },
    { code: 'fr', label: t('lang.fr') || 'Français' },
    { code: 'ar', label: t('lang.ar') || 'العربية' },
    { code: 'pt', label: t('lang.pt') || 'Português' },
    { code: 'ru', label: t('lang.ru') || 'Русский' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="language">{t('profile.language')}</Label>
      <Select
        value={language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
