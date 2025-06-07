
import React, { useState, useCallback, useEffect } from 'react';
import { useCardEditor } from '@/hooks/useCardEditor';
import { EditorHeader } from './EditorHeader';
import { EditorFooter } from './EditorFooter';
import { ElementToolbar } from './ElementToolbar';
import { CardCanvas } from './CardCanvas';
import { ElementOptionsPanel } from './ElementOptionsPanel';
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

  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [snapPrecision, setSnapPrecision] = useState<'coarse' | 'medium' | 'fine'>('medium');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [textScale, setTextScale] = useState(1);
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');

  // Save card when switching cards or sides
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cards.length > 0) {
        const currentCard = cards[currentCardIndex];
        if (currentCard) {
          updateCard(currentCard.id, currentCard);
        }
      }
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [cards, currentCardIndex, updateCard]);

  // Update deck name when set changes
  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title]);

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

  const handleStartEdit = () => {
    setIsEditingDeckName(true);
  };

  const handleSaveEdit = () => {
    setIsEditingDeckName(false);
    // TODO: Update set title in database
  };

  const handleCancelEdit = () => {
    setIsEditingDeckName(false);
    setDeckName(set?.title || '');
  };

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
      <EditorHeader
        set={set}
        onSave={handleSave}
        isEditingDeckName={isEditingDeckName}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
      />

      {/* Element Options Panel */}
      <ElementOptionsPanel
        selectedElement={getSelectedElementData()}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
      />

      <div className="flex-1 flex flex-col">
        <CardCanvas
          elements={getCurrentElements()}
          selectedElement={selectedElement}
          onSelectElement={handleElementSelect}
          onUpdateElement={handleUpdateElement}
          onDeleteElement={handleDeleteElement}
          cardSide={currentSide}
        />
      </div>

      <EditorFooter
        currentCard={currentCard}
        selectedElement={getSelectedElementData()}
        onUpdateElement={handleUpdateElement}
        onUpdateCard={(cardId, updates) => updateCard(cardId, updates)}
      />

      {showShortcuts && (
        <KeyboardShortcutsHelp onClose={() => setShowShortcuts(false)} />
      )}
    </div>
  );
};
