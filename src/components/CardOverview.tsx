
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Shuffle } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';
import { BulkCardOperations } from './BulkCardOperations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOverCard, setDragOverCard] = useState<number | null>(null);
  const [showShuffleDialog, setShowShuffleDialog] = useState(false);

  const getCardDescription = (card: Flashcard) => {
    const frontElementsCount = card.front_elements?.length || 0;
    const backElementsCount = card.back_elements?.length || 0;
    const totalElements = frontElementsCount + backElementsCount;
    
    // Get element types for description
    const allElements = [...(card.front_elements || []), ...(card.back_elements || [])];
    const elementTypes = [...new Set(allElements.map(el => el.type))];
    
    if (elementTypes.length > 0) {
      const typeDescriptions = elementTypes.map(type => {
        switch(type) {
          case 'text': return 'text';
          case 'image': return 'image';
          case 'audio': return 'audio';
          case 'multiple-choice': return 'quiz';
          case 'youtube': return 'video';
          default: return type;
        }
      }).join(', ');
      
      return `${totalElements} elements: ${typeDescriptions}`;
    }
    
    return 'Text-based card';
  };

  const shuffleCards = useCallback(async () => {
    setIsShuffling(true);
    setShowShuffleDialog(false);
    
    // Add shuffle animation class to trigger CSS animations
    const cardElements = document.querySelectorAll('.card-shuffle');
    cardElements.forEach(el => el.classList.add('shuffling'));
    
    // Fisher-Yates shuffle algorithm
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Simulate shuffle animation with staggered updates
    await new Promise(resolve => setTimeout(resolve, 300));
    onReorderCards(shuffled);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    cardElements.forEach(el => el.classList.remove('shuffling'));
    setIsShuffling(false);
  }, [cards, onReorderCards]);

  const renderCard = (card: Flashcard, index: number) => {
    return (
      <div className="p-4 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2 line-clamp-3">{card.question}</h3>
          <p className="text-xs text-gray-400 mb-1">{getCardDescription(card)}</p>
          {card.card_type && card.card_type !== 'normal' && (
            <p className="text-xs text-blue-600 font-medium capitalize mb-1">
              {card.card_type.replace('-', ' ')}
            </p>
          )}
        </div>
        <div className="mt-auto">
          <p className="text-sm text-gray-500">Card {index + 1}</p>
          {card.answer && card.card_type !== 'single-sided' && (
            <p className="text-xs text-gray-400 line-clamp-2 mt-1">
              Answer: {card.answer.substring(0, 50)}{card.answer.length > 50 ? '...' : ''}
            </p>
          )}
        </div>
      </div>
    );
  };

  const handleCardClick = (cardIndex: number, event: React.MouseEvent) => {
    const cardId = cards[cardIndex].id;
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    } else if (event.shiftKey && selectedCards.length > 0) {
      // Range select with Shift
      const lastSelectedCardId = selectedCards[selectedCards.length - 1];
      const lastSelectedIndex = cards.findIndex(card => card.id === lastSelectedCardId);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, cardIndex);
        const end = Math.max(lastSelectedIndex, cardIndex);
        const rangeIds: string[] = [];
        
        // Get all card IDs in the range
        for (let i = start; i <= end; i++) {
          if (cards[i]) {
            rangeIds.push(cards[i].id);
          }
        }
        
        setSelectedCards(prev => {
          const newSelection = new Set([...prev, ...rangeIds]);
          return Array.from(newSelection);
        });
      }
    } else if (selectedCards.length > 0) {
      // Clear selection if clicking on unselected card, or edit if clicking on selected card
      if (selectedCards.includes(cardId)) {
        onEditCard(cardIndex);
      }
      setSelectedCards([]);
    } else {
      // Single click to edit
      onEditCard(cardIndex);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCard(index);
  };

  const handleDragLeave = () => {
    setDragOverCard(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedCard === null || draggedCard === dropIndex) {
      setDraggedCard(null);
      setDragOverCard(null);
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
    setDragOverCard(null);
  };

  const handleBulkUpdate = async (cardIds: string[], updates: any) => {
    console.log('Bulk updating cards:', cardIds, updates);
    
    if (updates.updateElements && updates.elementUpdates) {
      // Create a copy of cards to modify
      const updatedCards = cards.map(card => {
        if (!cardIds.includes(card.id)) return card;
        
        // Deep clone the card to avoid mutations
        const updatedCard = JSON.parse(JSON.stringify(card));
        
        // Update front elements with proper merging
        updatedCard.front_elements = updatedCard.front_elements.map((element: any) => {
          if (!updates.elementType || element.type === updates.elementType) {
            // Only update specified properties, preserve others
            const updatedElement = { ...element };
            Object.keys(updates.elementUpdates).forEach(key => {
              if (updates.elementUpdates[key] !== undefined && updates.elementUpdates[key] !== '') {
                updatedElement[key] = updates.elementUpdates[key];
              }
            });
            return updatedElement;
          }
          return element;
        });
        
        // Update back elements with proper merging
        updatedCard.back_elements = updatedCard.back_elements.map((element: any) => {
          if (!updates.elementType || element.type === updates.elementType) {
            // Only update specified properties, preserve others
            const updatedElement = { ...element };
            Object.keys(updates.elementUpdates).forEach(key => {
              if (updates.elementUpdates[key] !== undefined && updates.elementUpdates[key] !== '') {
                updatedElement[key] = updates.elementUpdates[key];
              }
            });
            return updatedElement;
          }
          return element;
        });
        
        return updatedCard;
      });
      
      // Trigger reorder to update the cards in the parent
      onReorderCards(updatedCards);
    } else {
      // Handle direct card property updates (only for properties that exist on Flashcard)
      const updatedCards = cards.map(card => {
        if (!cardIds.includes(card.id)) return card;
        
        // Create updated card with proper typing
        const updatedCard = { ...card };
        
        // Only update specific known properties that exist on the Flashcard type
        if (updates.question !== undefined) {
          updatedCard.question = updates.question;
        }
        if (updates.answer !== undefined) {
          updatedCard.answer = updates.answer;
        }
        if (updates.hint !== undefined) {
          updatedCard.hint = updates.hint;
        }
        
        return updatedCard;
      });
      
      onReorderCards(updatedCards);
    }
  };

  const handleAutoArrange = (cardIds: string[], arrangeType: string) => {
    const updatedCards = cards.map(card => {
      if (!cardIds.includes(card.id)) return card;
      
      // Deep clone the card
      const updatedCard = JSON.parse(JSON.stringify(card));
      
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
              element.x = 450 - (element.width || 200) / 2;
              element.y = 300 - (element.height || 100) / 2;
            });
            break;
          case 'stack':
            elements.forEach((element, index) => {
              element.x = 50;
              element.y = 50 + index * ((element.height || 100) + 20);
            });
            break;
          case 'justify':
            const spacing = 900 / (elements.length + 1);
            elements.forEach((element, index) => {
              element.x = spacing * (index + 1) - (element.width || 200) / 2;
              element.y = 100;
            });
            break;
        }
      };

      arrangeElements(updatedCard.front_elements);
      arrangeElements(updatedCard.back_elements);
      
      return updatedCard;
    });
    
    // Trigger reorder to update the cards in the parent
    onReorderCards(updatedCards);
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* CSS for shuffle animations */}
      <style>
        {`
          .shuffling {
            animation: shuffle 0.6s ease-in-out;
          }
          
          @keyframes shuffle {
            0% { transform: translateY(0) rotate(0deg) scale(1); }
            25% { transform: translateY(-10px) rotate(-5deg) scale(1.05); }
            50% { transform: translateY(-5px) rotate(5deg) scale(1.02); }
            75% { transform: translateY(-8px) rotate(-3deg) scale(1.03); }
            100% { transform: translateY(0) rotate(0deg) scale(1); }
          }
          
          .card-shuffle {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-shuffle:hover {
            z-index: 1000 !important;
          }
        `}
      </style>

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
            onClick={() => setShowShuffleDialog(true)}
            disabled={isShuffling}
            className="flex items-center gap-2"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            {isShuffling ? 'Shuffling...' : 'Shuffle'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 text-sm text-muted-foreground">
        Click to edit • Ctrl+Click to select multiple • Shift+Click to select range • Drag to reorder
      </div>

      {/* Cards Container - Grid View Only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const isSelected = selectedCards.includes(card.id);
          const isDragging = draggedCard === index;
          const isDragOver = dragOverCard === index;
          
          return (
            <div
              key={card.id}
              className={`card-shuffle relative rounded-lg border shadow-md transition-all duration-300 hover:shadow-xl cursor-pointer bg-white hover:scale-105 ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
              } ${isDragging ? 'opacity-50 scale-95' : ''} ${
                isDragOver ? 'ring-2 ring-green-400 ring-offset-2' : ''
              }`}
              style={{ width: '100%', height: '200px' }}
              onClick={(e) => handleCardClick(index, e)}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {renderCard(card, index)}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No cards to display</p>
        </div>
      )}

      {/* Shuffle Confirmation Dialog */}
      <Dialog open={showShuffleDialog} onOpenChange={setShowShuffleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Shuffle Cards?</DialogTitle>
            <DialogDescription>
              This will permanently reorder the cards in your deck. If you want temporary randomization, 
              use the randomize feature in study mode instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShuffleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={shuffleCards}>
              Permanently Shuffle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
