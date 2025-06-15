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
  currentSide: 'front' | 'back';
  updateCard: (cardId: string, updates: Partial<Flashcard>) => Promise<void>;
  updateCanvasSize: (width: number, height: number) => Promise<void>;
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
  currentSide,
  updateCard,
  updateCanvasSize,
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

  const handleAutoArrange = (type: 'grid' | 'center' | 'stack' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-right' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit' | 'align-elements-center' | 'justify' | 'align-left' | 'align-center' | 'align-right') => {
    const elements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
    if (!elements || elements.length === 0) return;

    const updatedElements = [...elements];
    const cardWidth = currentCard.canvas_width || 600;
    const cardHeight = currentCard.canvas_height || 450;
    
    switch (type) {
      case 'grid':
        const cols = Math.ceil(Math.sqrt(elements.length));
        const spacingGrid = 120;
        elements.forEach((element, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          updatedElements[index] = {
            ...element,
            x: 50 + col * spacingGrid,
            y: 50 + row * spacingGrid
          };
        });
        break;
        
      case 'center':
        elements.forEach((element, index) => {
          updatedElements[index] = {
            ...element,
            x: (cardWidth - element.width) / 2,
            y: (cardHeight - element.height) / 2
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
        let currentYStack = 50;
        const sortedStack = [...elements].sort((a,b) => a.y - b.y);
        sortedStack.forEach(element => {
          const index = updatedElements.findIndex(el => el.id === element.id);
          if (index !== -1) {
            updatedElements[index] = { ...updatedElements[index], x: 50, y: currentYStack };
            currentYStack += element.height + 20;
          }
        });
        break;

      case 'align-elements-left':
        updatedElements.forEach((element, index) => {
          updatedElements[index] = { ...element, x: 10 };
        });
        break;
      
      case 'align-elements-right':
        updatedElements.forEach((element, index) => {
          updatedElements[index] = { ...element, x: cardWidth - element.width - 10 };
        });
        break;

      case 'distribute-horizontal':
        if (elements.length > 1) {
          const sortedElements = [...elements].sort((a, b) => a.x - b.x);
          const totalWidth = sortedElements.reduce((sum, el) => sum + el.width, 0);
          if (cardWidth >= totalWidth) {
            const totalSpacing = cardWidth - totalWidth;
            const spacing = totalSpacing / (elements.length + 1);
            let currentX = spacing;
            sortedElements.forEach(element => {
              const index = updatedElements.findIndex(el => el.id === element.id);
              if (index !== -1) {
                updatedElements[index] = { ...updatedElements[index], x: currentX };
                currentX += element.width + spacing;
              }
            });
          }
        }
        break;

      case 'distribute-vertical':
        if (elements.length > 1) {
          const sortedElements = [...elements].sort((a, b) => a.y - b.y);
          const totalHeight = sortedElements.reduce((sum, el) => sum + el.height, 0);
          if (cardHeight >= totalHeight) {
            const totalSpacing = cardHeight - totalHeight;
            const spacing = totalSpacing / (elements.length + 1);
            let currentY = spacing;
            sortedElements.forEach(element => {
              const index = updatedElements.findIndex(el => el.id === element.id);
              if (index !== -1) {
                updatedElements[index] = { ...updatedElements[index], y: currentY };
                currentY += element.height + spacing;
              }
            });
          }
        }
        break;
        
      case 'scale-to-fit':
        updatedElements.forEach((element, index) => {
          updatedElements[index] = { ...element, x: 10, width: cardWidth - 20 };
        });
        break;
      
      case 'justify':
      case 'align-left':
      case 'align-center':
      case 'align-right':
        // These are deprecated but kept for type compatibility
        break;
    }

    updatedElements.forEach(element => {
      updateElement(element.id, element);
    });
  };

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    console.log('Canvas size change handler called:', width, height);
    updateCanvasSize(width, height);
  }, [updateCanvasSize]);

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
