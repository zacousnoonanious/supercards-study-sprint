
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
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  // Helper function to get nested translation value
  const getTranslation = (key: string): string => {
    const keys = key.split('.');
    const translations = availableTranslations[language as keyof typeof availableTranslations] || availableTranslations.en;
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found in current language
        if (language !== 'en') {
          let englishValue: any = availableTranslations.en;
          for (const englishKey of keys) {
            if (englishValue && typeof englishValue === 'object' && englishKey in englishValue) {
              englishValue = englishValue[englishKey];
            } else {
              return key; // Return key if even English doesn't have it
            }
          }
          return typeof englishValue === 'string' ? englishValue : key;
        }
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const t = (key: string): string => {
    return getTranslation(key);
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
