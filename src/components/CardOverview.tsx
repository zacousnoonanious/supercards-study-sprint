import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, ArrowLeft } from 'lucide-react';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { Flashcard } from '@/types/flashcard';

interface CardOverviewProps {
  cards: Flashcard[];
  onReorderCards: (reorderedCards: Flashcard[]) => void;
  onBackToEditor: () => void;
}

type ViewMode = 'fan' | 'grid';

export const CardOverview: React.FC<CardOverviewProps> = ({
  cards,
  onReorderCards,
  onBackToEditor,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    setSelectedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCard(cardId);
  };

  const handleDragLeave = () => {
    setDragOverCard(null);
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard === targetCardId) {
      setDraggedCard(null);
      setDragOverCard(null);
      setSelectedCard(null);
      return;
    }

    const draggedIndex = cards.findIndex(card => card.id === draggedCard);
    const targetIndex = cards.findIndex(card => card.id === targetCardId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newCards = [...cards];
    const [draggedCardObj] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, draggedCardObj);

    onReorderCards(newCards);
    setDraggedCard(null);
    setDragOverCard(null);
    setSelectedCard(null);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCard(null);
    setSelectedCard(null);
  };

  if (viewMode === 'fan') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBackToEditor}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Editor
            </Button>
            <h2 className="text-2xl font-bold">Card Overview</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setViewMode('fan')}
            >
              Fan View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Grid View
            </Button>
          </div>
        </div>

        <div className="relative w-full h-[700px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {cards.map((card, index) => {
              const totalCards = cards.length;
              const centerIndex = (totalCards - 1) / 2;
              const angleFromCenter = (index - centerIndex) * 12; // Increased from 6 to 12 degrees for better spread
              const radius = Math.min(500, totalCards * 20); // Increased radius for better spread
              
              // Calculate position in arc
              const angleRad = (angleFromCenter * Math.PI) / 180;
              const x = Math.sin(angleRad) * radius;
              const y = Math.cos(angleRad) * (radius * 0.2); // Flattened the arc more
              
              const isHovered = hoveredCard === card.id;
              const isDragged = draggedCard === card.id;
              const isDragOver = dragOverCard === card.id;
              const isSelected = selectedCard === card.id;
              
              // Calculate repositioning effect for other cards when dragging
              let repositionOffset = 0;
              if (draggedCard && dragOverCard && draggedCard !== card.id) {
                const draggedIndex = cards.findIndex(c => c.id === draggedCard);
                const dragOverIndex = cards.findIndex(c => c.id === dragOverCard);
                const currentIndex = index;
                
                // Shift cards to show where the dragged card will be inserted
                if (draggedIndex < dragOverIndex && currentIndex > draggedIndex && currentIndex <= dragOverIndex) {
                  repositionOffset = -15; // Move left
                } else if (draggedIndex > dragOverIndex && currentIndex >= dragOverIndex && currentIndex < draggedIndex) {
                  repositionOffset = 15; // Move right
                }
              }
              
              return (
                <div
                  key={card.id}
                  className={`absolute cursor-move transition-all duration-300 ${
                    isDragged ? 'opacity-60 scale-110 z-50 rotate-12' : ''
                  } ${isHovered && !isDragged ? 'scale-105 z-20' : ''} ${
                    isDragOver && !isDragged ? 'scale-105' : ''
                  } ${isSelected && !isDragged ? 'animate-pulse' : ''}`}
                  style={{
                    transform: `translate(${x + repositionOffset}px, ${y + (isHovered && !isDragged ? -40 : isDragged ? -20 : 0)}px) rotate(${angleFromCenter + (isDragged ? 12 : 0)}deg)`,
                    zIndex: isDragged ? 50 : isHovered ? 20 : 10 + index,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onDragOver={(e) => handleDragOver(e, card.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, card.id)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card className={`w-72 h-44 shadow-lg border-2 transition-all duration-300 ${
                    isDragged ? 'shadow-2xl border-primary/60 bg-primary/5' : 
                    isDragOver ? 'shadow-xl border-primary/40 bg-primary/10' :
                    isHovered ? 'shadow-xl border-primary/30' : 'hover:shadow-xl'
                  }`}>
                    <CardContent className="p-3 h-full">
                      <div className="text-xs font-medium mb-1 text-gray-700">Card {index + 1}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        Type: {card.card_type || 'standard'}
                      </div>
                      <div className="h-28 overflow-hidden bg-white rounded border">
                        <StudyCardRenderer
                          elements={card.front_elements}
                          className="scale-[0.4] origin-top-left transform"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Drop indicator */}
                  {isDragOver && draggedCard && draggedCard !== card.id && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Background drop zone indicator */}
          {draggedCard && (
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-primary/60 text-lg font-medium">
                Drop to reposition card
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          Hover over cards to lift them up • Drag and drop to reorder • Cards spread out for better visibility
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBackToEditor}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Editor
          </Button>
          <h2 className="text-2xl font-bold">Card Overview</h2>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('fan')}
          >
            Fan View
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grid View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const isDragged = draggedCard === card.id;
          const isDragOver = dragOverCard === card.id;
          
          return (
            <div
              key={card.id}
              className={`cursor-move transition-all duration-300 ease-out ${
                isDragged 
                  ? 'opacity-30 scale-95 rotate-3 z-50' 
                  : 'hover:scale-105 hover:-translate-y-2 hover:shadow-lg'
              } ${
                isDragOver && !isDragged 
                  ? 'scale-105 shadow-lg ring-2 ring-primary/50' 
                  : ''
              }`}
              style={{
                transform: isDragOver && !isDragged 
                  ? 'scale(1.05) translateX(10px)' 
                  : undefined,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, card.id)}
              onDragOver={(e) => handleDragOver(e, card.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, card.id)}
              onDragEnd={handleDragEnd}
            >
              <Card className={`h-64 shadow-md border-2 transition-all duration-300 ${
                isDragOver && !isDragged 
                  ? 'border-primary/50 shadow-xl' 
                  : 'hover:border-primary/30'
              }`}>
                <CardContent className="p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Card {index + 1}</div>
                    <div className="text-xs text-gray-500">
                      {card.card_type || 'standard'}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-hidden border rounded p-2 bg-gray-50">
                    <StudyCardRenderer
                      elements={card.front_elements}
                      className="scale-75 origin-top-left"
                    />
                  </div>
                  
                  {card.countdown_timer && card.countdown_timer > 0 && (
                    <div className="text-xs text-blue-600 mt-2">
                      Timer: {card.countdown_timer}s → {card.countdown_behavior === 'flip' ? 'Flip' : 'Next'}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {cards.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p>No cards to display</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600">
        Drag and drop cards to reorder them • Hover for preview
      </div>
    </div>
  );
};
