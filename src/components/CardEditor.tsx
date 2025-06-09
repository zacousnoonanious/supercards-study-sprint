
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCardEditor } from '@/hooks/useCardEditor';
import { Navigation } from './Navigation';
import { EditorHeader } from './EditorHeader';
import { TopSettingsBar } from './TopSettingsBar';
import { CardCanvas } from './CardCanvas';
import { UndockableToolbar } from './UndockableToolbar';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { EditorCardOverview } from './EditorCardOverview';
import { CanvasElement } from '@/types/flashcard';
import { updateFlashcardSet } from '@/lib/api/sets';
import { useToast } from '@/hooks/use-toast';

interface CardEditorProps {
  setId?: string;
}

export const CardEditor: React.FC<CardEditorProps> = ({ setId }) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const { toast } = useToast();
  const {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElement: selectedElementId,
    loading,
    setCurrentSide,
    setSelectedElement: setSelectedElementId,
    setCurrentCardIndex,
    addElement,
    updateElement,
    updateCard,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
  } = useCardEditor();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showCardOverview, setShowCardOverview] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');
  const [cardWidth, setCardWidth] = useState(600);
  const [cardHeight, setCardHeight] = useState(450);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [toolbarPosition, setToolbarPosition] = useState<'left' | 'very-top' | 'canvas-left' | 'floating'>('left');
  const [toolbarIsDocked, setToolbarIsDocked] = useState(true);
  const [toolbarShowText, setToolbarShowText] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [isTextSelecting, setIsTextSelecting] = useState(false);
  
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const topSettingsBarRef = useRef<HTMLDivElement>(null);
  const canvasViewportRef = useRef<HTMLDivElement>(null);

  // Get current card early in the component
  const currentCard = cards[currentCardIndex];

  // Determine if we should use dark styling for the editor
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Calculate layout offset based on toolbar position and text display
  const getLayoutOffset = () => {
    if (toolbarIsDocked && toolbarPosition === 'left') {
      // Use wider margin when showing text labels
      const leftMargin = toolbarShowText ? '14rem' : '4.5rem'; // Increased margin for text mode
      return { marginLeft: leftMargin };
    }
    return {};
  };

  // Define callback functions first, before they're used in other functions
  const handleUpdateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    updateElement(elementId, updates);
  }, [updateElement]);

  const handleDeleteElement = useCallback((elementId: string) => {
    deleteElement(elementId);
    setSelectedElementId(null);
  }, [deleteElement, setSelectedElementId]);

  const handleElementSelect = useCallback((elementId: string | null) => {
    // Don't change selection during text selection
    if (isTextSelecting) return;
    setSelectedElementId(elementId);
  }, [setSelectedElementId, isTextSelecting]);

  const handleNavigateToCard = useCallback((cardIndex: number) => {
    setCurrentCardIndex(cardIndex);
    setSelectedElementId(null);
  }, [setCurrentCardIndex, setSelectedElementId]);

  // Handle text selection state changes
  const handleTextSelectionStart = useCallback(() => {
    setIsTextSelecting(true);
  }, []);

  const handleTextSelectionEnd = useCallback(() => {
    // Delay clearing the selection state to allow for proper event handling
    setTimeout(() => {
      setIsTextSelecting(false);
    }, 100);
  }, []);

  // Save card when switching cards or sides
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cards.length > 0 && currentCard) {
        updateCard(currentCard.id, currentCard);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [cards, currentCardIndex, updateCard, currentCard]);

  // Update deck name when set changes
  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title]);

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
      setSelectedElementId(null);
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
      if (currentCard?.card_type !== 'single-sided') {
        setCurrentSide('back');
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCurrentSide('front');
      return;
    }
  }, [selectedElementId, currentCardIndex, cards.length, currentCard, handleDeleteElement, navigateCard, setCurrentSide, setSelectedElementId, isTextSelecting]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Monitor text selection globally
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        setIsTextSelecting(true);
      } else {
        // Delay clearing to allow for proper event handling
        setTimeout(() => {
          setIsTextSelecting(false);
        }, 100);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Handle zoom and pan with left-click dragging - only for canvas background
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!canvasViewportRef.current?.contains(e.target as Node)) return;
      
      e.preventDefault();
      
      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl+scroll or pinch
        const rect = canvasViewportRef.current.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(3, zoom * zoomFactor));
        
        // Adjust pan to zoom towards center
        const zoomRatio = newZoom / zoom;
        setPanOffset(prev => ({
          x: centerX - (centerX - prev.x) * zoomRatio,
          y: centerY - (centerY - prev.y) * zoomRatio
        }));
        
        setZoom(newZoom);
      } else {
        // Pan with scroll
        setPanOffset(prev => ({
          x: prev.x - e.deltaX * 0.5,
          y: prev.y - e.deltaY * 0.5
        }));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Don't handle panning during text selection
      if (isTextSelecting) return;

      // Only handle left mouse button and only within canvas viewport
      if (e.button === 0 && canvasViewportRef.current?.contains(e.target as Node)) {
        // Check if we clicked on the canvas background, not an element
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          e.stopPropagation();
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          
          // Add cursor style
          if (canvasViewportRef.current) {
            canvasViewportRef.current.style.cursor = 'grabbing';
          }
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        e.preventDefault();
        e.stopPropagation();
        
        const deltaX = e.clientX - panStart.x;
        const deltaY = e.clientY - panStart.y;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setPanStart({ x: e.clientX, y: e.clientY });
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0 && isPanning) {
        e.preventDefault();
        e.stopPropagation();
        setIsPanning(false);
        
        // Reset cursor style
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
      }
    };

    // Touch event handlers for mobile
    const handleTouchStart = (e: TouchEvent) => {
      if (!canvasViewportRef.current?.contains(e.target as Node)) return;
      
      if (e.touches.length === 1) {
        const target = e.target as HTMLElement;
        const isCanvasBackground = target.hasAttribute('data-canvas-background') || 
                                 target.closest('[data-canvas-background]');
        
        if (isCanvasBackground && !target.closest('[data-element]')) {
          e.preventDefault();
          setIsPanning(true);
          setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isPanning && e.touches.length === 1) {
        e.preventDefault();
        
        const deltaX = e.touches[0].clientX - panStart.x;
        const deltaY = e.touches[0].clientY - panStart.y;
        
        setPanOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        
        setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };

    const handleTouchEnd = () => {
      if (isPanning) {
        setIsPanning(false);
        if (canvasViewportRef.current) {
          canvasViewportRef.current.style.cursor = zoom > 1 ? 'grab' : 'default';
        }
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    document.addEventListener('mousedown', handleMouseDown, { capture: true });
    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown, { capture: true });
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [zoom, panOffset, isPanning, panStart, isTextSelecting]);

  // Fit to area function
  const handleFitToArea = useCallback(() => {
    if (!canvasViewportRef.current) return;
    
    const viewportRect = canvasViewportRef.current.getBoundingClientRect();
    const viewportWidth = viewportRect.width;
    const viewportHeight = viewportRect.height;
    
    // Calculate zoom to fit with some padding
    const padding = 40;
    const zoomX = (viewportWidth - padding) / cardWidth;
    const zoomY = (viewportHeight - padding) / cardHeight;
    const newZoom = Math.min(zoomX, zoomY, 3); // Cap at 3x zoom
    
    // Center the canvas
    const scaledWidth = cardWidth * newZoom;
    const scaledHeight = cardHeight * newZoom;
    const centerX = (viewportWidth - scaledWidth) / 2;
    const centerY = (viewportHeight - scaledHeight) / 2;
    
    setZoom(newZoom);
    setPanOffset({ x: centerX, y: centerY });
  }, [cardWidth, cardHeight]);

  const getCurrentElements = () => {
    if (!currentCard) return [];
    return currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  };

  const getSelectedElementData = () => {
    if (!selectedElementId) return null;
    return getCurrentElements().find(el => el.id === selectedElementId) || null;
  };

  const handleSave = async () => {
    if (cards.length > 0 && currentCard) {
      await updateCard(currentCard.id, currentCard);
    }
  };

  const handleUpdateDeckTitle = async (newTitle: string) => {
    if (!set) return;
    
    try {
      await updateFlashcardSet(set.id, { title: newTitle });
      // Update local state immediately for real-time update
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
    const elements = getCurrentElements();
    if (elements.length === 0) return;

    const updatedElements = [...elements];
    
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
    setCardWidth(width);
    setCardHeight(height);
    
    // Update the current card with new dimensions
    if (currentCard) {
      updateCard(currentCard.id, { 
        canvas_width: width, 
        canvas_height: height 
      });
    }
  }, [currentCard, updateCard]);

  const handleCardUpdate = useCallback((updates: Partial<typeof currentCard>) => {
    if (currentCard) {
      updateCard(currentCard.id, updates);
    }
  }, [currentCard, updateCard]);

  // Set canvas dimensions based on card data
  useEffect(() => {
    if (currentCard) {
      const width = currentCard.canvas_width || 600;
      const height = currentCard.canvas_height || 450;
      
      setCardWidth(width);
      setCardHeight(height);
    }
  }, [currentCard]);

  // Handle toolbar position changes
  const handleToolbarPositionChange = useCallback((position: 'left' | 'very-top' | 'canvas-left' | 'floating', isDocked: boolean) => {
    setToolbarPosition(position);
    setToolbarIsDocked(isDocked);
  }, []);

  // Handle toolbar text toggle
  const handleToolbarTextToggle = useCallback((showText: boolean) => {
    setToolbarShowText(showText);
  }, []);

  const handleAddElement = useCallback((type: CanvasElement['type']) => {
    if (type === 'tts') {
      // Create a text element with TTS enabled
      addElement('text', {
        hasTTS: true,
        ttsEnabled: true,
        ttsAutoplay: false,
        ttsRate: 1,
        ttsPitch: 1,
        content: 'Click to edit and add speech'
      });
    } else {
      addElement(type);
    }
  }, [addElement]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't deselect during text selection
    if (isTextSelecting) return;
    
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget || (e.target as Element).hasAttribute('data-canvas-background')) {
      setSelectedElementId(null);
    }
  }, [setSelectedElementId, isTextSelecting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col" style={getLayoutOffset()}>
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg mb-4">{t('dashboard.noSets')}</p>
            <button 
              onClick={createNewCard}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              {t('dashboard.createFirst')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show card overview if toggled
  if (showCardOverview) {
    return (
      <div className="min-h-screen flex flex-col" style={getLayoutOffset()}>
        <Navigation />
        <EditorCardOverview
          cards={cards}
          currentCardIndex={currentCardIndex}
          onReorderCards={reorderCards}
          onNavigateToCard={handleNavigateToCard}
          onBackToEditor={() => setShowCardOverview(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <EditorHeader
        set={{ ...set, title: deckName }}
        onSave={handleSave}
        isEditingDeckName={false}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
        onUpdateDeckTitle={handleUpdateDeckTitle}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitToArea={handleFitToArea}
      />

      {/* Top Settings Bar */}
      <div ref={topSettingsBarRef}>
        <TopSettingsBar
          selectedElement={getSelectedElementData()}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={(id) => handleDeleteElement(id)}
          canvasWidth={cardWidth}
          canvasHeight={cardHeight}
          onCanvasSizeChange={handleCanvasSizeChange}
          currentCard={currentCard}
          onUpdateCard={handleCardUpdate}
          showGrid={showGrid}
          onShowGridChange={setShowGrid}
          snapToGrid={snapToGrid}
          onSnapToGridChange={setSnapToGrid}
          currentSide={currentSide}
          isTextSelecting={isTextSelecting}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex items-center justify-center p-1" ref={canvasContainerRef}>
          <div className="flex items-start gap-1 h-full w-full max-w-none">
            {/* Canvas-Left Toolbar Position */}
            {toolbarIsDocked && toolbarPosition === 'canvas-left' && (
              <UndockableToolbar
                onAddElement={handleAddElement}
                onAutoArrange={handleAutoArrange}
                currentCard={currentCard}
                currentCardIndex={currentCardIndex}
                totalCards={cards.length}
                currentSide={currentSide}
                onNavigateCard={navigateCard}
                onSideChange={setCurrentSide}
                onCreateNewCard={createNewCard}
                onCreateNewCardWithLayout={createNewCardWithLayout}
                onCreateNewCardFromTemplate={createNewCardFromTemplate}
                onDeleteCard={() => deleteCard(currentCard.id)}
                onCardTypeChange={(type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => updateCard(currentCard.id, { card_type: type })}
                onShowCardOverview={() => setShowCardOverview(true)}
                canvasRef={canvasContainerRef}
                topSettingsBarRef={topSettingsBarRef}
                onPositionChange={handleToolbarPositionChange}
                onTextToggle={handleToolbarTextToggle}
              />
            )}

            {/* Card Canvas and Footer Container */}
            <div className="flex flex-col flex-1 min-h-0 h-full">
              {/* Canvas Viewport with zoom and pan */}
              <div 
                ref={canvasViewportRef}
                className={`shadow-lg border overflow-hidden flex-1 relative ${
                  isDarkTheme 
                    ? 'bg-gray-800 border-gray-600' 
                    : 'bg-white border-gray-300'
                } ${zoom > 1 && !isPanning ? 'cursor-grab' : ''} ${isPanning ? 'cursor-grabbing' : ''}`}
                style={{ 
                  minWidth: Math.max(cardWidth * 0.5, 400),
                  minHeight: Math.max(cardHeight * 0.5, 300),
                  userSelect: isPanning ? 'none' : 'auto',
                }}
                data-canvas-background="true"
                onClick={handleCanvasClick}
              >
                <div
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                    transformOrigin: '0 0',
                    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
                    pointerEvents: isPanning ? 'none' : 'auto',
                  }}
                  data-canvas-background="true"
                >
                  <CardCanvas
                    elements={getCurrentElements()}
                    selectedElement={selectedElementId}
                    onSelectElement={handleElementSelect}
                    onUpdateElement={handleUpdateElement}
                    onDeleteElement={handleDeleteElement}
                    cardSide={currentSide}
                    style={{ 
                      width: cardWidth, 
                      height: cardHeight,
                      border: `2px solid ${isDarkTheme ? '#6b7280' : '#d1d5db'}`,
                      backgroundColor: isDarkTheme ? '#1f2937' : '#ffffff'
                    }}
                    showGrid={showGrid}
                    gridSize={20}
                    snapToGrid={snapToGrid}
                    zoom={zoom}
                    onTextSelectionStart={handleTextSelectionStart}
                    onTextSelectionEnd={handleTextSelectionEnd}
                  />
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="flex-shrink-0">
                <SimpleEditorFooter
                  currentCard={currentCard}
                  currentCardIndex={currentCardIndex}
                  totalCards={cards.length}
                  selectedElement={getSelectedElementData()}
                  onUpdateCard={updateCard}
                  onNavigateCard={navigateCard}
                  cardWidth={Math.max(cardWidth * 0.5, 400)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Toolbar Positions */}
      {(!toolbarIsDocked || toolbarPosition !== 'canvas-left') && (
        <UndockableToolbar
          onAddElement={handleAddElement}
          onAutoArrange={handleAutoArrange}
          currentCard={currentCard}
          currentCardIndex={currentCardIndex}
          totalCards={cards.length}
          currentSide={currentSide}
          onNavigateCard={navigateCard}
          onSideChange={setCurrentSide}
          onCreateNewCard={createNewCard}
          onCreateNewCardWithLayout={createNewCardWithLayout}
          onCreateNewCardFromTemplate={createNewCardFromTemplate}
          onDeleteCard={() => deleteCard(currentCard.id)}
          onCardTypeChange={(type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => updateCard(currentCard.id, { card_type: type })}
          onShowCardOverview={() => setShowCardOverview(true)}
          canvasRef={canvasContainerRef}
          topSettingsBarRef={topSettingsBarRef}
          onPositionChange={handleToolbarPositionChange}
          onTextToggle={handleToolbarTextToggle}
        />
      )}

      {showShortcuts && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};
