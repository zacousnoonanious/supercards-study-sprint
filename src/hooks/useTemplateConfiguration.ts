
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

  const fitElementToCanvas = useCallback((element: CanvasElement, canvasWidth: number, canvasHeight: number): CanvasElement => {
    // Ensure element doesn't extend beyond canvas boundaries
    const maxX = Math.max(0, canvasWidth - element.width);
    const maxY = Math.max(0, canvasHeight - element.height);
    
    // Adjust position if it extends beyond canvas
    const adjustedX = Math.min(element.x, maxX);
    const adjustedY = Math.min(element.y, maxY);
    
    // If element is still too wide/tall for canvas, resize it
    let adjustedWidth = element.width;
    let adjustedHeight = element.height;
    
    if (adjustedX + element.width > canvasWidth) {
      adjustedWidth = canvasWidth - adjustedX;
    }
    
    if (adjustedY + element.height > canvasHeight) {
      adjustedHeight = canvasHeight - adjustedY;
    }
    
    // Ensure minimum size
    adjustedWidth = Math.max(adjustedWidth, 50);
    adjustedHeight = Math.max(adjustedHeight, 30);
    
    return {
      ...element,
      x: adjustedX,
      y: adjustedY,
      width: adjustedWidth,
      height: adjustedHeight,
    };
  }, []);

  const applyTemplateToCard = useCallback((template: CardTemplate): Partial<Flashcard> => {
    const canvasWidth = template.canvas_width;
    const canvasHeight = template.canvas_height;
    
    // Fit all front elements to canvas
    const fittedFrontElements = template.front_elements.map(el => 
      fitElementToCanvas({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }, canvasWidth, canvasHeight)
    );
    
    // Fit all back elements to canvas
    const fittedBackElements = template.back_elements.map(el => 
      fitElementToCanvas({
        ...el,
        id: `${el.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }, canvasWidth, canvasHeight)
    );

    return {
      card_type: template.card_type,
      canvas_width: template.canvas_width,
      canvas_height: template.canvas_height,
      front_elements: fittedFrontElements,
      back_elements: fittedBackElements,
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
  }, [fitElementToCanvas]);

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
