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

    console.log('KeyboardShortcuts: Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Meta:', e.metaKey, 'Target:', e.target);

    // Delete key - delete selected element
    if (e.key === 'Delete' && selectedElementId) {
      e.preventDefault();
      console.log('KeyboardShortcuts: Deleting element:', selectedElementId);
      handleDeleteElement(selectedElementId);
      return;
    }

    // Escape key - deselect element
    if (e.key === 'Escape') {
      e.preventDefault();
      console.log('KeyboardShortcuts: Escape pressed');
      return;
    }

    // Card navigation with modifier keys to avoid conflicts
    const isModifierPressed = e.ctrlKey || e.metaKey;

    // Navigation keys - Left/Right for cards
    if (e.key === 'ArrowLeft' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      if (currentCardIndex > 0) {
        console.log('KeyboardShortcuts: Navigate to previous card from index:', currentCardIndex);
        navigateCard('prev');
      } else {
        console.log('KeyboardShortcuts: Already at first card');
      }
      return;
    }

    if (e.key === 'ArrowRight' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      if (currentCardIndex < cards.length - 1) {
        console.log('KeyboardShortcuts: Navigate to next card from index:', currentCardIndex, 'total cards:', cards.length);
        navigateCard('next');
      } else {
        console.log('KeyboardShortcuts: Already at last card');
      }
      return;
    }

    // Card side navigation - Up/Down for front/back (Fixed the logic)
    if (e.key === 'ArrowUp' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      console.log('KeyboardShortcuts: Switch to front side');
      setCurrentSide('front');
      return;
    }

    if (e.key === 'ArrowDown' && isModifierPressed) {
      e.preventDefault();
      e.stopPropagation();
      console.log('KeyboardShortcuts: Switch to back side');
      setCurrentSide('back');
      return;
    }

    // Other shortcuts with Ctrl/Cmd
    if (e.key === 'a' && isModifierPressed) {
      e.preventDefault();
      console.log('KeyboardShortcuts: Adding text element');
      addElement('text');
      return;
    }

    if (e.key === 'g' && isModifierPressed) {
      e.preventDefault();
      console.log('KeyboardShortcuts: Auto arrange grid');
      handleAutoArrange('grid');
      return;
    }

    if (e.key === 'o' && isModifierPressed) {
      e.preventDefault();
      console.log('KeyboardShortcuts: Toggle card overview');
      setShowCardOverview(!showCardOverview);
      return;
    }
  }, [selectedElementId, currentCardIndex, cards.length, handleDeleteElement, navigateCard, setCurrentSide, isTextSelecting, addElement, handleAutoArrange, showCardOverview, setShowCardOverview]);

  // Add keyboard event listener
  useEffect(() => {
    console.log('KeyboardShortcuts: Adding event listener for card navigation. Current card index:', currentCardIndex, 'Total cards:', cards.length);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      console.log('KeyboardShortcuts: Removing event listener');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
