
import React, { useEffect } from 'react';
import { useCardEditor } from '@/hooks/useCardEditor';
import { EditorHeader } from './EditorHeader';
import { CardCanvas } from './CardCanvas';
import { ElementToolbar } from './ElementToolbar';
import { CardNavigation } from './CardNavigation';
import { EditorFooter } from './EditorFooter';
import { KeyboardShortcutsTooltip } from './KeyboardShortcutsTooltip';

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
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
  } = useCardEditor();

  // Auto-save functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (cards.length > 0) {
        saveCard();
      }
    }, 2000); // Auto-save every 2 seconds

    return () => clearInterval(interval);
  }, [saveCard, cards.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || 
          (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
          (e.target as HTMLElement)?.contentEditable === 'true') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            saveCard();
            break;
          case 'n':
            e.preventDefault();
            createNewCard();
            break;
        }
      } else {
        switch (e.key) {
          case 'ArrowLeft':
            if (e.shiftKey) {
              e.preventDefault();
              navigateCard('prev');
            }
            break;
          case 'ArrowRight':
            if (e.shiftKey) {
              e.preventDefault();
              navigateCard('next');
            }
            break;
          case 'f':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              setCurrentSide('front');
            }
            break;
          case 'b':
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              setCurrentSide('back');
            }
            break;
          case 'Escape':
            setSelectedElement(null);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveCard, createNewCard, navigateCard, setCurrentSide, setSelectedElement]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">Loading editor...</div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">No cards found</h2>
          <p className="text-muted-foreground">This set doesn't have any cards yet.</p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <KeyboardShortcutsTooltip />
      
      {/* Editor Header */}
      <EditorHeader
        set={set}
        cards={cards}
        currentCardIndex={currentCardIndex}
        onCreateNewCard={createNewCard}
        onCreateNewCardFromTemplate={createNewCardFromTemplate}
        onCreateNewCardWithLayout={createNewCardWithLayout}
        onDeleteCard={deleteCard}
        onReorderCards={reorderCards}
      />

      {/* Main Editor Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Sidebar - Element Toolbar */}
        <div className="w-full lg:w-64 bg-muted/30 border-r border-border p-4">
          <ElementToolbar
            onAddElement={addElement}
            selectedElement={selectedElement}
            currentCard={currentCard}
            currentSide={currentSide}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
          />
        </div>

        {/* Center - Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Card Navigation */}
          <CardNavigation
            cards={cards}
            currentCardIndex={currentCardIndex}
            onNavigate={navigateCard}
            currentSide={currentSide}
            onSideChange={setCurrentSide}
            onUpdateCard={updateCard}
            currentCard={currentCard}
          />

          {/* Canvas */}
          <div className="flex-1 p-4">
            <CardCanvas
              card={currentCard}
              currentSide={currentSide}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <EditorFooter
        currentCard={currentCard}
        onSave={saveCard}
      />
    </div>
  );
};
