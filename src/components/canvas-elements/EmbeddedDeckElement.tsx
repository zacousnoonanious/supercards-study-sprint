
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface EmbeddedDeckElementProps {
  deckId: string;
  title?: string;
  cardCount?: number;
  onLaunchDeck: (deckId: string) => void;
  isStudyMode?: boolean;
  textScale?: number;
}

export const EmbeddedDeckElement: React.FC<EmbeddedDeckElementProps> = ({
  deckId,
  title,
  cardCount,
  onLaunchDeck,
  isStudyMode = false,
  textScale = 1,
}) => {
  const { user } = useAuth();
  const [deckInfo, setDeckInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeckInfo = async () => {
      if (!deckId || !user) return;

      try {
        const { data: set, error } = await supabase
          .from('flashcard_sets')
          .select('id, title, description')
          .eq('id', deckId)
          .single();

        if (error) throw error;

        const { data: cards, error: cardsError } = await supabase
          .from('flashcards')
          .select('id')
          .eq('set_id', deckId);

        if (cardsError) throw cardsError;

        setDeckInfo({
          ...set,
          cardCount: cards?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching deck info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeckInfo();
  }, [deckId, user]);

  if (loading) {
    return (
      <Card className="w-full h-full flex items-center justify-center">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Loading deck...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!deckInfo) {
    return (
      <Card className="w-full h-full flex items-center justify-center border-dashed">
        <CardContent className="p-4">
          <div className="text-center text-sm text-muted-foreground">
            Deck not found or no access
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLaunchDeck(deckId);
  };

  return (
    <Card 
      className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={isStudyMode ? handleLaunch : undefined}
    >
      <CardContent className="p-4 h-full flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <h3 
              className="font-medium text-sm leading-tight" 
              style={{ fontSize: `${14 * textScale}px` }}
            >
              {title || deckInfo.title}
            </h3>
          </div>
          {deckInfo.description && (
            <p 
              className="text-xs text-muted-foreground line-clamp-2"
              style={{ fontSize: `${12 * textScale}px` }}
            >
              {deckInfo.description}
            </p>
          )}
          <div 
            className="text-xs text-muted-foreground"
            style={{ fontSize: `${11 * textScale}px` }}
          >
            {cardCount || deckInfo.cardCount} cards
          </div>
        </div>
        
        {isStudyMode && (
          <Button 
            size="sm" 
            className="mt-3 w-full"
            onClick={handleLaunch}
          >
            <Play className="w-3 h-3 mr-1" />
            Study Deck
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
