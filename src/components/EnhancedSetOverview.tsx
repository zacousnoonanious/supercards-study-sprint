
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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
    
    // Add physics-like effect
    const cardElement = e.currentTarget.closest('.card-container') as HTMLElement;
    if (cardElement) {
      cardElement.style.transition = 'none';
      cardElement.style.transform = 'rotate(3deg) scale(1.05)';
      cardElement.style.zIndex = '1000';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setIsDragging(false);
    setDragOverIndex(null);
    
    // Animate drop
    const cardElement = e.currentTarget.closest('.card-container') as HTMLElement;
    if (cardElement) {
      cardElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      cardElement.style.transform = 'none';
      cardElement.style.zIndex = 'auto';
      
      // Add bounce effect
      setTimeout(() => {
        cardElement.style.transform = 'scale(1.1)';
        setTimeout(() => {
          cardElement.style.transform = 'none';
        }, 150);
      }, 50);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
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
    setDragOverIndex(null);
    
    toast({
      title: "Card moved",
      description: `Card moved from position ${draggedIndex + 1} to ${dropIndex + 1}`,
    });
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
        <div 
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={`card-container transition-all duration-300 ${
                dragOverIndex === index ? 'transform scale-105' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardPreviewWithControls
                card={card}
                cardIndex={index}
                onClick={() => onNavigateToCard(index)}
                isDragging={draggedIndex === index}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onStudyFromCard={onStudyFromCard}
                onDeleteCard={onDeleteCard}
              />
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
