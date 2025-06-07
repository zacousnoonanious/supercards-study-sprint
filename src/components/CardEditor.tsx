import React, { useState, useCallback, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { useCardEditor } from '@/hooks/useCardEditor';
import { EditorHeader } from './EditorHeader';
import { ElementOptionsPanel } from './ElementOptionsPanel';
import { CardCanvas } from './CardCanvas';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { SimpleEditorFooter } from './SimpleEditorFooter';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { CanvasElement } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const CardEditor = () => {
  const { t } = useI18n();
  const { toast } = useToast();
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
    createNewCardFromTemplate,
    createNewCardWithLayout,
    deleteCard,
    reorderCards,
  } = useCardEditor();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [deckName, setDeckName] = useState(set?.title || '');
  const [isEditingDeckName, setIsEditingDeckName] = useState(false);
  const [originalDeckName, setOriginalDeckName] = useState(set?.title || '');
  const [cardWidth, setCardWidth] = useState(900);
  const [cardHeight, setCardHeight] = useState(600);

  // Get current card early in the component
  const currentCard = cards[currentCardIndex];

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
      setOriginalDeckName(set.title);
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
    if (!currentCard) return [];
    return currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  };

  const getSelectedElementData = () => {
    if (!selectedElement) return null;
    return getCurrentElements().find(el => el.id === selectedElement) || null;
  };

  const handleSave = async () => {
    if (cards.length > 0 && currentCard) {
      await updateCard(currentCard.id, currentCard);
    }
  };

  // Deck name editing functions
  const handleStartEditDeckName = () => {
    setIsEditingDeckName(true);
    setOriginalDeckName(deckName);
  };

  const handleSaveDeckName = async () => {
    if (!set || deckName.trim() === '') {
      setDeckName(originalDeckName);
      setIsEditingDeckName(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ title: deckName.trim() })
        .eq('id', set.id);

      if (error) throw error;

      toast({
        title: t('success.saved'),
        description: t('editor.saveDeckName')
      });
      
      setIsEditingDeckName(false);
      setOriginalDeckName(deckName.trim());
    } catch (error) {
      console.error('Error updating deck name:', error);
      toast({
        title: t('error.general'),
        description: 'Failed to update deck name.',
        variant: "destructive"
      });
      setDeckName(originalDeckName);
      setIsEditingDeckName(false);
    }
  };

  const handleCancelEditDeckName = () => {
    setDeckName(originalDeckName);
    setIsEditingDeckName(false);
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

  // Set canvas dimensions based on card data
  useEffect(() => {
    if (currentCard) {
      const width = currentCard.canvas_width || 600;
      const height = currentCard.canvas_height || 900;
      
      setCardWidth(width);
      setCardHeight(height);
    }
  }, [currentCard]);

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
      <div className="min-h-screen flex items-center justify-center">
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
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <EditorHeader
        set={set}
        onSave={handleSave}
        isEditingDeckName={isEditingDeckName}
        deckName={deckName}
        onDeckNameChange={setDeckName}
        onStartEdit={handleStartEditDeckName}
        onSaveEdit={handleSaveDeckName}
        onCancelEdit={handleCancelEditDeckName}
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
            onCreateNewCardFromTemplate={createNewCardFromTemplate}
            onDeleteCard={() => deleteCard(currentCard.id)}
            onCardTypeChange={(type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => updateCard(currentCard.id, { card_type: type })}
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
