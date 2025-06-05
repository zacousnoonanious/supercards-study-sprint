
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CardCanvas } from './CardCanvas';
import { EditorHeader } from './EditorHeader';
import { CanvasOverlayToolbar } from './CanvasOverlayToolbar';
import { ElementPopupToolbar } from './ElementPopupToolbar';
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
        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="flex items-center justify-center min-h-[600px]">
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
              onDeleteCard={() => {}}
              onSave={saveCard}
            />
          </div>
        </main>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  const selectedElementData = selectedElement ? currentElements.find(el => el.id === selectedElement) : null;

  // Determine canvas size based on card type
  const getCanvasStyle = () => {
    const cardType = currentCard?.card_type || 'standard';
    switch (cardType) {
      case 'informational':
        return { aspectRatio: '16/9', minHeight: '600px' };
      case 'quiz-only':
        return { aspectRatio: '4/3', minHeight: '500px' };
      default:
        return { aspectRatio: '3/2', minHeight: '400px' };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader set={set} onSave={saveCard} />

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <Card className="mb-4">
            <CardContent className="p-3 sm:p-4">
              <div className="overflow-auto">
                <CardCanvas
                  elements={currentElements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                  cardSide={currentSide}
                  style={getCanvasStyle()}
                  cardType={currentCard?.card_type}
                  onAddElement={addElement}
                  quizTitle={currentCard?.quiz_title || ''}
                  onQuizTitleChange={(title) => updateCard(currentCard.id, { quiz_title: title })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Overlay Toolbar */}
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
            onDeleteCard={() => deleteCard(currentCard.id)}
            onSave={saveCard}
          />

          {/* Element Popup Toolbar */}
          {selectedElementData && (
            <ElementPopupToolbar
              element={selectedElementData}
              onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
              onDelete={() => selectedElement && deleteElement(selectedElement)}
              position={{ x: 100, y: 100 }} // This will be positioned dynamically based on element
            />
          )}
        </div>
      </main>
    </div>
  );
};
