
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { LockableToolbar } from './LockableToolbar';
import { PowerPointEditor } from './PowerPointEditor';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, getFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/api/flashcards';
import { getSet } from '@/lib/api/sets';
import { v4 as uuidv4 } from 'uuid';
import { CanvasContextMenu } from './CanvasContextMenu';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { ElementSettingsPopup } from './ElementSettingsPopup';

export const CardEditor = () => {
  const params = useParams<{ cardId?: string; setId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setId = params.setId;
  const cardId = params.cardId;

  const [currentCard, setCurrentCard] = useState<Flashcard>({} as Flashcard);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [showElementPopup, setShowElementPopup] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [cardDimensions, setCardDimensions] = useState({ width: 600, height: 400 });

  const { data: set, refetch: refetchSet } = useQuery({
    queryKey: ['set', setId],
    queryFn: () => getSet(setId!),
    enabled: !!setId,
  });

  const { data: cardData, refetch: refetchCard } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getFlashcard(cardId!),
    enabled: !!cardId,
  });

  // If no cardId in URL, use the first card from the set
  useEffect(() => {
    if (!cardId && set?.flashcards && set.flashcards.length > 0) {
      const firstCard = set.flashcards[0];
      navigate(`/sets/${setId}/cards/${firstCard.id}`, { replace: true });
    }
  }, [cardId, set, setId, navigate]);

  useEffect(() => {
    if (cardData) {
      const convertedCard: Flashcard = {
        ...cardData,
        front_elements: Array.isArray(cardData.front_elements) 
          ? (cardData.front_elements as unknown as CanvasElement[])
          : [],
        back_elements: Array.isArray(cardData.back_elements) 
          ? (cardData.back_elements as unknown as CanvasElement[])
          : [],
        canvas_width: cardData.canvas_width || 600,
        canvas_height: cardData.canvas_height || 400,
        hint: cardData.hint || '',
        last_reviewed_at: cardData.last_reviewed_at || null,
        card_type: (cardData.card_type as Flashcard['card_type']) || 'standard',
        interactive_type: (cardData.interactive_type as Flashcard['interactive_type']) || null,
        countdown_timer: cardData.countdown_timer || 0,
        countdown_seconds: 0,
        countdown_behavior: 'flip',
        password: cardData.password || null,
        elements_json: JSON.stringify(cardData.front_elements || []),
      };
      
      setCurrentCard(convertedCard);
      setCardDimensions({ 
        width: convertedCard.canvas_width || 600, 
        height: convertedCard.canvas_height || 400 
      });
      
      const currentElements = currentSide === 'front' 
        ? convertedCard.front_elements 
        : convertedCard.back_elements;
      setElements(currentElements);
      saveHistory(currentElements);
    }
  }, [cardData, currentSide]);

  // Debounced save function to prevent too many API calls
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((updatedElements: CanvasElement[]) => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (currentCard.id) {
        const updatedCard = {
          ...currentCard,
          [currentSide === 'front' ? 'front_elements' : 'back_elements']: updatedElements,
          canvas_width: cardDimensions.width,
          canvas_height: cardDimensions.height,
        };
        
        const dbUpdates = {
          [currentSide === 'front' ? 'front_elements' : 'back_elements']: updatedElements,
          canvas_width: cardDimensions.width,
          canvas_height: cardDimensions.height,
        };
        
        updateCardMutation({ id: currentCard.id, ...dbUpdates });
        setCurrentCard(updatedCard);
      }
    }, 500); // 500ms debounce
    
    setSaveTimeout(timeout);
  }, [currentCard, currentSide, cardDimensions]);

  const { mutate: updateCardMutation } = useMutation({
    mutationFn: updateFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', cardId] });
      queryClient.invalidateQueries({ queryKey: ['set', setId] });
    },
  });

  const { mutate: createCardMutation } = useMutation({
    mutationFn: createFlashcard,
    onSuccess: (newCard) => {
      queryClient.invalidateQueries({ queryKey: ['set', setId] });
      navigate(`/sets/${setId}/cards/${newCard.id}`);
      refetchSet();
    },
  });

  const { mutate: deleteCardMutation } = useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set', setId] });
      refetchSet();
      if (set?.flashcards && set.flashcards.length > 1) {
        const currentIndex = set.flashcards.findIndex((card) => card.id === currentCard.id);
        const nextCard = set.flashcards[currentIndex + 1] || set.flashcards[currentIndex - 1];
        if (nextCard && nextCard.id !== currentCard.id) {
          navigate(`/sets/${setId}/cards/${nextCard.id}`);
        }
      } else {
        navigate(`/sets/${setId}`);
      }
    },
  });

  const saveHistory = (newElements: CanvasElement[]) => {
    setHistory(prevHistory => {
      const newHistory = [...prevHistory.slice(0, historyIndex + 1), newElements];
      if (newHistory.length > 10) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(historyIndex => Math.min(historyIndex + 1, 9));
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousElements = history[historyIndex - 1];
      setElements(previousElements);
      debouncedSave(previousElements);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextElements = history[historyIndex + 1];
      setElements(nextElements);
      debouncedSave(nextElements);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleAddElement = (type: CanvasElement['type']) => {
    const newElement: CanvasElement = {
      id: uuidv4(),
      type: type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : type === 'image' ? 300 : 250,
      height: type === 'text' ? 60 : type === 'image' ? 200 : 150,
      rotation: 0,
      content: type === 'text' ? 'Double-click to edit' : 
               type === 'multiple-choice' ? 'What is your question?' : 
               type === 'true-false' ? 'What is your question?' : '',
      fontSize: type === 'text' ? 16 : undefined,
      color: type === 'text' ? '#000000' : undefined,
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      imageUrl: '',
      audioUrl: '',
      youtubeUrl: '',
      autoplay: false,
      multipleChoiceOptions: type === 'multiple-choice' ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : undefined,
      correctAnswer: type === 'multiple-choice' ? 0 : type === 'true-false' ? 1 : undefined,
      drawingData: '',
      strokeColor: '#000000',
      strokeWidth: 5,
      fillInBlankText: '',
      fillInBlankBlanks: [],
      showLetterCount: false,
      ignoreCase: true,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElementId(newElement.id);
    saveHistory(newElements);
    debouncedSave(newElements);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updatedElements = elements.map((element) =>
      element.id === id ? { ...element, ...updates } : element
    );
    setElements(updatedElements);
    saveHistory(updatedElements);
    debouncedSave(updatedElements);
  };

  const handleDeleteElement = (id: string) => {
    const newElements = elements.filter((element) => element.id !== id);
    setElements(newElements);
    setSelectedElementId(null);
    setSelectedElement(null);
    setShowElementPopup(false);
    saveHistory(newElements);
    debouncedSave(newElements);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Flashcard>) => {
    const dbUpdates = { ...updates };
    
    // Remove client-only properties
    delete (dbUpdates as any).canvas_width;
    delete (dbUpdates as any).canvas_height;
    delete (dbUpdates as any).countdown_seconds;
    delete (dbUpdates as any).countdown_behavior;
    delete (dbUpdates as any).elements_json;
    
    setCurrentCard({ ...currentCard, ...updates });
    updateCardMutation({ id: cardId, ...dbUpdates });
  };

  const handleNavigateCard = (direction: 'prev' | 'next') => {
    if (!set?.flashcards) return;

    const currentIndex = set.flashcards.findIndex((card) => card.id === currentCard.id);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex < 0) {
      newIndex = 0;
    } else if (newIndex >= set.flashcards.length) {
      newIndex = set.flashcards.length - 1;
    }

    if (set.flashcards[newIndex] && set.flashcards[newIndex].id !== currentCard.id) {
      navigate(`/sets/${setId}/cards/${set.flashcards[newIndex].id}`);
    }
  };

  const handleCreateNewCard = () => {
    if (!setId) return;
    createCardMutation({
      set_id: setId,
      front_elements: [],
      back_elements: [],
      card_type: 'standard',
      question: 'New Card',
      answer: 'Answer',
      countdown_timer: 0,
    });
  };

  const handleCreateNewCardWithLayout = () => {
    if (!setId) return;

    const defaultLayout = [
      { id: uuidv4(), type: 'text' as const, x: 50, y: 50, width: 200, height: 50, content: 'Title', fontSize: 24, rotation: 0 },
      { id: uuidv4(), type: 'text' as const, x: 50, y: 150, width: 300, height: 100, content: 'Description', fontSize: 16, rotation: 0 },
    ];

    createCardMutation({
      set_id: setId,
      front_elements: defaultLayout,
      back_elements: [],
      card_type: 'standard',
      question: 'New Card',
      answer: 'Answer',
      countdown_timer: 0,
    });
  };

  const handleDeleteCard = async () => {
    if (!cardId || !set) return false;

    if (set.flashcards && set.flashcards.length <= 1) {
      return false;
    }

    deleteCardMutation(cardId);
    return true;
  };

  const handleSave = () => {
    if (!currentCard.id) return;
    
    const updatedCard = {
      ...currentCard,
      [currentSide === 'front' ? 'front_elements' : 'back_elements']: elements,
      canvas_width: cardDimensions.width,
      canvas_height: cardDimensions.height,
    };
    
    handleUpdateCard(currentCard.id, updatedCard);
  };

  const handleAutoArrange = (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'scale-to-fit') => {
    let arrangedElements = [...elements];
    const cardWidth = cardDimensions.width;
    const cardHeight = cardDimensions.height;

    if (type === 'scale-to-fit' && selectedElementId) {
      // Scale selected element to fit card dimensions
      arrangedElements = elements.map(element => 
        element.id === selectedElementId 
          ? { ...element, x: 10, y: 10, width: cardWidth - 20, height: cardHeight - 20 }
          : element
      );
    } else {
      switch (type) {
        case 'grid':
          arrangedElements = elements.map((element, index) => ({
            ...element,
            x: (index % 2) * (cardWidth / 2) + 20,
            y: Math.floor(index / 2) * (cardHeight / 2) + 20,
          }));
          break;
        case 'center':
          arrangedElements = elements.map(element => ({
            ...element,
            x: (cardWidth - element.width) / 2,
            y: (cardHeight - element.height) / 2,
          }));
          break;
        case 'justify':
          arrangedElements = elements.map((element, index) => ({
            ...element,
            x: 20,
            width: cardWidth - 40,
            y: index * (cardHeight / elements.length),
          }));
          break;
        case 'stack':
          arrangedElements = elements.map((element, index) => ({
            ...element,
            x: 20,
            y: 20 + index * 10,
          }));
          break;
        case 'align-left':
          arrangedElements = elements.map(element => ({
            ...element,
            x: 20,
          }));
          break;
        case 'align-center':
          arrangedElements = elements.map(element => ({
            ...element,
            x: (cardWidth - element.width) / 2,
          }));
          break;
        case 'align-right':
          arrangedElements = elements.map(element => ({
            ...element,
            x: cardWidth - element.width - 20,
          }));
          break;
        default:
          break;
      }
    }

    setElements(arrangedElements);
    saveHistory(arrangedElements);
    debouncedSave(arrangedElements);
  };

  const handleElementSelect = (elementId: string | null) => {
    const element = elementId ? elements.find(e => e.id === elementId) : null;
    setSelectedElement(element || null);
    setSelectedElementId(elementId);
    setShowElementPopup(!!element);
  };

  const getElementPopupPosition = (element: CanvasElement) => {
    const elementRight = element.x + element.width;
    const elementTop = element.y;
    const popupWidth = 256;
    
    if (elementRight + popupWidth + 20 <= cardDimensions.width) {
      return { x: elementRight + 10, y: elementTop };
    } else {
      return { x: Math.max(10, element.x - popupWidth - 10), y: elementTop };
    }
  };

  const handleCardDimensionsChange = (width: number, height: number) => {
    setCardDimensions({ width, height });
    const updatedCard = { ...currentCard, canvas_width: width, canvas_height: height };
    setCurrentCard(updatedCard);
    debouncedSave(elements);
  };

  // Show loading or redirect if no card is available
  if (!currentCard.id && set?.flashcards && set.flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No cards in this set</h2>
          <Button onClick={handleCreateNewCard}>Create your first card</Button>
        </div>
      </div>
    );
  }

  if (!currentCard.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <LockableToolbar
        set={set}
        currentCard={currentCard}
        currentCardIndex={set?.flashcards?.findIndex((card) => card.id === currentCard.id) || 0}
        totalCards={set?.flashcards?.length || 0}
        currentSide={currentSide}
        onAddElement={handleAddElement}
        onUpdateCard={handleUpdateCard}
        onNavigateCard={handleNavigateCard}
        onSideChange={setCurrentSide}
        onCreateNewCard={handleCreateNewCard}
        onCreateNewCardWithLayout={handleCreateNewCardWithLayout}
        onDeleteCard={handleDeleteCard}
        onSave={handleSave}
        onAutoArrange={handleAutoArrange}
        isBackSideDisabled={currentCard.card_type === 'single-sided'}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        cardDimensions={cardDimensions}
        onCardDimensionsChange={handleCardDimensionsChange}
      />
      
      <div className="pt-14">
        <CanvasContextMenu
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onChangeBackground={() => {}}
          onToggleGrid={() => setShowGrid(!showGrid)}
          onSettings={() => {}}
        >
          <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8" style={{ paddingBottom: '120px' }}>
            <PowerPointEditor
              elements={elements}
              onUpdateElement={handleUpdateElement}
              onAddElement={handleAddElement}
              onDeleteElement={handleDeleteElement}
              cardWidth={cardDimensions.width}
              cardHeight={cardDimensions.height}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
              showGrid={showGrid}
            />
          </div>
        </CanvasContextMenu>
      </div>

      {/* Element Settings Popup */}
      {showElementPopup && selectedElement && (
        <ElementSettingsPopup
          element={selectedElement}
          onUpdateElement={(id, updates) => handleUpdateElement(id, updates)}
          onDeleteElement={handleDeleteElement}
          onClose={() => setShowElementPopup(false)}
          position={getElementPopupPosition(selectedElement)}
        />
      )}

      <SimpleEditorFooter
        currentCard={currentCard}
        selectedElement={selectedElement}
        onUpdateCard={handleUpdateCard}
        cardWidth={cardDimensions.width}
      />
    </div>
  );
};
