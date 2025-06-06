import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Grid3x3, List, ArrowLeft, Shuffle, ZoomIn, ZoomOut, Edit } from 'lucide-react';
import { StudyCardRenderer } from '@/components/StudyCardRenderer';
import { Flashcard } from '@/types/flashcard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CardOverviewProps {
  cards: Flashcard[];
  onReorderCards: (reorderedCards: Flashcard[]) => void;
  onBackToEditor: () => void;
  onEditCard?: (cardIndex: number) => void;
}

type ViewMode = 'fan' | 'grid';

export const CardOverview: React.FC<CardOverviewProps> = ({
  cards,
  onReorderCards,
  onBackToEditor,
  onEditCard,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [dragOverCard, setDragOverCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [gridScale, setGridScale] = useState(1);
  const [shuffleDialogOpen, setShuffleDialogOpen] = useState(false);
  const [shufflePhase, setShufflePhase] = useState<'mixing' | 'settling' | 'complete'>('complete');
  const [mixingOffsets, setMixingOffsets] = useState<{[key: string]: {x: number, y: number, rotation: number, scale: number}}>({});

  const handleCardClick = (cardIndex: number, event: React.MouseEvent) => {
    // Prevent click during drag operations
    if (draggedCard || isShuffling) return;
    
    // Don't trigger on drag handles or when dragging
    if ((event.target as HTMLElement).closest('[draggable="true"]') && selectedCard) return;
    
    if (onEditCard) {
      onEditCard(cardIndex);
    }
  };

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

  const handleShuffle = () => {
    setIsShuffling(true);
    setShuffleDialogOpen(false);
    setShufflePhase('mixing');
    
    // Create a shuffled array first
    const shuffledCards = [...cards];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }
    
    // Start the mixing phase with continuous random movements
    const mixingInterval = setInterval(() => {
      const newMixingOffsets: {[key: string]: {x: number, y: number, rotation: number, scale: number}} = {};
      cards.forEach((card) => {
        newMixingOffsets[card.id] = {
          x: (Math.random() - 0.5) * 1000,
          y: (Math.random() - 0.5) * 600,
          rotation: (Math.random() - 0.5) * 720,
          scale: 0.7 + Math.random() * 0.6,
        };
      });
      setMixingOffsets(newMixingOffsets);
    }, 400);
    
    // After 3 seconds of mixing, start settling phase
    setTimeout(() => {
      clearInterval(mixingInterval);
      setShufflePhase('settling');
      setMixingOffsets({});
      
      // Update the card order during settling
      onReorderCards(shuffledCards);
      
      // Complete the animation after settling
      setTimeout(() => {
        setShufflePhase('complete');
        setIsShuffling(false);
      }, 1500);
    }, 3000);
  };

  const adjustGridScale = (direction: 'up' | 'down') => {
    setGridScale(prev => {
      if (direction === 'up') {
        return Math.min(prev + 0.25, 1.5);
      } else {
        return Math.max(prev - 0.25, 0.5);
      }
    });
  };

  const getGridColumns = () => {
    const baseColumns = {
      'grid-cols-1': true,
      'md:grid-cols-2': gridScale >= 1,
      'lg:grid-cols-3': gridScale >= 0.75,
      'xl:grid-cols-4': gridScale >= 0.75,
      'xl:grid-cols-5': gridScale <= 0.75,
      'xl:grid-cols-6': gridScale <= 0.5,
    };
    
    return Object.entries(baseColumns)
      .filter(([_, active]) => active)
      .map(([className]) => className)
      .join(' ');
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
            <AlertDialog open={shuffleDialogOpen} onOpenChange={setShuffleDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isShuffling}>
                  <Shuffle className="w-4 h-4 mr-2" />
                  Shuffle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Shuffle Cards?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently shuffle the card positions and cannot be reorganized automatically. 
                    If you want random cards shown every time while preserving original positions, 
                    use the deck's randomizer feature instead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleShuffle}>Shuffle Cards</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
              const angleFromCenter = (index - centerIndex) * 18;
              const radius = Math.min(500, totalCards * 25);
              
              const angleRad = (angleFromCenter * Math.PI) / 180;
              const x = Math.sin(angleRad) * radius;
              const y = Math.cos(angleRad) * (radius * 0.3);
              
              const isHovered = hoveredCard === card.id;
              const isDragged = draggedCard === card.id;
              const isDragOver = dragOverCard === card.id;
              const isSelected = selectedCard === card.id;
              
              let repositionOffset = 0;
              if (draggedCard && dragOverCard && draggedCard !== card.id) {
                const draggedIndex = cards.findIndex(c => c.id === draggedCard);
                const dragOverIndex = cards.findIndex(c => c.id === dragOverCard);
                const currentIndex = index;
                
                if (draggedIndex < dragOverIndex && currentIndex > draggedIndex && currentIndex <= dragOverIndex) {
                  repositionOffset = -20;
                } else if (draggedIndex > dragOverIndex && currentIndex >= dragOverIndex && currentIndex < draggedIndex) {
                  repositionOffset = 20;
                }
              }

              const mixingOffset = mixingOffsets[card.id];
              
              // Calculate transforms based on shuffle phase
              let transform = '';
              let transition = '';
              
              if (shufflePhase === 'mixing' && mixingOffset) {
                transform = `translate(${mixingOffset.x}px, ${mixingOffset.y}px) rotate(${mixingOffset.rotation}deg) scale(${mixingOffset.scale})`;
                transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
              } else if (shufflePhase === 'settling') {
                transform = `translate(${x + repositionOffset}px, ${y + (isHovered && !isDragged ? -40 : isDragged ? -20 : 0)}px) rotate(${angleFromCenter + (isDragged ? 12 : 0)}deg)`;
                transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
              } else {
                transform = isDragged 
                  ? `translate(${x + repositionOffset}px, ${y - 20}px) rotate(${angleFromCenter + 12}deg) scale(1.1)`
                  : `translate(${x + repositionOffset}px, ${y + (isHovered ? -40 : 0)}px) rotate(${angleFromCenter}deg)`;
                transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
              }
              
              return (
                <div
                  key={card.id}
                  className={`absolute cursor-pointer group ${
                    isDragged ? 'opacity-60 z-50' : ''
                  } ${isHovered && !isDragged ? 'scale-105 z-20' : ''} ${
                    isDragOver && !isDragged ? 'scale-105' : ''
                  } ${isSelected && !isDragged ? 'animate-pulse' : ''}`}
                  style={{
                    transform,
                    transition,
                    zIndex: isDragged ? 50 : isHovered ? 20 : 10 + index,
                  }}
                  draggable={!isShuffling}
                  onDragStart={(e) => !isShuffling && handleDragStart(e, card.id)}
                  onDragOver={(e) => !isShuffling && handleDragOver(e, card.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => !isShuffling && handleDrop(e, card.id)}
                  onDragEnd={handleDragEnd}
                  onMouseEnter={() => !isShuffling && setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={(e) => handleCardClick(index, e)}
                >
                  <Card className={`w-72 h-44 shadow-lg border-2 transition-all duration-300 ${
                    isDragged ? 'shadow-2xl border-primary/60 bg-primary/5' : 
                    isDragOver ? 'shadow-xl border-primary/40 bg-primary/10' :
                    isHovered ? 'shadow-xl border-primary/30' : 'hover:shadow-xl hover:border-primary/20'
                  }`}>
                    <CardContent className="p-3 h-full relative">
                      {/* Edit overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Edit className="w-3 h-3" />
                          Click to Edit
                        </div>
                      </div>
                      
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
                  
                  {isDragOver && draggedCard && draggedCard !== card.id && !isShuffling && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-8 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
          
          {draggedCard && !isShuffling && (
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary/30 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="text-primary/60 text-lg font-medium">
                Drop to reposition card
              </div>
            </div>
          )}

          {isShuffling && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
              <div className="text-white text-2xl font-bold animate-pulse">
                {shufflePhase === 'mixing' ? 'Mixing cards...' : 'Cards settling into position...'}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          {isShuffling 
            ? shufflePhase === 'mixing' ? "Cards are being mixed..." : "Cards are settling back into formation..."
            : "Hover over cards to lift them up • Drag and drop to reorder • Cards spread out for better visibility"
          }
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
          <AlertDialog open={shuffleDialogOpen} onOpenChange={setShuffleDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isShuffling}>
                <Shuffle className="w-4 h-4 mr-2" />
                Shuffle
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Shuffle Cards?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently shuffle the card positions and cannot be reorganized automatically. 
                  If you want random cards shown every time while preserving original positions, 
                  use the deck's randomizer feature instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleShuffle}>Shuffle Cards</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustGridScale('down')}
              disabled={gridScale <= 0.5}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <span className="text-xs px-2 text-gray-600">
              {Math.round(gridScale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => adjustGridScale('up')}
              disabled={gridScale >= 1.5}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
          </div>
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

      <div className={`grid gap-6 ${getGridColumns()}`}>
        {cards.map((card, index) => {
          const isDragged = draggedCard === card.id;
          const isDragOver = dragOverCard === card.id;
          
          const cardHeight = `${Math.round(256 * gridScale)}px`;
          const mixingOffset = mixingOffsets[card.id];
          
          // Calculate transforms based on shuffle phase
          let transform = '';
          let transition = '';
          
          if (shufflePhase === 'mixing' && mixingOffset) {
            transform = `translate(${mixingOffset.x}px, ${mixingOffset.y}px) rotate(${mixingOffset.rotation}deg) scale(${mixingOffset.scale})`;
            transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          } else if (shufflePhase === 'settling') {
            transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
            transition = 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
          } else {
            if (isDragged) {
              transform = 'scale(0.95) rotate(3deg)';
            } else if (isDragOver) {
              transform = 'scale(1.05) translateX(10px)';
            }
            transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          }
          
          return (
            <div
              key={card.id}
              className={`cursor-pointer group ${
                isDragged 
                  ? 'opacity-30 z-50' 
                  : 'hover:scale-105 hover:-translate-y-2 hover:shadow-lg'
              } ${
                isDragOver && !isDragged 
                  ? 'scale-105 shadow-lg ring-2 ring-primary/50' 
                  : ''
              }`}
              style={{
                transform,
                transition,
                height: cardHeight,
              }}
              draggable={!isShuffling}
              onDragStart={(e) => !isShuffling && handleDragStart(e, card.id)}
              onDragOver={(e) => !isShuffling && handleDragOver(e, card.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => !isShuffling && handleDrop(e, card.id)}
              onDragEnd={handleDragEnd}
              onClick={(e) => handleCardClick(index, e)}
            >
              <Card className={`h-full shadow-md border-2 transition-all duration-300 relative ${
                isDragOver && !isDragged 
                  ? 'border-primary/50 shadow-xl' 
                  : 'hover:border-primary/30'
              }`}>
                {/* Edit overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
                  <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Edit className="w-3 h-3" />
                    Click to Edit
                  </div>
                </div>
                
                <CardContent className="p-4 h-full flex flex-col" style={{ transform: `scale(${gridScale})`, transformOrigin: 'top left' }}>
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
        {isShuffling 
          ? shufflePhase === 'mixing' ? "Cards are being mixed..." : "Cards are settling back into their positions..."
          : "Drag and drop cards to reorder them • Hover for preview • Use zoom controls to adjust card size"
        }
      </div>
    </div>
  );
};
