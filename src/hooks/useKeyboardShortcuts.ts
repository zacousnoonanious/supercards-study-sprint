import { useEffect, useCallback } from 'react';

interface UseKeyboardShortcutsProps {
  addElement: (type: string) => void;
  isTextSelecting: boolean;
  selectedElementId: string | null;
  handleDeleteElement: (elementId: string) => void;
  currentCardIndex: number;
  cards: any[];
  navigateCard: (direction: 'prev' | 'next') => void;
  setCurrentSide: (side: 'front' | 'back') => void;
  handleAutoArrange: (type: string) => void;
  showCardOverview: boolean;
  setShowCardOverview: (show: boolean) => void;
}

export const useKeyboardShortcuts = ({
  addElement,
  isTextSelecting,
  selectedElementId,
  handleDeleteElement,
  currentCardIndex,
  cards,
  navigateCard,
  setCurrentSide,
  handleAutoArrange,
  showCardOverview,
  setShowCardOverview,
}: UseKeyboardShortcutsProps) => {
  // Handle keyboard events for delete functionality and navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't handle keyboard shortcuts during text selection or if user is typing in input fields
    if (isTextSelecting || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    console.log('KeyboardShortcuts: Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey);

    // Delete key - delete selected element
    if (e.key === 'Delete' && selectedElementId) {
      e.preventDefault();
      handleDeleteElement(selectedElementId);
      return;
    }

    // Escape key - deselect element
    if (e.key === 'Escape') {
      e.preventDefault();
      return;
    }

    // Card navigation with modifier keys to avoid conflicts
    const isModifierPressed = e.ctrlKey || e.metaKey;

    // Navigation keys - Left/Right for cards
    if (e.key === 'ArrowLeft' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      if (currentCardIndex > 0) {
        console.log('KeyboardShortcuts: Navigate to previous card');
        navigateCard('prev');
      }
      return;
    }

    if (e.key === 'ArrowRight' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      if (currentCardIndex < cards.length - 1) {
        console.log('KeyboardShortcuts: Navigate to next card');
        navigateCard('next');
      }
      return;
    }

    // Card side navigation - Up/Down for front/back
    if (e.key === 'ArrowUp' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      console.log('KeyboardShortcuts: Switch to back side');
      setCurrentSide('back');
      return;
    }

    if (e.key === 'ArrowDown' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      console.log('KeyboardShortcuts: Switch to front side');
      setCurrentSide('front');
      return;
    }

    // Other shortcuts with Ctrl/Cmd
    if (e.key === 'a' && e.ctrlKey) {
      e.preventDefault();
      addElement('text');
      return;
    }

    if (e.key === 'g' && e.ctrlKey) {
      e.preventDefault();
      handleAutoArrange('grid');
      return;
    }

    if (e.key === 'o' && e.ctrlKey) {
      e.preventDefault();
      setShowCardOverview(!showCardOverview);
      return;
    }
  }, [selectedElementId, currentCardIndex, cards.length, handleDeleteElement, navigateCard, setCurrentSide, isTextSelecting, addElement, handleAutoArrange, showCardOverview, setShowCardOverview]);

  // Add keyboard event listener
  useEffect(() => {
    console.log('KeyboardShortcuts: Adding event listener');
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('KeyboardShortcuts: Removing event listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
