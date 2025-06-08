
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, ZoomIn, ZoomOut, Grid, List, Shuffle, Search, Filter, MoreHorizontal } from 'lucide-react';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { EnhancedCardButton } from './EnhancedCardButton';
import { CardCanvas } from './CardCanvas';
import { ElementContextMenu } from './ElementContextMenu';
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
  defaultTemplate?: CardTemplate;
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
  defaultTemplate,
}) => {
  const [draggedCard, setDraggedCard] = useState<number | null>(null);
  const [dragOverCard, setDragOverCard] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [scale, setScale] = useState([1]);
  const [cardsPerRow, setCardsPerRow] = useState([4]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
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

  const handleContextMenuAction = (action: string, cardId: string) => {
    console.log(`Action: ${action} on card: ${cardId}`);
    // TODO: Implement AI features and conversions
    switch (action) {
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

  const getCardPreview = (card: Flashcard) => {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <div className="absolute inset-0 scale-50 origin-top-left">
          <CardCanvas
            elements={card.front_elements}
            width={card.canvas_width || 600}
            height={card.canvas_height || 450}
            selectedElement={null}
            onElementSelect={() => {}}
            onElementUpdate={() => {}}
            isStudyMode={true}
            textScale={0.5}
            onElementDragStart={() => {}}
            backgroundStyle="solid"
            backgroundColor="#ffffff"
            isDrawingMode={false}
            onDrawingComplete={() => {}}
          />
        </div>
      </div>
    );
  };

  const cardTypes = ['all', 'normal', 'simple', 'informational', 'single-sided', 'quiz-only'];

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-card rounded-lg border">
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
          <label className="text-sm font-medium">Scale: {scale[0].toFixed(1)}x</label>
          <Slider
            value={scale}
            onValueChange={setScale}
            min={0.5}
            max={2}
            step={0.1}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Cards per Row: {cardsPerRow[0]}</label>
          <Slider
            value={cardsPerRow}
            onValueChange={setCardsPerRow}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
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

      {/* Cards Grid */}
      <div 
        className={viewMode === 'grid' 
          ? `grid gap-4`
          : "flex flex-col gap-3"
        }
        style={{
          gridTemplateColumns: viewMode === 'grid' ? `repeat(${cardsPerRow[0]}, 1fr)` : undefined
        }}
      >
        {filteredCards.map((card, index) => {
          const isSelected = selectedCards.includes(card.id);
          const isDragging = draggedCard === index;
          const isDragOver = dragOverCard === index;
          const cardScale = scale[0];
          
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
                    width: '100%', 
                    height: viewMode === 'grid' ? `${200 * cardScale}px` : `${120 * cardScale}px`,
                    transform: `scale(${cardScale})`,
                    transformOrigin: 'top left',
                    marginBottom: viewMode === 'grid' ? `${(cardScale - 1) * 200}px` : `${(cardScale - 1) * 120}px`,
                    marginRight: viewMode === 'grid' ? `${(cardScale - 1) * 100}px` : '0'
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
    </div>
  );
};
