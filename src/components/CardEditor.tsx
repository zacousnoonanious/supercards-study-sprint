
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Flashcard, CanvasElement } from '@/types/flashcard';
import { LockableToolbar } from './LockableToolbar';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFlashcard, getFlashcard, updateFlashcard, deleteFlashcard } from '@/lib/api/flashcards';
import { getSet } from '@/lib/api/sets';
import { v4 as uuidv4 } from 'uuid';
import { CanvasContextMenu } from './CanvasContextMenu';
import { EditorFooter } from './EditorFooter';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElementId: string | null;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect: (id: string | null) => void;
  onCreateElement: (element: CanvasElement) => void;
  onDeleteElement: (id: string) => void;
  cardWidth: number;
  cardHeight: number;
  textScale?: number;
  isDragging?: boolean;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
}

const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElementId,
  onElementUpdate,
  onElementSelect,
  cardWidth,
  cardHeight,
  onElementDragStart
}) => {
  const [editingElement, setEditingElement] = useState<string | null>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      <div 
        className="relative bg-white shadow-lg"
        style={{ width: cardWidth, height: cardHeight }}
        onClick={() => onElementSelect(null)}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            className={`absolute cursor-move ${selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation || 0}deg)`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onElementSelect(element.id);
            }}
            onMouseDown={(e) => onElementDragStart?.(e, element.id)}
          >
            <CanvasElementRenderer
              element={element}
              editingElement={editingElement}
              onUpdateElement={onElementUpdate}
              onEditingChange={setEditingElement}
              onElementDragStart={onElementDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardEditor = () => {
  const { cardId, setId } = useParams<{ cardId: string; setId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentCard, setCurrentCard] = useState<Flashcard>({} as Flashcard);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
      setCurrentCard(cardData as Flashcard);
      const parsedElements = JSON.parse(cardData.elements_json || '[]') as CanvasElement[];
      setElements(parsedElements);
      saveHistory(parsedElements);
    }
  }, [cardData]);

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
      width: 200,
      height: 100,
      rotation: 0,
      content: 'New Text',
      fontSize: 16,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'center',
      imageUrl: '',
      audioUrl: '',
      youtubeUrl: '',
      autoplay: false,
      multipleChoiceOptions: ['Option 1', 'Option 2'],
      correctAnswer: 0,
      drawingData: '',
      strokeColor: '#000000',
      strokeWidth: 5,
    };

    setElements([...elements, newElement]);
    saveHistory([...elements, newElement]);
  };

  const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updatedElements = elements.map((element) =>
      element.id === id ? { ...element, ...updates } : element
    );
    setElements(updatedElements);
    saveHistory(updatedElements);
  };

  const handleCreateElement = (element: CanvasElement) => {
    setElements([...elements, element]);
    saveHistory([...elements, element]);
  };

  const handleDeleteElement = (id: string) => {
    const newElements = elements.filter((element) => element.id !== id);
    setElements(newElements);
    setSelectedElementId(null);
    saveHistory(newElements);
  };

  const handleUpdateCard = (cardId: string, updates: Partial<Flashcard>) => {
    setCurrentCard({ ...currentCard, ...updates });
    updateCardMutation({ id: cardId, ...updates });
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

    if (set.flashcards[newIndex]) {
      navigate(`/sets/${setId}/cards/${set.flashcards[newIndex].id}`);
    }
  };

  const handleCreateNewCard = () => {
    if (!setId) return;
    createCardMutation({
      set_id: setId,
      front_elements_json: '[]',
      back_elements_json: '[]',
      card_type: 'standard',
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
      front_elements_json: JSON.stringify(defaultLayout),
      back_elements_json: '[]',
      card_type: 'standard',
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
    const elementsJSON = JSON.stringify(elements);
    handleUpdateCard(currentCard.id, { elements_json: elementsJSON });
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
    setIsDragging(true);
  };

  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);

  const handleElementSelect = (elementId: string | null) => {
    const element = elementId ? elements.find(e => e.id === elementId) : null;
    setSelectedElement(element || null);
    setSelectedElementId(elementId);
  };

  const handleChangeCardSize = (size: 'small' | 'medium' | 'large' | 'custom') => {
    const dimensions = {
      small: { width: 400, height: 300 },
      medium: { width: 600, height: 400 },
      large: { width: 800, height: 600 },
      custom: { width: 600, height: 400 }
    };
    
    const newDimensions = dimensions[size];
    handleUpdateCard(currentCard.id, {
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
    
    handleUpdateCard(currentCard.id, {
      canvas_width: newWidth,
      canvas_height: newHeight
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
      />
      
      <div className="pt-14 pb-12">
        <CanvasContextMenu
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          onChangeBackground={() => {}}
          onToggleGrid={() => {}}
          onSettings={() => {}}
          onChangeCardSize={handleChangeCardSize}
          onScaleToElements={handleScaleToElements}
          onSetDefaultSize={() => {
            localStorage.setItem('defaultCardSize', JSON.stringify({
              width: currentCard.canvas_width || 600,
              height: currentCard.canvas_height || 400
            }));
          }}
        >
          <CardCanvas
            elements={elements}
            selectedElementId={selectedElementId}
            onElementUpdate={handleUpdateElement}
            onElementSelect={handleElementSelect}
            onCreateElement={handleCreateElement}
            onDeleteElement={handleDeleteElement}
            cardWidth={currentCard.canvas_width || 600}
            cardHeight={currentCard.canvas_height || 400}
            isDragging={isDragging}
            onElementDragStart={handleElementDragStart}
          />
        </CanvasContextMenu>
      </div>

      <EditorFooter
        currentCard={currentCard}
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onUpdateCard={handleUpdateCard}
      />
    </div>
  );
};
