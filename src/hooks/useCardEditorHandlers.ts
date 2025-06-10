
import { useCallback } from 'react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { updateFlashcardSet } from '@/lib/api/sets';
import { useToast } from '@/hooks/use-toast';

interface UseCardEditorHandlersProps {
  updateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (elementId: string) => void;
  setSelectedElementId: (id: string | null) => void;
  setCurrentCardIndex: (index: number) => void;
  cards: Flashcard[];
  currentCard: Flashcard;
  navigateCard: (direction: 'prev' | 'next') => void;
  setCurrentSide: (side: 'front' | 'back') => void;
  updateCard: (cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  isTextSelecting: boolean;
  set: any;
  setDeckName: (name: string) => void;
}

export const useCardEditorHandlers = ({
  updateElement,
  deleteElement,
  setSelectedElementId,
  setCurrentCardIndex,
  cards,
  currentCard,
  navigateCard,
  setCurrentSide,
  updateCard,
  isTextSelecting,
  set,
  setDeckName,
}: UseCardEditorHandlersProps) => {
  const { toast } = useToast();

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    updateElement(elementId, updates);
  }, [updateElement]);

  const handleDeleteElement = useCallback((elementId: string) => {
    deleteElement(elementId);
    setSelectedElementId(null);
  }, [deleteElement, setSelectedElementId]);

  const handleElementSelect = useCallback((elementId: string | null) => {
    if (isTextSelecting) return;
    setSelectedElementId(elementId);
  }, [setSelectedElementId, isTextSelecting]);

  const handleNavigateToCard = useCallback((cardIndex: number) => {
    setCurrentCardIndex(cardIndex);
    setSelectedElementId(null);
  }, [setCurrentCardIndex, setSelectedElementId]);

  const handleUpdateDeckTitle = async (newTitle: string) => {
    if (!set) return;
    
    try {
      await updateFlashcardSet(set.id, { title: newTitle });
      setDeckName(newTitle);
      toast({
        title: "Success",
        description: "Deck title updated successfully"
      });
    } catch (error) {
      console.error('Error updating deck title:', error);
      toast({
        title: "Error", 
        description: "Failed to update deck title",
        variant: "destructive"
      });
      throw error;
    }
  };

  const handleAutoArrange = (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => {
    const currentSide = 'front'; // This should come from props
    const elements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
    if (elements.length === 0) return;

    const updatedElements = [...elements];
    const cardWidth = currentCard.canvas_width || 600;
    const cardHeight = currentCard.canvas_height || 450;
    
    switch (type) {
      case 'grid':
        const cols = Math.ceil(Math.sqrt(elements.length));
        const spacing = 120;
        elements.forEach((element, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          updatedElements[index] = {
            ...element,
            x: 50 + col * spacing,
            y: 50 + row * spacing
          };
        });
        break;
        
      case 'center':
        elements.forEach((element, index) => {
          updatedElements[index] = {
            ...element,
            x: (cardWidth - element.width) / 2,
            y: element.y
          };
        });
        break;

      case 'center-horizontal':
        elements.forEach((element, index) => {
          updatedElements[index] = {
            ...element,
            x: (cardWidth - element.width) / 2
          };
        });
        break;

      case 'center-vertical':
        elements.forEach((element, index) => {
          updatedElements[index] = {
            ...element,
            y: (cardHeight - element.height) / 2
          };
        });
        break;
        
      case 'stack':
        let currentY = 50;
        elements.forEach((element, index) => {
          updatedElements[index] = {
            ...element,
            x: 50,
            y: currentY
          };
          currentY += element.height + 20;
        });
        break;
        
      case 'align-left':
      case 'align-center':
      case 'align-right':
        const alignment = type.replace('align-', '') as 'left' | 'center' | 'right';
        elements.forEach((element, index) => {
          if (element.type === 'text') {
            updatedElements[index] = {
              ...element,
              textAlign: alignment
            };
          }
        });
        break;
    }

    updatedElements.forEach(element => {
      updateElement(element.id, element);
    });
  };

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    if (currentCard) {
      updateCard(currentCard.id, { 
        canvas_width: width, 
        canvas_height: height 
      });
    }
  }, [currentCard, updateCard]);

  const handleCardUpdate = useCallback((updates: Partial<Flashcard>) => {
    if (currentCard) {
      updateCard(currentCard.id, updates);
    }
  }, [updateCard, currentCard]);

  return {
    handleUpdateElement,
    handleDeleteElement,
    handleElementSelect,
    handleNavigateToCard,
    handleUpdateDeckTitle,
    handleAutoArrange,
    handleCanvasSizeChange,
    handleCardUpdate,
  };
};
