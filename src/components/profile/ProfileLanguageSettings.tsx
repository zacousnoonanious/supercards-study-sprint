
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
    // Core set
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
    { code: 'pa', label: t('lang.pa') || 'ਪੰਜਾਬੀ' },
    { code: 'jv', label: t('lang.jv') || 'Basa Jawa' },
    { code: 'ko', label: t('lang.ko') || '한국어' },
    { code: 'vi', label: t('lang.vi') || 'Tiếng Việt' },
    { code: 'tr', label: t('lang.tr') || 'Türkçe' },
    { code: 'ur', label: t('lang.ur') || 'اردو' },
    { code: 'ta', label: t('lang.ta') || 'தமிழ்' },
    // Previously suggested
    { code: 'mr', label: t('lang.mr') || 'मराठी' },
    { code: 'te', label: t('lang.te') || 'తెలుగు' },
    { code: 'gu', label: t('lang.gu') || 'ગુજરાતી' },
    { code: 'fa', label: t('lang.fa') || 'فارسی' },
    { code: 'id', label: t('lang.id') || 'Bahasa Indonesia' },
    { code: 'th', label: t('lang.th') || 'ไทย' },
    { code: 'pl', label: t('lang.pl') || 'Polski' },
    { code: 'nl', label: t('lang.nl') || 'Nederlands' },
    { code: 'ro', label: t('lang.ro') || 'Română' },
    { code: 'ms', label: t('lang.ms') || 'Bahasa Melayu' },
    { code: 'sw', label: t('lang.sw') || 'Kiswahili' },
    // New additions for 90%+ coverage
    { code: 'tl', label: t('lang.tl') || 'Filipino' },
    { code: 'ha', label: t('lang.ha') || 'Hausa' },
    { code: 'yo', label: t('lang.yo') || 'Yorùbá' },
    { code: 'ig', label: t('lang.ig') || 'Igbo' },
    { code: 'su', label: t('lang.su') || 'Basa Sunda' },
    { code: 'my', label: t('lang.my') || 'မြန်မာ' },
    { code: 'ml', label: t('lang.ml') || 'മലയാളം' },
    { code: 'kn', label: t('lang.kn') || 'ಕನ್ನಡ' },
    { code: 'am', label: t('lang.am') || 'አማርኛ' },
    { code: 'ne', label: t('lang.ne') || 'नेपाली' },
    { code: 'uk', label: t('lang.uk') || 'Українська' },
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
