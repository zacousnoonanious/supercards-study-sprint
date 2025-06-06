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

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCard(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    
    if (!draggedCard || draggedCard === targetCardId) {
      setDraggedCard(null);
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
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
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
              variant={viewMode === 'fan' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('fan')}
            >
              Fan View
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4 mr-2" />
              Grid View
            </Button>
          </div>
        </div>

        <div className="relative w-full h-[600px] overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {cards.map((card, index) => {
              const totalCards = cards.length;
              const angle = (index - (totalCards - 1) / 2) * 8; // 8 degrees between cards
              const offset = Math.abs(index - (totalCards - 1) / 2) * 20;
              
              return (
                <div
                  key={card.id}
                  className={`absolute cursor-move transition-transform duration-300 hover:scale-105 hover:z-10 ${
                    draggedCard === card.id ? 'opacity-50' : ''
                  }`}
                  style={{
                    transform: `rotate(${angle}deg) translateY(${offset}px)`,
                    zIndex: index,
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, card.id)}
                  onDragEnd={handleDragEnd}
                >
                  <Card className="w-80 h-48 shadow-lg border-2">
                    <CardContent className="p-4 h-full">
                      <div className="text-sm font-medium mb-2">Card {index + 1}</div>
                      <div className="text-xs text-gray-600 mb-2">
                        Type: {card.card_type || 'standard'}
                      </div>
                      <div className="h-32 overflow-hidden">
                        <StudyCardRenderer
                          elements={card.front_elements}
                          className="scale-50 origin-top-left"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          Drag and drop cards to reorder them
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
            variant={viewMode === 'fan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('fan')}
          >
            Fan View
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grid View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`cursor-move transition-transform duration-200 hover:scale-105 ${
              draggedCard === card.id ? 'opacity-50' : ''
            }`}
            draggable
            onDragStart={(e) => handleDragStart(e, card.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, card.id)}
            onDragEnd={handleDragEnd}
          >
            <Card className="h-64 shadow-md border-2 hover:border-primary/50">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">Card {index + 1}</div>
                  <div className="text-xs text-gray-500">
                    {card.card_type || 'standard'}
                  </div>
                </div>
                
                <div className="flex-1 overflow-hidden border rounded p-2">
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
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center text-gray-500 mt-12">
          <p>No cards to display</p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600">
        Drag and drop cards to reorder them
      </div>
    </div>
  );
};
