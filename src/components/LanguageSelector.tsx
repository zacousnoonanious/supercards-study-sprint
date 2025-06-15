
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/contexts/I18nContext';
import { lang } from '@/i18n/translations/en/lang';

export const LanguageSelector = () => {
  const { language, setLanguage } = useI18n();

  return (
    <Select value={language} onValueChange={setLanguage}>
      <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(lang).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
