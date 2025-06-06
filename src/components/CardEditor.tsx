
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CardCanvas } from './CardCanvas';
import { EditorHeader } from './EditorHeader';
import { CanvasOverlayToolbar } from './CanvasOverlayToolbar';
import { useCardEditor } from '@/hooks/useCardEditor';

export const CardEditor: React.FC = () => {
  const {
    set,
    cards,
    currentCardIndex,
    currentSide,
    selectedElement,
    loading,
    setCurrentSide,
    setSelectedElement,
    saveCard,
    addElement,
    updateElement,
    updateCard,
    deleteElement,
    navigateCard,
    createNewCard,
    createNewCardWithLayout,
    deleteCard,
  } = useCardEditor();

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete key to remove selected element
      if (e.key === 'Delete' && selectedElement) {
        e.preventDefault();
        deleteElement(selectedElement);
      }
      
      // Escape to deselect element
      if (e.key === 'Escape' && selectedElement) {
        e.preventDefault();
        setSelectedElement(null);
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && e.ctrlKey) {
        e.preventDefault();
        navigateCard('prev');
      }
      
      if (e.key === 'ArrowRight' && e.ctrlKey) {
        e.preventDefault();
        navigateCard('next');
      }
      
      // Ctrl+S to save
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        saveCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, setSelectedElement, navigateCard, saveCard]);

  console.log('CardEditor render - loading:', loading, 'set:', set, 'cards:', cards.length);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  if (!set) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Set not found</div>
      </div>
    );
  }

  // Show empty state if no cards exist
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EditorHeader set={set} onSave={saveCard} />
        <main className="h-[calc(100vh-80px)] p-1">
          <div className="relative h-full">
            <div className="flex items-center justify-center h-full pt-16">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">No cards in this set</h2>
                <p className="text-gray-600 text-sm sm:text-base">Create your first card to get started!</p>
              </div>
            </div>
            <CanvasOverlayToolbar
              set={set}
              currentCard={{} as any}
              currentCardIndex={0}
              totalCards={0}
              currentSide={currentSide}
              onAddElement={addElement}
              onUpdateCard={updateCard}
              onNavigateCard={navigateCard}
              onSideChange={setCurrentSide}
              onCreateNewCard={createNewCard}
              onCreateNewCardWithLayout={createNewCardWithLayout}
              onDeleteCard={async () => false}
              onSave={saveCard}
            />
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;

  const handleDeleteCard = async (): Promise<boolean> => {
    return await deleteCard(currentCard.id);
  };

  const handleAutoArrange = () => {
    // Auto-arrange elements in a grid layout
    const elementsToArrange = currentElements;
    if (elementsToArrange.length === 0) return;

    const cols = Math.ceil(Math.sqrt(elementsToArrange.length));
    const cellWidth = 250;
    const cellHeight = 180;
    const margin = 20;
    
    elementsToArrange.forEach((element, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      updateElement(element.id, {
        x: col * cellWidth + margin,
        y: row * cellHeight + margin,
        width: Math.min(element.width, cellWidth - margin),
        height: Math.min(element.height, cellHeight - margin),
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader set={set} onSave={saveCard} />

      <main className="h-[calc(100vh-80px)] relative">
        {/* Compact Overlay Toolbar - positioned with proper spacing */}
        <div className="absolute top-2 left-2 right-2 z-20">
          <CanvasOverlayToolbar
            set={set}
            currentCard={currentCard}
            currentCardIndex={currentCardIndex}
            totalCards={cards.length}
            currentSide={currentSide}
            onAddElement={addElement}
            onUpdateCard={updateCard}
            onNavigateCard={navigateCard}
            onSideChange={setCurrentSide}
            onCreateNewCard={createNewCard}
            onCreateNewCardWithLayout={createNewCardWithLayout}
            onDeleteCard={handleDeleteCard}
            onSave={saveCard}
            onAutoArrange={handleAutoArrange}
          />
        </div>

        {/* Canvas takes up the full remaining space with proper top padding */}
        <div className="h-full flex items-center justify-center pt-20 pb-4">
          <CardCanvas
            elements={currentElements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            cardSide={currentSide}
            cardType={currentCard?.card_type}
            onAddElement={addElement}
            onAutoArrange={handleAutoArrange}
          />
        </div>
      </main>
    </div>
  );
};
