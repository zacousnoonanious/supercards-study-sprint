
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Flashcard, CardTemplate } from '@/types/flashcard';
import { DraggableCardHeader } from './DraggableCardHeader';
import { EditableDeckTitle } from './EditableDeckTitle';
import { DeckGlobalSettings } from './DeckGlobalSettings';
import { CardTemplateSelector } from './CardTemplateSelector';
import { CardPreviewWithControls } from './CardPreviewWithControls';
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
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();

  // Calculate pagination
  const totalCards = cards.length;
  const showAll = itemsPerPage === -1;
  const totalPages = showAll ? 1 : Math.ceil(totalCards / itemsPerPage);
  const startIndex = showAll ? 0 : (currentPage - 1) * itemsPerPage;
  const endIndex = showAll ? totalCards : Math.min(startIndex + itemsPerPage, totalCards);
  const displayedCards = cards.slice(startIndex, endIndex);

  // Reset to first page when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

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
    const actualIndex = startIndex + index;
    setDraggedIndex(actualIndex);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const actualIndex = startIndex + index;
    setDragOverIndex(actualIndex);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const actualDropIndex = startIndex + dropIndex;
    
    if (draggedIndex === null || draggedIndex === actualDropIndex) return;

    const newCards = [...cards];
    const draggedCard = newCards[draggedIndex];
    newCards.splice(draggedIndex, 1);
    newCards.splice(actualDropIndex, 0, draggedCard);

    onReorderCards(newCards);
    setDraggedIndex(null);
    setIsDragging(false);
    setDragOverIndex(null);
    
    toast({
      title: "Card moved",
      description: `Card moved from position ${draggedIndex + 1} to ${actualDropIndex + 1}`,
    });
  };

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = value === 'all' ? -1 : parseInt(value);
    setItemsPerPage(newItemsPerPage);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
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

      <main className="p-8">
        {/* Pagination Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Cards per page:</span>
              <Select value={itemsPerPage === -1 ? 'all' : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="all">ALL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{endIndex} of {totalCards} cards
            </div>
          </div>

          {!showAll && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        <div 
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          }}
        >
          {displayedCards.map((card, displayIndex) => {
            const actualIndex = startIndex + displayIndex;
            return (
              <div
                key={card.id}
                className={`card-container transition-all duration-300 ${
                  dragOverIndex === actualIndex ? 'transform scale-105' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, displayIndex)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, displayIndex)}
              >
                <div className="h-full">
                  <CardPreviewWithControls
                    card={card}
                    cardIndex={actualIndex}
                    onClick={() => onNavigateToCard(actualIndex)}
                    isDragging={draggedIndex === actualIndex}
                    onDragStart={(e) => handleDragStart(e, displayIndex)}
                    onDragEnd={handleDragEnd}
                    onStudyFromCard={onStudyFromCard}
                    onDeleteCard={onDeleteCard}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Pagination Controls */}
        {!showAll && totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
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
