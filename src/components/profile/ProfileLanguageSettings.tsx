
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
    { code: 'es', label: t('lang.es') || 'Español' },
    { code: 'fr', label: t('lang.fr') || 'Français' },
    { code: 'de', label: t('lang.de') || 'Deutsch' },
    { code: 'it', label: t('lang.it') || 'Italiano' },
    { code: 'zh-CN', label: t('lang.zh-CN') || '简体中文' },
    { code: 'zh-TW', label: t('lang.zh-TW') || '繁體中文' },
    { code: 'hi', label: t('lang.hi') || 'हिन्दी' },
    { code: 'ar', label: t('lang.ar') || 'العربية' },
    { code: 'pt', label: t('lang.pt') || 'Português' },
    { code: 'ru', label: t('lang.ru') || 'Русский' },
    { code: 'ja', label: t('lang.ja') || '日本語' },
    { code: 'bn', label: t('lang.bn') || 'বাংলা' },
    { code: 'pa', label: t('lang.pa') || 'ਪੰਜਾਵੀ' },
    { code: 'jv', label: t('lang.jv') || 'Basa Jawa' },
    { code: 'ko', label: t('lang.ko') || '한국어' },
    { code: 'vi', label: t('lang.vi') || 'Tiếng Việt' },
    { code: 'tr', label: t('lang.tr') || 'Türkçe' },
    { code: 'ur', label: t('lang.ur') || 'اردو' },
    { code: 'ta', label: t('lang.ta') || 'தமிழ்' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="language">{t('profile.language')}</Label>
      <Select
        value={language}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('placeholders.selectLanguage')} />
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
