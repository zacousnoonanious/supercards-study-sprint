
import React, { createContext, useContext, useState, useEffect } from 'react';
import { englishTranslations } from './I18nContext-english';
import { spanishTranslations } from './I18nContext-spanish';
import { frenchTranslations } from './I18nContext-french';

// Available translations
const availableTranslations = {
  en: englishTranslations,
  es: spanishTranslations,
  fr: frenchTranslations,
  // Add more languages as you create their files
};

interface I18nContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const resolveKey = (translations: any, keys: string[]): string | undefined => {
    let result: any = translations;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return undefined;
      }
    }
    return typeof result === 'string' ? result : undefined;
  };

  // Helper function to get nested translation value
  const getTranslation = (key: string, replacements?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    const currentTranslations = availableTranslations[language as keyof typeof availableTranslations] || availableTranslations.en;
    
    let value = resolveKey(currentTranslations, keys);
    
    // Fallback to English if not found in current language
    if (value === undefined && language !== 'en') {
      value = resolveKey(availableTranslations.en, keys);
    }

    let finalValue = value !== undefined ? value : key;

    if (replacements && typeof finalValue === 'string') {
      Object.entries(replacements).forEach(([placeholder, replacementValue]) => {
        finalValue = finalValue.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(replacementValue));
      });
    }
    
    return finalValue;
  };

  const t = (key: string, replacements?: { [key: string]: string | number }): string => {
    return getTranslation(key, replacements);
  };

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage in availableTranslations) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
