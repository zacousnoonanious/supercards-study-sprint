
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ElementToolbar } from './ElementToolbar';
import { CardCanvas } from './CardCanvas';
import { CardNavigation } from './CardNavigation';
import { EditorHeader } from './EditorHeader';
import { useCardEditor } from '@/hooks/useCardEditor';

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
    saveCard,
    addElement,
    updateElement,
    deleteElement,
    navigateCard,
  } = useCardEditor();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">No cards found</div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  const selectedElementData = selectedElement ? currentElements.find(el => el.id === selectedElement) : null;

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader set={set} onSave={saveCard} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Toolbar */}
          <div className="lg:col-span-1">
            <ElementToolbar
              onAddElement={addElement}
              selectedElement={selectedElementData}
              onUpdateElement={(updates) => selectedElement && updateElement(selectedElement, updates)}
              onDeleteElement={() => selectedElement && deleteElement(selectedElement)}
            />
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-3">
            <Card className="mb-4">
              <CardContent className="p-4">
                <CardNavigation
                  currentIndex={currentCardIndex}
                  totalCards={cards.length}
                  onNavigate={navigateCard}
                  currentSide={currentSide}
                  onSideChange={setCurrentSide}
                />

                <CardCanvas
                  elements={currentElements}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  onUpdateElement={updateElement}
                  cardSide={currentSide}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
