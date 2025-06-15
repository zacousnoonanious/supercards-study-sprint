import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { englishTranslations } from './I18nContext-english';
import { spanishTranslations } from './I18nContext-spanish';
import { frenchTranslations } from './I18nContext-french';
import { supabase } from '@/integrations/supabase/client';

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
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, any>>({});
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());

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
    
    // 1. Check dynamic (API-fetched) translations for current language
    const dynamicLangTranslations = dynamicTranslations[language as keyof typeof dynamicTranslations] || {};
    let value = resolveKey(dynamicLangTranslations, keys);
    
    // 2. Check static translations for current language
    if (value === undefined) {
      const currentTranslations = availableTranslations[language as keyof typeof availableTranslations] || availableTranslations.en;
      value = resolveKey(currentTranslations, keys);
    }
    
    // 3. Fallback to English and trigger translation
    if (value === undefined && language !== 'en') {
      const englishValue = resolveKey(availableTranslations.en, keys);
      if (typeof englishValue === 'string') {
        value = englishValue; // Use English as fallback for now
        translateAndStore(key, englishValue, language);
      }
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

  const translateAndStore = useCallback(async (key: string, textToTranslate: string, targetLang: string) => {
    const translationKey = `${targetLang}:${key}`;
    if (pendingKeys.has(translationKey)) return;

    try {
      setPendingKeys(prev => new Set(prev).add(translationKey));
      
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { text: textToTranslate, targetLang },
      });

      if (error) throw error;
      
      const { translatedText } = data;

      if (translatedText) {
        setDynamicTranslations(prev => {
          const newTranslations = JSON.parse(JSON.stringify(prev)); // Deep copy
          if (!newTranslations[targetLang]) {
            newTranslations[targetLang] = {};
          }
          const keys = key.split('.');
          let current = newTranslations[targetLang];
          for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
                  current[keys[i]] = {};
              }
              current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = translatedText;
          return newTranslations;
        });
      }
    } catch (error) {
      console.error(`Failed to translate key "${key}" to ${targetLang}:`, error);
    } finally {
      setPendingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(translationKey);
        return newSet;
      });
    }
  }, [pendingKeys]);

  // Load language and dynamic translations from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && savedLanguage in availableTranslations) {
      setLanguage(savedLanguage);
    }
    const savedDynamicTranslations = localStorage.getItem('dynamicTranslations');
    if (savedDynamicTranslations) {
      try {
        setDynamicTranslations(JSON.parse(savedDynamicTranslations));
      } catch (e) {
        console.error("Failed to parse dynamic translations from localStorage", e);
      }
    }
  }, []);

  // Save language and dynamic translations to localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    // Only save if there's something to save, to avoid clearing on initial render
    if (Object.keys(dynamicTranslations).length > 0) {
      localStorage.setItem('dynamicTranslations', JSON.stringify(dynamicTranslations));
    }
  }, [dynamicTranslations]);

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
