
import { useState, useEffect } from 'react';
import { CardTemplate } from '@/types/flashcard';

const DEFAULT_TEMPLATE_KEY = 'defaultCardTemplate';

export const useDefaultTemplate = () => {
  const [defaultTemplate, setDefaultTemplate] = useState<CardTemplate | undefined>();

  useEffect(() => {
    const savedTemplate = localStorage.getItem(DEFAULT_TEMPLATE_KEY);
    if (savedTemplate) {
      try {
        setDefaultTemplate(JSON.parse(savedTemplate));
      } catch (error) {
        console.error('Error loading default template:', error);
      }
    }
  }, []);

  const saveDefaultTemplate = (template: CardTemplate) => {
    localStorage.setItem(DEFAULT_TEMPLATE_KEY, JSON.stringify(template));
    setDefaultTemplate(template);
  };

  const clearDefaultTemplate = () => {
    localStorage.removeItem(DEFAULT_TEMPLATE_KEY);
    setDefaultTemplate(undefined);
  };

  return {
    defaultTemplate,
    saveDefaultTemplate,
    clearDefaultTemplate,
  };
};
