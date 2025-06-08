
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Grid3X3, List } from 'lucide-react';
import { Flashcard } from '@/types/flashcard';

interface EditorCardOverviewProps {
  cards: Flashcard[];
  currentCardIndex: number;
  onReorderCards: (cards: Flashcard[]) => void;
  onNavigateToCard: (cardIndex: number) => void;
  onBackToEditor: () => void;
}

export const EditorCardOverview: React.FC<EditorCardOverviewProps> = ({
  cards,
  currentCardIndex,
  onReorderCards,
  onNavigateToCard,
  onBackToEditor,
}) => {
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOverCard, setDragOverCard] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getCardDescription = (card: Flashcard) => {
    const frontElementsCount = card.front_elements?.length || 0;
    const backElementsCount = card.back_elements?.length || 0;
    const totalElements = frontElementsCount + backElementsCount;
    
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

  const handleCardClick = (cardIndex: number, event: React.MouseEvent) => {
    event.preventDefault();
    onNavigateToCard(cardIndex);
    onBackToEditor();
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedCard(null);
    setDragOverCard(null);
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

  const renderCard = (card: Flashcard, index: number) => {
    const isCurrentCard = index === currentCardIndex;
    const isDragging = draggedCard === index;
    const isDragOver = dragOverCard === index;
    
    return (
      <div
        key={card.id}
        className={`card-item relative rounded-lg border shadow-sm transition-all duration-200 cursor-pointer bg-background ${
          isCurrentCard ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
        } ${isDragging ? 'opacity-50 scale-95 z-50' : ''} ${
          isDragOver ? 'ring-2 ring-blue-400 ring-offset-2 scale-105' : 'hover:shadow-md hover:scale-[1.02]'
        }`}
        style={{ 
          width: '100%', 
          height: viewMode === 'grid' ? '200px' : '120px',
        }}
        onClick={(e) => handleCardClick(index, e)}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, index)}
      >
        <div className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold line-clamp-2">{card.question}</h3>
              {isCurrentCard && (
                <Badge variant="secondary" className="text-xs">Current</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{getCardDescription(card)}</p>
            {card.card_type && card.card_type !== 'normal' && (
              <p className="text-xs text-primary font-medium capitalize mb-1">
                {card.card_type.replace('-', ' ')}
              </p>
            )}
          </div>
          <div className="mt-auto">
            <p className="text-sm text-muted-foreground">Card {index + 1}</p>
            {card.answer && card.card_type !== 'single-sided' && viewMode === 'grid' && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                Answer: {card.answer.substring(0, 50)}{card.answer.length > 50 ? '...' : ''}
              </p>
            )}
          </div>
        </div>
        
        {/* Drag indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-primary font-medium">Moving...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* CSS for soft animations */}
      <style>
        {`
          .card-item {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .card-item:not([draggable="true"]:active):hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
          }
          
          .card-item[draggable="true"]:active {
            transform: rotate(3deg) scale(0.95);
            z-index: 1000;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
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
          <Badge variant="secondary">{cards.length} cards</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-4 text-sm text-muted-foreground">
        Click any card to navigate to it • Drag cards to reorder them
      </div>

      {/* Cards Container */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        : "flex flex-col gap-3"
      }>
        {cards.map((card, index) => renderCard(card, index))}
      </div>

      {/* Empty State */}
      {cards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No cards to display</p>
        </div>
      )}
    </div>
  );
};
