import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Edit, LayoutGrid } from 'lucide-react';
import { CardCanvas } from './CardCanvas';
import { EditorHeader } from './EditorHeader';
import { LockableToolbar } from './LockableToolbar';
import { CardOverview } from './CardOverview';
import { useCardEditor } from '@/hooks/useCardEditor';
import { supabase } from '@/integrations/supabase/client';

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
    reorderCards,
    setCurrentCardIndex,
  } = useCardEditor();

  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');
  const [showCardOverview, setShowCardOverview] = useState(false);

  useEffect(() => {
    if (set?.title) {
      setDeckName(set.title);
    }
  }, [set?.title]);

  // Force front side for single-sided cards - MUST be called before any conditional returns
  useEffect(() => {
    const currentCard = cards[currentCardIndex];
    if (currentCard?.card_type === 'single-sided' && currentSide === 'back') {
      setCurrentSide('front');
    }
  }, [cards, currentCardIndex, currentSide, setCurrentSide]);

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

  const handleEditCard = (cardIndex: number) => {
    setCurrentCardIndex(cardIndex);
    setShowCardOverview(false);
    setSelectedElement(null);
    setCurrentSide('front');
  };

  const handleSaveDeckName = async () => {
    if (!set) return;
    
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ title: deckName })
        .eq('id', set.id);

      if (error) throw error;
      
      setIsEditingDeckName(false);
      console.log('Deck name updated successfully');
    } catch (error) {
      console.error('Error updating deck name:', error);
    }
  };

  const handleCancelEdit = () => {
    setDeckName(set?.title || '');
    setIsEditingDeckName(false);
  };

  const getCardTypeLabel = (cardType: string) => {
    switch (cardType) {
      case 'standard': return 'Standard Card';
      case 'informational': return 'Informational Card';
      case 'single-sided': return 'Single-Sided Card';
      default: return 'Standard Card';
    }
  };

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

  // Show card overview if requested
  if (showCardOverview) {
    return (
      <CardOverview
        cards={cards}
        onReorderCards={reorderCards}
        onBackToEditor={() => setShowCardOverview(false)}
        onEditCard={handleEditCard}
      />
    );
  }

  // Show empty state if no cards exist
  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <EditorHeader 
          set={set} 
          onSave={saveCard}
          isEditingDeckName={isEditingDeckName}
          deckName={deckName}
          onDeckNameChange={setDeckName}
          onStartEdit={() => setIsEditingDeckName(true)}
          onSaveEdit={handleSaveDeckName}
          onCancelEdit={handleCancelEdit}
        />
        <main className="h-[calc(100vh-80px)] p-1">
          <div className="relative h-full">
            <div className="flex items-center justify-center h-full pt-20">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">No cards in this set</h2>
                <p className="text-gray-600 text-sm sm:text-base">Create your first card to get started!</p>
              </div>
            </div>
            <LockableToolbar
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

  const handleAutoArrange = (type: 'grid' | 'center' | 'justify' | 'stack') => {
    const elementsToArrange = currentElements;
    if (elementsToArrange.length === 0) return;

    switch (type) {
      case 'grid':
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
        break;

      case 'center':
        const canvasWidth = 900;
        const canvasHeight = currentCard.card_type === 'informational' ? 800 : 600;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        elementsToArrange.forEach((element) => {
          updateElement(element.id, {
            x: centerX - element.width / 2,
            y: centerY - element.height / 2,
          });
        });
        break;

      case 'justify':
        const totalWidth = 900 - 40; // Canvas width minus margins
        const elementSpacing = totalWidth / (elementsToArrange.length + 1);
        
        elementsToArrange.forEach((element, index) => {
          updateElement(element.id, {
            x: elementSpacing * (index + 1) - element.width / 2,
            y: 100,
          });
        });
        break;

      case 'stack':
        const stackSpacing = 20;
        
        elementsToArrange.forEach((element, index) => {
          updateElement(element.id, {
            x: 50,
            y: 50 + index * (element.height + stackSpacing),
          });
        });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EditorHeader 
        set={set} 
        onSave={saveCard}
        isEditingDeckName={isEditingDeckName}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={() => setIsEditingDeckName(true)}
        onSaveEdit={handleSaveDeckName}
        onCancelEdit={handleCancelEdit}
      />

      {/* Card Overview Button */}
      <div className="fixed top-24 right-4 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCardOverview(true)}
          className="bg-white/90 backdrop-blur-sm shadow-md"
          title="View all cards"
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Card Overview
        </Button>
      </div>

      <main className="h-[calc(100vh-80px)] relative">
        {/* Lockable Toolbar */}
        <LockableToolbar
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
          isBackSideDisabled={currentCard?.card_type === 'single-sided'}
        />

        {/* Canvas with card type label and enhanced spacing */}
        <div className="h-full flex flex-col items-center justify-center pt-16 pb-16 px-12">
          {/* Card Type Label */}
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full">
              {getCardTypeLabel(currentCard?.card_type || 'standard')}
            </span>
          </div>
          
          <CardCanvas
            elements={currentElements}
            selectedElement={selectedElement}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            cardSide={currentSide}
            cardType={currentCard?.card_type}
            onAddElement={addElement}
            onAutoArrange={() => handleAutoArrange('grid')}
          />
        </div>
      </main>
    </div>
  );
};
