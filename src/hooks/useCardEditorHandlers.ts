
import { useCallback } from 'react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { updateFlashcardSet } from '@/lib/api/sets';
import { updateFlashcard } from '@/lib/api/flashcards';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
  updateCard: (updates: Partial<Flashcard>) => void;
  updateCanvasSize: (width: number, height: number) => Promise<void>;
  isTextSelecting: boolean;
  set: any;
  setDeckName: (name: string) => void;
  selectedElementId: string | null;
  setId: string;
  cardId: string;
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
  selectedElementId,
  setId,
  cardId,
}: UseCardEditorHandlersProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    console.log('🔧 Updating element:', elementId, updates);
    updateElement(elementId, updates);
  }, [updateElement]);

  const handleDeleteElement = useCallback((elementId: string) => {
    console.log('🔧 Deleting element:', elementId);
    deleteElement(elementId);
    setSelectedElementId(null);
  }, [deleteElement, setSelectedElementId]);

  const handleElementSelect = useCallback((elementId: string | null) => {
    if (isTextSelecting) return;
    console.log('🔧 Selecting element:', elementId);
    setSelectedElementId(elementId);
  }, [setSelectedElementId, isTextSelecting]);

  const handleNavigateToCard = useCallback((cardIndex: number) => {
    console.log('🔧 Navigating to card:', cardIndex);
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

  const handleCardSideChange = useCallback((side: 'front' | 'back') => {
    console.log('🔧 Changing card side to:', side);
    setCurrentSide(side);
    setSelectedElementId(null);
  }, [setCurrentSide, setSelectedElementId]);

  const handleAddElement = useCallback((type: string, x = 50, y = 50) => {
    console.log('🔧 Adding element:', type, 'at', x, y);
    
    const newElement: CanvasElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      x,
      y,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 50 : 100,
      zIndex: 0,
      content: type === 'text' ? 'New text' : '',
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: type === 'text' ? 'transparent' : '#ffffff',
    };

    const elements = currentSide === 'front' ? currentCard.front_elements || [] : currentCard.back_elements || [];
    const updatedElements = [...elements, newElement];

    const updates = currentSide === 'front' 
      ? { front_elements: updatedElements }
      : { back_elements: updatedElements };

    updateCard(updates);
    setSelectedElementId(newElement.id);
  }, [currentCard, currentSide, updateCard, setSelectedElementId]);

  const handleAutoArrange = (type: 'grid' | 'center' | 'stack' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-right' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit' | 'align-elements-center' | 'justify' | 'align-left' | 'align-center' | 'align-right') => {
    const elements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
    if (!elements || elements.length === 0) return;

    console.log('🔧 Auto arranging elements:', type);

    // Handle text alignment for selected element
    if (selectedElementId && (type === 'align-left' || type === 'align-center' || type === 'align-right')) {
      const selectedElement = elements.find(el => el.id === selectedElementId);
      if (selectedElement && selectedElement.type === 'text') {
        const textAlign = type === 'align-left' ? 'left' : type === 'align-center' ? 'center' : 'right';
        updateElement(selectedElementId, { textAlign });
        return;
      }
    }

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
    }

    updatedElements.forEach(element => {
      updateElement(element.id, element);
    });
  };

  const handleCanvasSizeChange = useCallback((width: number, height: number) => {
    console.log('🔧 Canvas size change handler called:', width, height);
    updateCanvasSize(width, height);
  }, [updateCanvasSize]);

  const handleCardUpdate = useCallback((updates: Partial<Flashcard>) => {
    console.log('🔧 Updating card:', updates);
    updateCard(updates);
  }, [updateCard]);

  const handleNavigateCard = useCallback((direction: 'prev' | 'next') => {
    console.log('🔧 Navigating card:', direction);
    navigateCard(direction);
  }, [navigateCard]);

  // Placeholder handlers for missing functionality
  const handleCreateNewCard = useCallback(async () => {
    console.log('🔧 Create new card - not implemented');
    // TODO: Implement card creation
  }, []);

  const handleCreateNewCardWithLayout = useCallback(async () => {
    console.log('🔧 Create new card with layout - not implemented');
    // TODO: Implement card creation with layout
  }, []);

  const handleCreateNewCardFromTemplate = useCallback(async () => {
    console.log('🔧 Create new card from template - not implemented');
    // TODO: Implement card creation from template
  }, []);

  const handleDeleteCard = useCallback(async () => {
    console.log('🔧 Delete card - not implemented');
    // TODO: Implement card deletion
  }, []);

  return {
    handleUpdateElement,
    handleDeleteElement,
    handleElementSelect,
    handleNavigateToCard,
    handleUpdateDeckTitle,
    handleAutoArrange,
    handleCanvasSizeChange,
    handleCardUpdate,
    handleCardSideChange,
    handleAddElement,
    handleNavigateCard,
    handleCreateNewCard,
    handleCreateNewCardWithLayout,
    handleCreateNewCardFromTemplate,
    handleDeleteCard,
  };
};
