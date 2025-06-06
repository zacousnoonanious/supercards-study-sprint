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
      const fanAngle = 20;
      const fanOffset = (cards.length - 1) * fanAngle / 2;
      const rotate = index * fanAngle - fanOffset;
      const translateZ = 10 * index;
      return `absolute top-1/2 left-1/2 w-64 h-48 -mt-24 -ml-32 rounded-lg border shadow-md transition-all duration-300 hover:shadow-lg cursor-pointer transform origin-center rotate-[-${rotate}deg] translate-z-[${translateZ}px]`;
    }
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
      // Range select with Shift
      const lastSelectedIndex = cards.findIndex(card => 
        card.id === selectedCards[selectedCards.length - 1]
      );
      const start = Math.min(lastSelectedIndex, cardIndex);
      const end = Math.max(lastSelectedIndex, cardIndex);
      const rangeIds = cards.slice(start, end + 1).map(card => card.id);
      setSelectedCards(prev => [...new Set([...prev, ...rangeIds])]);
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

  const handleBulkUpdate = async (cardIds: string[], updates: any) => {
    // Apply updates to all selected cards
    console.log('Bulk updating cards:', cardIds, updates);
    
    if (updates.updateElements && updates.elementUpdates) {
      // Update specific element properties
      cardIds.forEach(cardId => {
        const card = cards.find(c => c.id === cardId);
        if (card) {
          // Update front elements
          card.front_elements.forEach(element => {
            if (!updates.elementType || element.type === updates.elementType) {
              Object.assign(element, updates.elementUpdates);
            }
          });
          
          // Update back elements
          card.back_elements.forEach(element => {
            if (!updates.elementType || element.type === updates.elementType) {
              Object.assign(element, updates.elementUpdates);
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
        Click to edit • Ctrl+Click to select multiple • Shift+Click to select range
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
          return (
            <div
              key={card.id}
              className={`${getCardClassName(index, viewMode)} ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              }`}
              onClick={(e) => handleCardClick(index, e)}
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
