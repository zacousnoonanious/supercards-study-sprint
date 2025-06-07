import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { LockableToolbar } from './LockableToolbar';
import { PowerPointEditor } from './PowerPointEditor';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, getFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/api/flashcards';
import { getSet } from '@/lib/api/sets';
import { v4 as uuidv4 } from 'uuid';
import { CanvasContextMenu } from './CanvasContextMenu';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { ElementSettingsPopup } from './ElementSettingsPopup';

export const CardEditor = () => {
  const { cardId, setId } = useParams<{ cardId: string; setId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentCard, setCurrentCard] = useState<Flashcard>({} as Flashcard);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  const [showElementPopup, setShowElementPopup] = useState(false);

  const { data: set } = useQuery({
    queryKey: ['set', setId],
    queryFn: () => getSet(setId!),
    enabled: !!setId,
  });

  const { data: cardData, refetch: refetchCard } = useQuery({
    queryKey: ['card', cardId],
    queryFn: () => getFlashcard(cardId!),
    enabled: !!cardId,
  });

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
        canvas_width: 600,
        canvas_height: 400,
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
      
      const currentElements = currentSide === 'front' 
        ? convertedCard.front_elements 
        : convertedCard.back_elements;
      setElements(currentElements);
      saveHistory(currentElements);
    }
  }, [cardData, currentSide]);

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
    },
  });

  const { mutate: deleteCardMutation } = useMutation({
    mutationFn: deleteFlashcard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['set', setId] });
      navigate(`/sets/${setId}`);
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
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
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
               type === 'multiple-choice' ? 'What is your question?' : '',
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
      correctAnswer: type === 'multiple-choice' ? 0 : undefined,
      drawingData: '',
      strokeColor: '#000000',
      strokeWidth: 5,
    };

    const newElements = [...elements, newElement];
    setElements(newElements);
    setSelectedElementId(newElement.id);
    saveHistory(newElements);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updatedElements = elements.map((element) =>
      element.id === id ? { ...element, ...updates } : element
    );
    setElements(updatedElements);
    saveHistory(updatedElements);
  };

  const handleDeleteElement = (id: string) => {
    const newElements = elements.filter((element) => element.id !== id);
    setElements(newElements);
    setSelectedElementId(null);
    setSelectedElement(null);
    setShowElementPopup(false);
    saveHistory(newElements);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Flashcard>) => {
    const dbUpdates = {
      ...updates,
    };
    
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
      { id: uuidv4(), type: 'text', x: 50, y: 50, width: 200, height: 50, content: 'Title', fontSize: 24 },
      { id: uuidv4(), type: 'text', x: 50, y: 150, width: 300, height: 100, content: 'Description', fontSize: 16 },
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
    const updatedCard = {
      ...currentCard,
      [currentSide === 'front' ? 'front_elements' : 'back_elements']: elements
    };
    
    handleUpdateCard(currentCard.id, updatedCard);
    alert('Card saved!');
  };

  const handleAutoArrange = (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right') => {
    let arrangedElements = [...elements];
    const cardWidth = currentCard.canvas_width || 600;
    const cardHeight = currentCard.canvas_height || 400;

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

    setElements(arrangedElements);
    saveHistory(arrangedElements);
  };

  const handleElementDragStart = (e: React.MouseEvent, elementId: string) => {
  };

  const handleElementSelect = (elementId: string | null) => {
    const element = elementId ? elements.find(e => e.id === elementId) : null;
    setSelectedElement(element || null);
    setSelectedElementId(elementId);
    setShowElementPopup(!!element);
  };

  const getElementPopupPosition = (element: CanvasElement) => {
    // Position popup to the right of the element, or left if not enough space
    const elementRight = element.x + element.width;
    const elementTop = element.y;
    const popupWidth = 256; // w-64
    const canvasWidth = currentCard.canvas_width || 600;
    
    if (elementRight + popupWidth + 20 <= canvasWidth) {
      return { x: elementRight + 10, y: elementTop };
    } else {
      return { x: Math.max(10, element.x - popupWidth - 10), y: elementTop };
    }
  };

  const handleChangeCardSize = (size: 'small' | 'medium' | 'large' | 'custom') => {
    const dimensions = {
      small: { width: 400, height: 300 },
      medium: { width: 600, height: 400 },
      large: { width: 800, height: 600 },
      custom: { width: 600, height: 400 }
    };
    
    const newDimensions = dimensions[size];
    setCurrentCard({
      ...currentCard,
      canvas_width: newDimensions.width,
      canvas_height: newDimensions.height
    });
  };

  const handleScaleToElements = () => {
    if (elements.length === 0) return;
    
    const bounds = elements.reduce((acc, element) => {
      const right = element.x + element.width;
      const bottom = element.y + element.height;
      return {
        minX: Math.min(acc.minX, element.x),
        minY: Math.min(acc.minY, element.y),
        maxX: Math.max(acc.maxX, right),
        maxY: Math.max(acc.maxY, bottom)
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    
    const padding = 50;
    const newWidth = Math.max(400, bounds.maxX - bounds.minX + padding * 2);
    const newHeight = Math.max(300, bounds.maxY - bounds.minY + padding * 2);
    
    setCurrentCard({
      ...currentCard,
      canvas_width: newWidth,
      canvas_height: newHeight
    });
  };

  const handleCanvasResize = (width: number, height: number) => {
    setCurrentCard({
      ...currentCard,
      canvas_width: width,
      canvas_height: height
    });
  };

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
        cardWidth={currentCard.canvas_width || 600}
      />
      
      <div className="pt-14">
        <CanvasContextMenu
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onChangeBackground={() => {}}
          onToggleGrid={() => {}}
          onSettings={() => {}}
        >
          <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8" style={{ paddingBottom: '120px' }}>
            <PowerPointEditor
              elements={elements}
              onUpdateElement={handleUpdateElement}
              onAddElement={handleAddElement}
              onDeleteElement={handleDeleteElement}
              cardWidth={currentCard.canvas_width || 600}
              cardHeight={currentCard.canvas_height || 400}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
            />
          </div>
        </CanvasContextMenu>
      </div>

      {/* Element Settings Popup */}
      {showElementPopup && selectedElement && (
        <ElementSettingsPopup
          element={selectedElement}
          onUpdate={(updates) => handleUpdateElement(selectedElement.id, updates)}
          onClose={() => setShowElementPopup(false)}
          position={getElementPopupPosition(selectedElement)}
        />
      )}

      <SimpleEditorFooter
        currentCard={currentCard}
        selectedElement={selectedElement}
        onUpdateCard={handleUpdateCard}
        cardWidth={currentCard.canvas_width || 600}
      />
    </div>
  );
};
