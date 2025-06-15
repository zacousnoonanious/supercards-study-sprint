
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { ParsedCard } from '@/types/import';

interface AnkiImportPreviewProps {
  cards: ParsedCard[];
  onCardsChange: (cards: ParsedCard[]) => void;
}

export const AnkiImportPreview: React.FC<AnkiImportPreviewProps> = ({
  cards,
  onCardsChange
}) => {
  const [showAllFields, setShowAllFields] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const toggleCardExpansion = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    onCardsChange(newCards);
  };

  const displayedCards = cards.slice(0, 10); // Show first 10 for preview

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">Anki Cards Preview</h3>
          <Badge variant="secondary">
            {cards.length} card{cards.length !== 1 ? 's' : ''} found
          </Badge>
        </div>
        
        {cards.some(card => card.metadata?.allFields && card.metadata.allFields.length > 2) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllFields(!showAllFields)}
            className="flex items-center gap-2"
          >
            {showAllFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAllFields ? 'Hide' : 'Show'} all fields
          </Button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {displayedCards.map((card, index) => (
          <Card key={index} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCardExpansion(index)}
                    className="p-0 h-auto"
                  >
                    {expandedCards.has(index) ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                    }
                  </Button>
                  Card {index + 1}
                  {card.metadata?.ankiModelName && (
                    <Badge variant="outline" className="text-xs">
                      {card.metadata.ankiModelName}
                    </Badge>
                  )}
                </CardTitle>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCard(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </CardHeader>
            
            <Collapsible open={expandedCards.has(index)}>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-xs text-muted-foreground mb-1">Front</p>
                      <p className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {card.front}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-xs text-muted-foreground mb-1">Back</p>
                      <p className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                        {card.back}
                      </p>
                    </div>
                  </div>

                  {card.tags && card.tags.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-xs text-muted-foreground mb-1">Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {card.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {showAllFields && card.metadata?.allFields && card.metadata.allFields.length > 2 && (
                    <div className="mt-3">
                      <p className="font-medium text-xs text-muted-foreground mb-2">All Anki Fields</p>
                      <div className="space-y-2">
                        {card.metadata.allFields.map((field: any, fieldIndex: number) => (
                          <div key={fieldIndex} className="text-xs">
                            <span className="font-medium text-muted-foreground">
                              {field.name}:
                            </span>
                            <p className="bg-gray-50 p-1 rounded mt-1 whitespace-pre-wrap">
                              {field.content || '(empty)'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
        
        {cards.length > 10 && (
          <div className="text-center text-sm text-muted-foreground p-4">
            Showing first 10 cards. {cards.length - 10} more cards will be imported.
          </div>
        )}
      </div>
    </div>
  );
};
