
import { useEffect, useCallback } from 'react';

interface UseEnhancedKeyboardShortcutsProps {
  onAddElement: (type: string, x?: number, y?: number) => void;
  onDeleteElement: (elementId: string) => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onSaveCard: () => void;
  onAutoArrange: (type: string) => void;
  onShowCardOverview: () => void;
  onCopyElement: () => void;
  onPasteElement: () => void;
  selectedElementId: string | null;
  isTextSelecting: boolean;
  currentCardIndex: number;
  totalCards: number;
  currentSide: 'front' | 'back';
}

export const useEnhancedKeyboardShortcuts = ({
  onAddElement,
  onDeleteElement,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onSaveCard,
  onAutoArrange,
  onShowCardOverview,
  onCopyElement,
  onPasteElement,
  selectedElementId,
  isTextSelecting,
  currentCardIndex,
  totalCards,
  currentSide,
}: UseEnhancedKeyboardShortcutsProps) => {
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle shortcuts when typing in input fields or during text editing
    if (isTextSelecting || 
        e.target instanceof HTMLInputElement || 
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true') {
      return;
    }

    const isModifierPressed = e.ctrlKey || e.metaKey;

    // Element creation shortcuts (add at cursor position)
    if (!isModifierPressed) {
      const cursorX = 300; // Default position if cursor not available
      const cursorY = 200;
      
      switch (e.key.toLowerCase()) {
        case 't':
          e.preventDefault();
          onAddElement('text', cursorX, cursorY);
          return;
        case 'i':
          e.preventDefault();
          onAddElement('image', cursorX, cursorY);
          return;
        case 'a':
          e.preventDefault();
          onAddElement('audio', cursorX, cursorY);
          return;
        case 'y':
          e.preventDefault();
          onAddElement('youtube', cursorX, cursorY);
          return;
        case 'm':
          e.preventDefault();
          onAddElement('multiple-choice', cursorX, cursorY);
          return;
      }
    }

    // Delete selected element
    if (e.key === 'Delete' && selectedElementId) {
      e.preventDefault();
      onDeleteElement(selectedElementId);
      return;
    }

    // Modifier key shortcuts
    if (isModifierPressed) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          e.stopPropagation();
          if (currentCardIndex > 0) {
            onNavigateCard('prev');
          }
          return;
        case 'ArrowRight':
          e.preventDefault();
          e.stopPropagation();
          if (currentCardIndex < totalCards - 1) {
            onNavigateCard('next');
          }
          return;
        case 'ArrowUp':
          e.preventDefault();
          e.stopPropagation();
          onSideChange('front');
          return;
        case 'ArrowDown':
          e.preventDefault();
          e.stopPropagation();
          onSideChange('back');
          return;
        case 's':
          e.preventDefault();
          onSaveCard();
          return;
        case 'n':
          e.preventDefault();
          onCreateNewCard();
          return;
        case 'g':
          e.preventDefault();
          onAutoArrange('grid');
          return;
        case 'o':
          e.preventDefault();
          onShowCardOverview();
          return;
        case 'c':
          if (selectedElementId) {
            e.preventDefault();
            onCopyElement();
          }
          return;
        case 'v':
          e.preventDefault();
          onPasteElement();
          return;
      }
    }
  }, [
    isTextSelecting,
    selectedElementId,
    currentCardIndex,
    totalCards,
    currentSide,
    onAddElement,
    onDeleteElement,
    onNavigateCard,
    onSideChange,
    onCreateNewCard,
    onSaveCard,
    onAutoArrange,
    onShowCardOverview,
    onCopyElement,
    onPasteElement,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
