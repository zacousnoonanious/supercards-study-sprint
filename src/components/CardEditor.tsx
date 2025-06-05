import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ElementToolbar } from './ElementToolbar';
import { CardCanvas } from './CardCanvas';
import { CardNavigation } from './CardNavigation';
import { EditorHeader } from './EditorHeader';
import { KeyboardShortcutsTooltip } from './KeyboardShortcutsTooltip';
import { CardTypeSelector } from './CardTypeSelector';
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <ElementToolbar
                onAddElement={addElement}
                selectedElement={null}
                onUpdateElement={() => {}}
                onDeleteElement={() => {}}
                onCreateNewCard={createNewCard}
                onCreateNewCardWithLayout={createNewCardWithLayout}
              />
            </div>
            <div className="lg:col-span-3 order-1 lg:order-2 flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">No cards in this set</h2>
                <p className="text-gray-600 text-sm sm:text-base">Create your first card to get started!</p>
              </div>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-4 space-y-4">
              {/* Card Type Selector */}
              <Card>
                <CardContent className="p-4">
                  <CardTypeSelector
                    card={currentCard}
                    onUpdateCard={(updates) => updateCard(currentCard.id, updates)}
                  />
                </CardContent>
              </Card>

              <ElementToolbar
                onAddElement={addElement}
                selectedElement={selectedElementData}
                onUpdateElement={(updates) => selectedElement && updateElement(selectedElement, updates)}
                onDeleteElement={() => selectedElement && deleteElement(selectedElement)}
                onCreateNewCard={createNewCard}
                onCreateNewCardWithLayout={createNewCardWithLayout}
              />
            </div>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <Card className="mb-4">
              <CardContent className="p-3 sm:p-4">
                <CardNavigation
                  currentIndex={currentCardIndex}
                  totalCards={cards.length}
                  onNavigate={navigateCard}
                  currentSide={currentSide}
                  onSideChange={setCurrentSide}
                  onCreateNewCard={createNewCard}
                  onCreateNewCardWithLayout={createNewCardWithLayout}
                  onDeleteCard={() => deleteCard(currentCard.id)}
                  cardType={currentCard?.card_type}
                />

                <div className="overflow-auto">
                  <CardCanvas
                    elements={currentElements}
                    selectedElement={selectedElement}
                    onSelectElement={setSelectedElement}
                    onUpdateElement={updateElement}
                    onDeleteElement={deleteElement}
                    cardSide={currentSide}
                    style={getCanvasStyle()}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
