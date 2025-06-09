
import React, { useEffect, useState } from 'react';
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

  // State for editor-specific functionality
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');
  const [zoom, setZoom] = useState(1);

  // Update deck name when set changes
  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title]);

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

  const handleUpdateDeckTitle = async (title: string) => {
    setDeckName(title);
    // Add logic to save deck title to database if needed
  };

  const handleStartEdit = () => setIsEditingDeckName(true);
  const handleSaveEdit = () => setIsEditingDeckName(false);
  const handleCancelEdit = () => {
    setIsEditingDeckName(false);
    setDeckName(set?.title || '');
  };

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
  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <KeyboardShortcutsTooltip />
      
      {/* Editor Header */}
      <EditorHeader
        set={set}
        onSave={saveCard}
        isEditingDeckName={isEditingDeckName}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={handleStartEdit}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onUpdateDeckTitle={handleUpdateDeckTitle}
        zoom={zoom}
        onZoomChange={setZoom}
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
            currentCardIndex={currentCardIndex}
            totalCards={cards.length}
            onNavigate={navigateCard}
            currentSide={currentSide}
            onSideChange={setCurrentSide}
            onUpdateCard={updateCard}
            currentCard={currentCard}
          />

          {/* Canvas */}
          <div className="flex-1 p-4">
            <CardCanvas
              elements={currentElements || []}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              cardSide={currentSide}
              style={{
                width: currentCard.canvas_width || 600,
                height: currentCard.canvas_height || 450,
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              zoom={zoom}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <EditorFooter
        currentCard={currentCard}
      />
    </div>
  );
};
