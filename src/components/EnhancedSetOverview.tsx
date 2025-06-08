
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { DraggableCardHeader } from './DraggableCardHeader';
import { EditableDeckTitle } from './EditableDeckTitle';
import { DeckGlobalSettings } from './DeckGlobalSettings';
import { CardTemplateSelector } from './CardTemplateSelector';
import { StudyCardRenderer } from './StudyCardRenderer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedSetOverviewProps {
  cards: Flashcard[];
  setId: string;
  onReorderCards: (reorderedCards: Flashcard[]) => void;
  onNavigateToCard: (cardIndex: number) => void;
  onBackToSet: () => void;
  onCreateCard: () => void;
  onCreateFromTemplate: (template: CardTemplate) => void;
  onSetDefaultTemplate: (template: CardTemplate) => void;
  onDeleteCard: (cardId: string) => void;
  onStudyFromCard: (cardIndex: number) => void;
  defaultTemplate?: CardTemplate;
  permanentShuffle: boolean;
  onPermanentShuffleChange: (enabled: boolean) => void;
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
  permanentShuffle,
  onPermanentShuffleChange
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [setTitle, setSetTitle] = useState('');
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5); // Default 50% zoom
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch set title
  useEffect(() => {
    const fetchSetTitle = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcard_sets')
          .select('title')
          .eq('id', setId)
          .single();

        if (error) throw error;
        setSetTitle(data.title);
      } catch (error) {
        console.error('Error fetching set title:', error);
      }
    };

    fetchSetTitle();
  }, [setId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onNavigateToCard(0);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onNavigateToCard(cards.length - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cards.length, onNavigateToCard]);

  const handleUpdateTitle = async (newTitle: string) => {
    try {
      const { error } = await supabase
        .from('flashcard_sets')
        .update({ title: newTitle })
        .eq('id', setId);

      if (error) throw error;
      setSetTitle(newTitle);
    } catch (error) {
      console.error('Error updating title:', error);
      throw error;
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);

    onReorderCards(newCards);
    setDraggedIndex(null);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click only
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = (e.clientX - lastMousePos.x) * 0.3; // Reduced sensitivity
    const deltaY = (e.clientY - lastMousePos.y) * 0.3; // Reduced sensitivity
    
    setPanPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBackToSet}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Set
              </Button>
              <EditableDeckTitle
                title={setTitle}
                onTitleUpdate={handleUpdateTitle}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2 min-w-[50px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <CardTemplateSelector
                onCreateCard={onCreateCard}
                onCreateFromTemplate={onCreateFromTemplate}
                onSetDefaultTemplate={onSetDefaultTemplate}
                defaultTemplate={defaultTemplate}
              />
            </div>
          </div>
        </div>
      </header>

      <main 
        className="overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ height: 'calc(100vh - 64px)' }}
        onMouseDown={handleMouseDown}
        ref={containerRef}
      >
        <div 
          className="p-8 grid gap-6 transition-transform"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            width: '100%',
            minHeight: '100%'
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`bg-white border-2 rounded-lg p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer select-none ${
                draggedIndex === index ? 'opacity-50 transform rotate-2' : ''
              }`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => onNavigateToCard(index)}
            >
              <DraggableCardHeader
                cardIndex={index}
                cardType={card.card_type || 'normal'}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
              />
              
              <div className="aspect-[4/3] bg-gray-50 rounded border overflow-hidden">
                <StudyCardRenderer
                  card={card}
                  showFront={true}
                  onAnswer={() => {}}
                  disabled={true}
                  zoom={1}
                />
              </div>
              
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Question: {card.question?.substring(0, 30)}...</span>
                <span>Answer: {card.answer?.substring(0, 30)}...</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showGlobalSettings && (
        <DeckGlobalSettings
          open={showGlobalSettings}
          onClose={() => setShowGlobalSettings(false)}
          settings={{
            shuffleEnabled: permanentShuffle,
            showHints: true,
            allowMultipleAttempts: true,
            studyMode: 'flashcard'
          }}
          onSettingsUpdate={(settings) => {
            if (settings.shuffleEnabled !== undefined) {
              onPermanentShuffleChange(settings.shuffleEnabled);
            }
          }}
        />
      )}
    </div>
  );
};
