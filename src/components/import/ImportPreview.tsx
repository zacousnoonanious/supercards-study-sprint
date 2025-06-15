
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';
import { ParsedCard } from '@/types/import';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ImportPreviewProps {
  cards: ParsedCard[];
  sourceInfo: { type: string; filename?: string; url?: string };
  onImportComplete: (deckId: string, cardsImported: number) => void;
  onBack: () => void;
}

export const ImportPreview: React.FC<ImportPreviewProps> = ({
  cards,
  sourceInfo,
  onImportComplete,
  onBack
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [showAllCards, setShowAllCards] = useState(false);
  const [userDecks, setUserDecks] = useState<Array<{ id: string; title: string }>>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's decks
  React.useEffect(() => {
    const fetchDecks = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching decks:', error);
        return;
      }

      setUserDecks(data || []);
    };

    fetchDecks();
  }, [user]);

  const handleImport = async () => {
    if (!selectedDeckId) {
      toast({
        title: "Deck required",
        description: "Please select a destination deck",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);

    try {
      // Create import log
      const { data: importLog, error: logError } = await supabase
        .from('imported_content_logs')
        .insert({
          user_id: user?.id,
          source: sourceInfo.type,
          status: 'processing',
          source_url: sourceInfo.url,
          original_filename: sourceInfo.filename,
          deck_id: selectedDeckId,
          metadata: {
            totalCards: cards.length,
            sourceInfo
          }
        })
        .select()
        .single();

      if (logError) throw logError;

      // Import cards to the selected deck
      const cardsToImport = cards.map(card => ({
        set_id: selectedDeckId,
        question: card.front,
        answer: card.back,
        front_elements: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: card.front,
            x: 50,
            y: 200,
            width: 500,
            height: 50,
            fontSize: 24,
            fontFamily: 'Arial',
            textAlign: 'center',
            color: '#000000'
          }
        ],
        back_elements: [
          {
            id: crypto.randomUUID(),
            type: 'text',
            content: card.back,
            x: 50,
            y: 200,
            width: 500,
            height: 50,
            fontSize: 24,
            fontFamily: 'Arial',
            textAlign: 'center',
            color: '#000000'
          }
        ],
        metadata: card.metadata || {}
      }));

      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(cardsToImport);

      if (cardsError) throw cardsError;

      // Update import log
      await supabase
        .from('imported_content_logs')
        .update({
          status: 'success',
          cards_imported: cards.length
        })
        .eq('id', importLog.id);

      toast({
        title: "Import successful",
        description: `Successfully imported ${cards.length} flashcard(s)`,
      });

      onImportComplete(selectedDeckId, cards.length);
    } catch (error) {
      console.error('Error importing cards:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import cards",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const displayedCards = showAllCards ? cards : cards.slice(0, 5);

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Badge variant="secondary">
          {cards.length} card{cards.length !== 1 ? 's' : ''} found
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Destination Deck</label>
          <Select value={selectedDeckId} onValueChange={setSelectedDeckId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a deck to import into" />
            </SelectTrigger>
            <SelectContent>
              {userDecks.map((deck) => (
                <SelectItem key={deck.id} value={deck.id}>
                  {deck.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Preview Cards</h3>
            {cards.length > 5 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllCards(!showAllCards)}
                className="flex items-center gap-2"
              >
                {showAllCards ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAllCards ? 'Show less' : `Show all ${cards.length}`}
              </Button>
            )}
          </div>

          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {displayedCards.map((card, index) => (
              <Card key={index} className="p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Front</p>
                    <p className="truncate">{card.front}</p>
                  </div>
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">Back</p>
                    <p className="truncate">{card.back}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleImport} 
            disabled={!selectedDeckId || isImporting}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Cards'}
          </Button>
        </div>
      </div>
    </div>
  );
};
