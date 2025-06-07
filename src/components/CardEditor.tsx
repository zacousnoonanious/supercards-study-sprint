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
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { ElementSettingsPopup } from './ElementSettingsPopup';

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
  onCanvasResize?: (width: number, height: number) => void;
}

const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElementId,
  onElementUpdate,
  onElementSelect,
  cardWidth,
  cardHeight,
  onElementDragStart,
  onCanvasResize,
  onDeleteElement
}) => {
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number; width: number; height: number };
    elementId: string;
  } | null>(null);
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    resizeStart: { x: number; y: number };
    canvasStart: { width: number; height: number };
  } | null>(null);

  // Delete key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId && !editingElement) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, editingElement, onDeleteElement]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onElementSelect(elementId);
    
    setDragState({
      isDragging: true,
      dragStart: { x: e.clientX, y: e.clientY },
      elementStart: { x: element.x, y: element.y, width: element.width, height: element.height },
      elementId
    });
  }, [elements, onElementSelect]);

  const handleCanvasResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizeState({
      isResizing: true,
      resizeStart: { x: e.clientX, y: e.clientY },
      canvasStart: { width: cardWidth, height: cardHeight }
    });
  }, [cardWidth, cardHeight]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState?.isDragging) {
      const deltaX = e.clientX - dragState.dragStart.x;
      const deltaY = e.clientY - dragState.dragStart.y;
      
      const newX = Math.max(0, Math.min(dragState.elementStart.x + deltaX, cardWidth - dragState.elementStart.width));
      // Prevent dragging over footer by limiting Y position
      const footerHeight = 60;
      const maxY = cardHeight - dragState.elementStart.height - footerHeight;
      const newY = Math.max(0, Math.min(dragState.elementStart.y + deltaY, maxY));
      
      onElementUpdate(dragState.elementId, { x: newX, y: newY });
    }
    
    if (resizeState?.isResizing) {
      const deltaX = e.clientX - resizeState.resizeStart.x;
      const deltaY = e.clientY - resizeState.resizeStart.y;
      
      const newWidth = Math.max(400, resizeState.canvasStart.width + deltaX);
      // Prevent resizing over footer
      const footerHeight = 60;
      const maxHeight = window.innerHeight - 200 - footerHeight;
      const newHeight = Math.max(300, Math.min(resizeState.canvasStart.height + deltaY, maxHeight));
      
      onCanvasResize?.(newWidth, newHeight);
    }
  }, [dragState, resizeState, onElementUpdate, cardWidth, cardHeight, onCanvasResize]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setResizeState(null);
  }, []);

  useEffect(() => {
    if (dragState?.isDragging || resizeState?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, handleMouseMove, handleMouseUp]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8" style={{ paddingBottom: '120px' }}>
      <div 
        className="relative bg-white shadow-lg border-2 border-gray-300"
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
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <CanvasElementRenderer
              element={element}
              editingElement={editingElement}
              onUpdateElement={onElementUpdate}
              onEditingChange={setEditingElement}
              onElementDragStart={onElementDragStart}
            />
            
            {selectedElementId === element.id && (
              <>
                {/* Resize handles for selected element */}
                <div
                  className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = element.width;
                    const startHeight = element.height;
                    
                    const handleResize = (e: MouseEvent) => {
                      const deltaX = e.clientX - startX;
                      const deltaY = e.clientY - startY;
                      
                      const newWidth = Math.max(50, startWidth + deltaX);
                      const newHeight = Math.max(30, startHeight + deltaY);
                      
                      onElementUpdate(element.id, { width: newWidth, height: newHeight });
                    };
                    
                    const handleResizeEnd = () => {
                      document.removeEventListener('mousemove', handleResize);
                      document.removeEventListener('mouseup', handleResizeEnd);
                    };
                    
                    document.addEventListener('mousemove', handleResize);
                    document.addEventListener('mouseup', handleResizeEnd);
                  }}
                />
              </>
            )}
          </div>
        ))}
        
        {/* Canvas resize handle */}
        <div
          className="absolute bottom-0 right-0 w-4 h-4 bg-gray-400 cursor-se-resize opacity-50 hover:opacity-100"
          style={{ margin: '-2px' }}
          onMouseDown={handleCanvasResizeStart}
        />
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
    setIsDragging(true);
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
          onChangeCardSize={handleChangeCardSize}
          onScaleToElements={handleScaleToElements}
          onSetDefaultSize={() => {
            localStorage.setItem('defaultCardSize', JSON.stringify({
              width: currentCard.canvas_width || 600,
              height: currentCard.canvas_height || 400
            }));
          }}
        >
          <div className="relative">
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
              onCanvasResize={handleCanvasResize}
            />
            
            {/* Element Settings Popup */}
            {selectedElement && showElementPopup && (
              <div className="absolute" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ 
                  position: 'relative',
                  left: getElementPopupPosition(selectedElement).x - (currentCard.canvas_width || 600) / 2,
                  top: getElementPopupPosition(selectedElement).y - (currentCard.canvas_height || 400) / 2
                }}>
                  <ElementSettingsPopup
                    element={selectedElement}
                    position={{ x: 0, y: 0 }}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    onClose={() => {
                      setShowElementPopup(false);
                      setSelectedElement(null);
                      setSelectedElementId(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </CanvasContextMenu>
      </div>

      <SimpleEditorFooter
        currentCard={currentCard}
        selectedElement={selectedElement}
        onUpdateCard={handleUpdateCard}
        cardWidth={currentCard.canvas_width || 600}
      />
    </div>
  );
};
