import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ZoomIn, ZoomOut, Grid, List, Shuffle, Search, Filter, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { EnhancedCardButton } from './EnhancedCardButton';
import { StudyCardRenderer } from './StudyCardRenderer';
import { ElementContextMenu } from './ElementContextMenu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface EnhancedSetOverviewProps {
  cards: Flashcard[];
  setId: string;
  onReorderCards: (cards: Flashcard[]) => void;
  onNavigateToCard: (cardIndex: number) => void;
  onBackToSet: () => void;
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  onDeleteCard: (cardId: string) => void;
  onStudyFromCard?: (cardIndex: number) => void;
  defaultTemplate?: CardTemplate;
  permanentShuffle?: boolean;
  onPermanentShuffleChange?: (enabled: boolean) => void;
}

export const EnhancedSetOverview: React.FC<EnhancedSetOverviewProps> = ({
  cards,
  setId,
  onReorderCards,
  onNavigateToCard,
  onBackToSet,
  onCreateCard,
  onCreateFromTemplate,
  onSetDefaultTemplate,
  onDeleteCard,
  onStudyFromCard,
  defaultTemplate,
  permanentShuffle = false,
  onPermanentShuffleChange,
}) => {
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOverCard, setDragOverCard] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scale, setScale] = useState([0.8]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showShuffleWarning, setShowShuffleWarning] = useState(false);
  const [cardZoom, setCardZoom] = useState<{[cardId: string]: { scale: number; x: number; y: number }}>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and search cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || card.card_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleCardClick = (cardIndex: number, event: React.MouseEvent) => {
    const cardId = cards[cardIndex].id;
    
    if (event.ctrlKey || event.metaKey) {
      setSelectedCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    } else if (event.shiftKey && selectedCards.length > 0) {
      const lastSelectedCardId = selectedCards[selectedCards.length - 1];
      const lastSelectedIndex = cards.findIndex(card => card.id === lastSelectedCardId);
      
      if (lastSelectedIndex !== -1) {
        const start = Math.min(lastSelectedIndex, cardIndex);
        const end = Math.max(lastSelectedIndex, cardIndex);
        const rangeIds: string[] = [];
        
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
    } else {
      setSelectedCards([]);
      onNavigateToCard(cardIndex);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedCard(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragEnd = () => {
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
    
    newCards.splice(draggedCard, 1);
    const insertIndex = draggedCard < dropIndex ? dropIndex - 1 : dropIndex;
    newCards.splice(insertIndex, 0, draggedItem);
    
    onReorderCards(newCards);
    setDraggedCard(null);
    setDragOverCard(null);
  };

  const shuffleCards = useCallback(() => {
    const shuffled = [...cards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    onReorderCards(shuffled);
  }, [cards, onReorderCards]);

  const handleContextMenuAction = (action: string, cardId: string, cardIndex?: number) => {
    console.log(`Action: ${action} on card: ${cardId}`);
    switch (action) {
      case 'study-from-here':
        if (onStudyFromCard && typeof cardIndex === 'number') {
          onStudyFromCard(cardIndex);
        }
        break;
      case 'convert-to-quiz':
        // Convert to quiz card
        break;
      case 'convert-to-text':
        // Convert to simple text card
        break;
      case 'ai-summarize':
        // AI summarize content
        break;
      case 'translate':
        // AI translate content
        break;
      case 'enhance':
        // AI enhance content
        break;
      case 'generate-examples':
        // Generate examples
        break;
      case 'duplicate':
        // Duplicate card
        break;
      case 'delete':
        onDeleteCard(cardId);
        break;
    }
  };

  const handleCardZoom = (cardId: string, delta: number, event: React.WheelEvent) => {
    event.preventDefault();
    setCardZoom(prev => {
      const current = prev[cardId] || { scale: 1, x: 0, y: 0 };
      const newScale = Math.max(0.5, Math.min(3, current.scale + delta * 0.1));
      return {
        ...prev,
        [cardId]: { ...current, scale: newScale }
      };
    });
  };

  const handleCardPan = (cardId: string, deltaX: number, deltaY: number) => {
    setCardZoom(prev => {
      const current = prev[cardId] || { scale: 1, x: 0, y: 0 };
      return {
        ...prev,
        [cardId]: { 
          ...current, 
          x: current.x + deltaX,
          y: current.y + deltaY
        }
      };
    });
  };

  const getCardPreview = (card: Flashcard) => {
    const cardWidth = card.canvas_width || 600;
    const cardHeight = card.canvas_height || 450;
    const zoom = cardZoom[card.id] || { scale: 1, x: 0, y: 0 };
    
    // Standard card display size
    const displayWidth = 280;
    const displayHeight = 200;
    
    return (
      <div 
        className="w-full h-full relative overflow-hidden bg-white rounded border cursor-grab active:cursor-grabbing"
        style={{ width: displayWidth, height: displayHeight }}
        onWheel={(e) => handleCardZoom(card.id, e.deltaY > 0 ? -1 : 1, e)}
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startY = e.clientY;
          
          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;
            handleCardPan(card.id, deltaX * 0.5, deltaY * 0.5);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      >
        <div 
          className="absolute"
          style={{ 
            width: `${cardWidth}px`,
            height: `${cardHeight}px`,
            transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale * scale[0]})`,
            transformOrigin: 'top left'
          }}
        >
          <StudyCardRenderer
            elements={card.front_elements}
            textScale={1}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            className="w-full h-full pointer-events-none"
          />
        </div>
        <div className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 rounded">
          {Math.round(zoom.scale * 100)}%
        </div>
      </div>
    );
  };

  const cardTypes = ['all', 'normal', 'simple', 'informational', 'single-sided', 'quiz-only'];

  const handlePermanentShuffleToggle = () => {
    if (permanentShuffle) {
      // If disabling, no warning needed
      onPermanentShuffleChange?.(false);
    } else {
      // If enabling, show warning
      setShowShuffleWarning(true);
    }
  };

  const confirmPermanentShuffle = () => {
    onPermanentShuffleChange?.(true);
    setShowShuffleWarning(false);
  };

  return (
    <div className="min-h-screen bg-background p-6" ref={containerRef}>
      <style>
        {`
          .card-item {
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
          }
          
          .card-item:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
          }
          
          .card-item.dragging {
            transform: rotate(3deg) scale(0.95);
            z-index: 1000;
            box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.3);
          }
          
          .card-item.drag-over {
            transform: scale(1.05);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
          }
        `}
      </style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBackToSet}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Set
          </Button>
          <h1 className="text-2xl font-bold">Enhanced Card Overview</h1>
          <Badge variant="secondary">{filteredCards.length} of {cards.length} cards</Badge>
          {selectedCards.length > 0 && (
            <Badge variant="default">{selectedCards.length} selected</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <EnhancedCardButton
            onCreateCard={onCreateCard}
            onCreateFromTemplate={onCreateFromTemplate}
            onSetDefaultTemplate={onSetDefaultTemplate}
            defaultTemplate={defaultTemplate}
          />
          
          <Button variant="outline" size="sm" onClick={shuffleCards}>
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button 
            variant={permanentShuffle ? "default" : "outline"} 
            size="sm" 
            onClick={handlePermanentShuffleToggle}
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Auto-Shuffle
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCards([])}>
                Clear Selection
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Export Selected</DropdownMenuItem>
              <DropdownMenuItem>Bulk Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-card rounded-lg border">
        <div className="space-y-2">
          <label className="text-sm font-medium">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Filter by Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            {cardTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Preview Scale: {scale[0].toFixed(1)}x</label>
          <Slider
            value={scale}
            onValueChange={setScale}
            min={0.3}
            max={1.2}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">Use mouse wheel on cards to zoom, drag to pan</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Click to edit • Ctrl+Click to select • Drag to reorder • Right-click for options
        </div>
      </div>

      {/* Cards Grid - Responsive */}
      <div 
        className={viewMode === 'grid' 
          ? "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
          : "flex flex-col gap-3"
        }
      >
        {filteredCards.map((card, index) => {
          const isSelected = selectedCards.includes(card.id);
          const isDragging = draggedCard === index;
          const isDragOver = dragOverCard === index;
          
          return (
            <ContextMenu key={card.id}>
              <ContextMenuTrigger asChild>
                <div
                  className={`card-item relative rounded-lg border shadow-sm cursor-pointer bg-card ${
                    isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                  } ${isDragging ? 'dragging opacity-50' : ''} ${
                    isDragOver ? 'drag-over' : ''
                  }`}
                  style={{ 
                    height: viewMode === 'grid' ? '300px' : '150px'
                  }}
                  onClick={(e) => handleCardClick(index, e)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        Card {index + 1}
                      </Badge>
                      {card.card_type !== 'normal' && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {card.card_type.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                    
                    {viewMode === 'grid' && (
                      <div className="flex-1 mb-2 bg-muted rounded overflow-hidden">
                        {getCardPreview(card)}
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium line-clamp-2">{card.question}</h3>
                      {viewMode === 'list' && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {card.answer}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-64">
                <ContextMenuItem onClick={() => onNavigateToCard(index)}>
                  Edit in Visual Editor
                </ContextMenuItem>
                {onStudyFromCard && (
                  <ContextMenuItem onClick={() => handleContextMenuAction('study-from-here', card.id, index)}>
                    Study from Here
                  </ContextMenuItem>
                )}
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>Convert To</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => handleContextMenuAction('convert-to-quiz', card.id)}>
                      Quiz Card
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleContextMenuAction('convert-to-text', card.id)}>
                      Simple Text Card
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>AI Features</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onClick={() => handleContextMenuAction('ai-summarize', card.id)}>
                      Summarize Content
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleContextMenuAction('translate', card.id)}>
                      Translate
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleContextMenuAction('enhance', card.id)}>
                      Enhance Content
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleContextMenuAction('generate-examples', card.id)}>
                      Generate Examples
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={() => handleContextMenuAction('duplicate', card.id)}>
                  Duplicate Card
                </ContextMenuItem>
                <ContextMenuItem 
                  onClick={() => handleContextMenuAction('delete', card.id)}
                  className="text-destructive"
                >
                  Delete Card
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No cards match your search criteria</p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Permanent Shuffle Warning Dialog */}
      <AlertDialog open={showShuffleWarning} onOpenChange={setShowShuffleWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Enable Permanent Shuffle?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will automatically shuffle the cards every time someone studies this deck. 
              Students and other users won't be able to study the cards in their original order.
              <br /><br />
              Are you sure you want to enable this setting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPermanentShuffle}>
              Enable Auto-Shuffle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
