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
    // Don't handle keyboard shortcuts during text selection
    if (isTextSelecting) return;

    // Delete key - delete selected element
    if (e.key === 'Delete' && selectedElementId) {
      e.preventDefault();
      handleDeleteElement(selectedElementId);
      return;
    }

    // Escape key - deselect element
    if (e.key === 'Escape') {
      e.preventDefault();
      //setSelectedElementId(null);
      return;
    }

    // Navigation keys
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (currentCardIndex > 0) {
        navigateCard('prev');
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (currentCardIndex < cards.length - 1) {
        navigateCard('next');
      }
      return;
    }

    // Card side navigation - Up for back, Down for front
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      //if (currentCard?.card_type !== 'single-sided') {
        setCurrentSide('back');
      //}
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentSide('front');
      return;
    }

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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
