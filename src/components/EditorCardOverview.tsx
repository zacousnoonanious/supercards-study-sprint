
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
    
    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
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
        className={`card-item relative rounded-lg border shadow-md transition-all duration-300 cursor-pointer bg-background hover:shadow-xl hover:scale-105 ${
          isCurrentCard ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
        } ${isDragging ? 'opacity-50 scale-95 rotate-2' : ''} ${
          isDragOver ? 'ring-2 ring-blue-400 ring-offset-2 transform scale-105' : ''
        }`}
        style={{ 
          width: '100%', 
          height: viewMode === 'grid' ? '200px' : '120px',
          transform: isDragOver ? 'translateY(-4px)' : undefined,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
        {draggedCard === index && (
          <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
            <div className="text-primary font-medium">Moving...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* CSS for animations */}
      <style>
        {`
          .card-item {
            animation: card-enter 0.3s ease-out;
          }
          
          @keyframes card-enter {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .card-item:hover {
            animation: card-hover 0.2s ease-out forwards;
          }
          
          @keyframes card-hover {
            to {
              transform: translateY(-4px) scale(1.02);
            }
          }
          
          .card-inserting {
            animation: card-insert 0.4s ease-out;
          }
          
          @keyframes card-insert {
            0% {
              background-color: rgb(59 130 246 / 0.1);
              transform: scale(1.05);
            }
            50% {
              background-color: rgb(59 130 246 / 0.2);
              transform: scale(1.08);
            }
            100% {
              background-color: transparent;
              transform: scale(1);
            }
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
