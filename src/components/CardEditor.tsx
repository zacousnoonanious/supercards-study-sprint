import React, { useState, useCallback, useEffect } from 'react';
import { useCardEditor } from '@/hooks/useCardEditor';
import { EditorHeader } from './EditorHeader';
import { ElementOptionsPanel } from './ElementOptionsPanel';
import { CardCanvas } from './CardCanvas';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { CanvasElement } from '@/types/flashcard';

export const CardEditor = () => {
  const {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElement,
    loading,
    setCurrentSide,
    setSelectedElement,
    setCurrentCardIndex,
    addElement,
    updateElement,
    updateCard,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
  } = useCardEditor();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');
  const [cardWidth, setCardWidth] = useState(900);
  const [cardHeight, setCardHeight] = useState(600);

  // Save card when switching cards or sides
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cards.length > 0) {
        const currentCard = cards[currentCardIndex];
        if (currentCard) {
          updateCard(currentCard.id, currentCard);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [cards, currentCardIndex, updateCard]);

  // Update deck name when set changes
  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title]);

  // Handle keyboard events for delete functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        handleDeleteElement(selectedElement);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement]);

  const handleUpdateElement = useCallback((elementId: string, updates: Partial<CanvasElement>) => {
    updateElement(elementId, updates);
  }, [updateElement]);

  const handleDeleteElement = useCallback((elementId: string) => {
    deleteElement(elementId);
    setSelectedElement(null);
  }, [deleteElement, setSelectedElement]);

  const handleElementSelect = useCallback((elementId: string | null) => {
    setSelectedElement(elementId);
  }, [setSelectedElement]);

  const getCurrentElements = () => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return [];
    return currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  };

  const getSelectedElementData = () => {
    if (!selectedElement) return null;
    return getCurrentElements().find(el => el.id === selectedElement) || null;
  };

  const handleSave = async () => {
    if (cards.length > 0) {
      const currentCard = cards[currentCardIndex];
      if (currentCard) {
        await updateCard(currentCard.id, currentCard);
      }
    }
  };

  const handleAutoArrange = (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right') => {
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
    // Only allow size changes for normal cards
    if (currentCard?.card_type === 'normal') {
      setCardWidth(width);
      setCardHeight(height);
    }
  }, [currentCard?.card_type]);

  // Set canvas dimensions based on card type
  useEffect(() => {
    if (currentCard) {
      switch (currentCard.card_type) {
        case 'simple':
          setCardWidth(600);
          setCardHeight(900);
          break;
        case 'informational':
          setCardWidth(900);
          setCardHeight(1800);
          break;
        case 'normal':
        default:
          // Keep current dimensions for normal cards, or set defaults
          if (!cardWidth || !cardHeight) {
            setCardWidth(600);
            setCardHeight(900);
          }
          break;
      }
    }
  }, [currentCard?.card_type]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading flashcard editor...</p>
        </div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No cards found in this set.</p>
          <button 
            onClick={createNewCard}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Create First Card
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <EditorHeader
        set={set}
        onSave={handleSave}
        isEditingDeckName={false}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={() => {}}
        onSaveEdit={() => {}}
        onCancelEdit={() => {}}
      />

      {/* Element Options Panel */}
      <ElementOptionsPanel
        selectedElement={getSelectedElementData()}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={(id) => handleDeleteElement(id)}
        canvasWidth={cardWidth}
        canvasHeight={cardHeight}
        onCanvasSizeChange={handleCanvasSizeChange}
        cardType={currentCard?.card_type}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="flex items-start gap-0">
          {/* Left Toolbar - directly adjacent to canvas */}
          <ConsolidatedToolbar
            onAddElement={addElement}
            onAutoArrange={handleAutoArrange}
            currentCard={currentCard}
            currentCardIndex={currentCardIndex}
            totalCards={cards.length}
            currentSide={currentSide}
            onNavigateCard={navigateCard}
            onSideChange={setCurrentSide}
            onCreateNewCard={createNewCard}
            onCreateNewCardWithLayout={createNewCardWithLayout}
            onDeleteCard={() => deleteCard(currentCard.id)}
            onCardTypeChange={(type: 'standard' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => updateCard(currentCard.id, { card_type: type })}
            position="left"
          />

          {/* Card Canvas and Footer */}
          <div className="flex flex-col">
            <CardCanvas
              elements={getCurrentElements()}
              selectedElement={selectedElement}
              onSelectElement={handleElementSelect}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
              cardSide={currentSide}
              style={{ width: cardWidth, height: cardHeight }}
            />

            {/* Bottom Footer */}
            <SimpleEditorFooter
              currentCard={currentCard}
              currentCardIndex={currentCardIndex}
              totalCards={cards.length}
              selectedElement={getSelectedElementData()}
              onUpdateCard={updateCard}
              onNavigateCard={navigateCard}
              cardWidth={cardWidth}
            />
          </div>
        </div>
      </div>

      {showShortcuts && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};
