
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Grid, Layers, Shuffle } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { BulkCardOperations } from './BulkCardOperations';

interface CardOverviewProps {
  cards: Flashcard[];
  onReorderCards: (cards: Flashcard[]) => void;
  onBackToEditor: () => void;
  onEditCard: (cardIndex: number) => void;
}

export const CardOverview: React.FC<CardOverviewProps> = ({
  cards,
  onReorderCards,
  onBackToEditor,
  onEditCard,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'fan'>('grid');
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);

  const shuffleCards = useCallback(async () => {
    setIsShuffling(true);
    // Fisher-Yates shuffle algorithm
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Optimistically update the UI
    onReorderCards(shuffled);
    
    // Simulate shuffle animation
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsShuffling(false);
  }, [cards, onReorderCards]);

  const getCardClassName = (index: number, viewMode: string) => {
    if (viewMode === 'grid') {
      return 'relative rounded-lg border shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer';
    } else {
      // Fan view with proper transforms
      const totalCards = cards.length;
      const maxAngle = 60; // Maximum spread angle
      const angleStep = totalCards > 1 ? maxAngle / (totalCards - 1) : 0;
      const rotate = index * angleStep - maxAngle / 2;
      const translateX = index * 5; // Slight horizontal offset
      const translateY = Math.abs(rotate) * 2; // Slight vertical curve
      const zIndex = totalCards - Math.abs(index - totalCards / 2); // Center cards on top
      
      return `absolute w-64 h-48 rounded-lg border shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer`;
    }
  };

  const getCardStyle = (index: number, viewMode: string) => {
    if (viewMode === 'fan') {
      const totalCards = cards.length;
      const maxAngle = 60;
      const angleStep = totalCards > 1 ? maxAngle / (totalCards - 1) : 0;
      const rotate = index * angleStep - maxAngle / 2;
      const translateX = index * 5;
      const translateY = Math.abs(rotate) * 2;
      const zIndex = totalCards - Math.abs(index - totalCards / 2);
      
      return {
        transform: `translate(-50%, -50%) rotate(${rotate}deg) translateX(${translateX}px) translateY(${translateY}px)`,
        transformOrigin: 'center bottom',
        zIndex: zIndex,
        top: '50%',
        left: '50%',
      };
    }
    return {};
  };

  const renderCard = (card: Flashcard, index: number) => {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{card.question}</h3>
        <p className="text-sm text-gray-500">Card {index + 1}</p>
      </div>
    );
  };

  const handleCardClick = (cardIndex: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      const cardId = cards[cardIndex].id;
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    } else if (event.shiftKey && selectedCards.length > 0) {
      // Range select with Shift - Fixed logic
      const lastSelectedCardId = selectedCards[selectedCards.length - 1];
      const lastSelectedIndex = cards.findIndex(card => card.id === lastSelectedCardId);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, cardIndex);
        const end = Math.max(lastSelectedIndex, cardIndex);
        const rangeIds = cards.slice(start, end + 1).map(card => card.id);
        setSelectedCards(prev => {
          const newSelection = new Set([...prev, ...rangeIds]);
          return Array.from(newSelection);
        });
      }
    } else if (selectedCards.length > 0) {
      // Clear selection and potentially edit card
      setSelectedCards([]);
      if (!selectedCards.includes(cards[cardIndex].id)) {
        onEditCard(cardIndex);
      }
    } else {
      // Single click to edit
      onEditCard(cardIndex);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedCard === null || draggedCard === dropIndex) {
      setDraggedCard(null);
      return;
    }

    const newCards = [...cards];
    const draggedItem = newCards[draggedCard];
    
    // Remove the dragged item
    newCards.splice(draggedCard, 1);
    
    // Insert at new position
    const insertIndex = draggedCard < dropIndex ? dropIndex - 1 : dropIndex;
    newCards.splice(insertIndex, 0, draggedItem);
    
    onReorderCards(newCards);
    setDraggedCard(null);
  };

  const handleBulkUpdate = async (cardIds: string[], updates: any) => {
    console.log('Bulk updating cards:', cardIds, updates);
    
    if (updates.updateElements && updates.elementUpdates) {
      // Update specific element properties - Fixed to preserve existing properties
      cardIds.forEach(cardId => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
          // Update front elements
          card.front_elements.forEach(element => {
            if (!updates.elementType || element.type === updates.elementType) {
              // Merge updates instead of replacing
              Object.keys(updates.elementUpdates).forEach(key => {
                element[key] = updates.elementUpdates[key];
              });
            }
          });
          
          // Update back elements
          card.back_elements.forEach(element => {
            if (!updates.elementType || element.type === updates.elementType) {
              // Merge updates instead of replacing
              Object.keys(updates.elementUpdates).forEach(key => {
                element[key] = updates.elementUpdates[key];
              });
            }
          });
        }
      });
      
      // Trigger reorder to update the cards in the parent
      onReorderCards([...cards]);
    }
  };

  const handleAutoArrange = (cardIds: string[], arrangeType: string) => {
    cardIds.forEach(cardId => {
      const card = cards.find(c => c.id === cardId);
      if (card) {
        const arrangeElements = (elements: any[]) => {
          switch (arrangeType) {
            case 'grid':
              const cols = Math.ceil(Math.sqrt(elements.length));
              elements.forEach((element, index) => {
                const row = Math.floor(index / cols);
                const col = index % cols;
                element.x = col * 250 + 20;
                element.y = row * 180 + 20;
              });
              break;
            case 'center':
              elements.forEach(element => {
                element.x = 450 - element.width / 2;
                element.y = 300 - element.height / 2;
              });
              break;
            case 'stack':
              elements.forEach((element, index) => {
                element.x = 50;
                element.y = 50 + index * (element.height + 20);
              });
              break;
            case 'justify':
              const spacing = 900 / (elements.length + 1);
              elements.forEach((element, index) => {
                element.x = spacing * (index + 1) - element.width / 2;
                element.y = 100;
              });
              break;
          }
        };

        arrangeElements(card.front_elements);
        arrangeElements(card.back_elements);
      }
    });
    
    // Trigger reorder to update the cards in the parent
    onReorderCards([...cards]);
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBackToEditor}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <h1 className="text-2xl font-bold">Card Overview</h1>
          {selectedCards.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selectedCards.length} selected
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shuffleCards}
            disabled={isShuffling}
            className="flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" />
            {isShuffling ? 'Shuffling...' : 'Shuffle'}
          </Button>
          
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-2"
            >
              <Grid className="w-4 h-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === 'fan' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('fan')}
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Fan
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 text-sm text-muted-foreground">
        Click to edit • Ctrl+Click to select multiple • Shift+Click to select range • Drag to reorder
      </div>

      {/* Cards Container */}
      <div 
        className={`transition-all duration-500 ${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'relative h-96 flex items-center justify-center'
        }`}
      >
        {cards.map((card, index) => {
          const isSelected = selectedCards.includes(card.id);
          const isDragging = draggedCard === index;
          
          return (
            <div
              key={card.id}
              className={`${getCardClassName(index, viewMode)} ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              } ${isDragging ? 'opacity-50' : ''}`}
              style={getCardStyle(index, viewMode)}
              onClick={(e) => handleCardClick(index, e)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              {renderCard(card, index)}
            </div>
          );
        })}
      </div>

      {/* Bulk Operations Panel */}
      {selectedCards.length > 0 && (
        <BulkCardOperations
          selectedCards={selectedCards}
          cards={cards}
          onClearSelection={clearSelection}
          onBulkUpdate={handleBulkUpdate}
          onAutoArrange={handleAutoArrange}
        />
      )}
    </div>
  );
};
