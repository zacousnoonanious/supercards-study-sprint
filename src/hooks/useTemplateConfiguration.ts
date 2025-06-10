
import { useState, useCallback } from 'react';
import { CardTemplate, Flashcard, CanvasElement } from '@/types/flashcard';
import { getTemplateById } from '@/data/cardTemplates';

export const useTemplateConfiguration = () => {
  const [templateSettings, setTemplateSettings] = useState<{
    allowedElementTypes: string[];
    restrictedToolbar: boolean;
    showBackSide: boolean;
    autoAdvanceOnAnswer: boolean;
  } | null>(null);

  const applyTemplateToCard = useCallback((template: CardTemplate): Partial<Flashcard> => {
    return {
      card_type: template.card_type,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      front_elements: template.front_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      back_elements: template.back_elements.map(el => ({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      })),
      allowedElementTypes: template.allowedElementTypes,
      autoAdvanceOnAnswer: template.autoAdvanceOnAnswer,
      showBackSide: template.showBackSide,
      restrictedToolbar: template.restrictedToolbar,
      templateId: template.id,
      countdown_timer_front: template.countdown_timer_front,
      countdown_timer_back: template.countdown_timer_back,
      countdown_behavior_front: template.countdown_behavior_front,
      countdown_behavior_back: template.countdown_behavior_back,
    };
  }, []);

  const getCardTemplateSettings = useCallback((card: Flashcard) => {
    if (card.templateId) {
      const template = getTemplateById(card.templateId);
      if (template) {
        return {
          allowedElementTypes: template.allowedElementTypes,
          restrictedToolbar: template.restrictedToolbar,
          showBackSide: template.showBackSide,
          autoAdvanceOnAnswer: template.autoAdvanceOnAnswer,
          showGrid: template.showGrid,
          snapToGrid: template.snapToGrid,
          showBorder: template.showBorder,
        };
      }
    }
    
    // Fallback to card properties or defaults
    return {
      allowedElementTypes: card.allowedElementTypes || ['text', 'image', 'audio', 'drawing', 'youtube', 'tts'],
      restrictedToolbar: card.restrictedToolbar || false,
      showBackSide: card.showBackSide !== false,
      autoAdvanceOnAnswer: card.autoAdvanceOnAnswer || false,
      showGrid: false,
      snapToGrid: false,
      showBorder: false,
    };
  }, []);

  const isElementTypeAllowed = useCallback((elementType: string, card: Flashcard): boolean => {
    const settings = getCardTemplateSettings(card);
    return settings.allowedElementTypes.includes(elementType);
  }, [getCardTemplateSettings]);

  return {
    applyTemplateToCard,
    getCardTemplateSettings,
    isElementTypeAllowed,
  };
};
