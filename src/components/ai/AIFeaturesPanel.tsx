
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Wand2, Tags, Mic, Sparkles } from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { AILayoutSuggestion } from './AILayoutSuggestion';
import { AITextEnhancer } from './AITextEnhancer';
import { AutoTagging } from './AutoTagging';
import { VoiceToCard } from './VoiceToCard';

interface AIFeaturesPanelProps {
  currentCard: Flashcard;
  currentSide: 'front' | 'back';
  selectedElement: CanvasElement | null;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onApplyLayout: (elements: CanvasElement[]) => void;
  onTagsUpdate: (tags: string[]) => void;
  onCreateCard: (question: string, answer: string) => void;
}

export const AIFeaturesPanel: React.FC<AIFeaturesPanelProps> = ({
  currentCard,
  currentSide,
  selectedElement,
  onUpdateElement,
  onApplyLayout,
  onTagsUpdate,
  onCreateCard,
}) => {
  const [showTextEnhancer, setShowTextEnhancer] = useState(false);
  const [showVoiceToCard, setShowVoiceToCard] = useState(false);

  const currentElements = currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements;
  const currentTags: string[] = []; // This would come from the deck metadata

  const handleApplyLayout = (updatedElements: CanvasElement[]) => {
    onApplyLayout(updatedElements);
  };

  const handleElementUpdate = (updates: Partial<CanvasElement>) => {
    if (selectedElement) {
      onUpdateElement(selectedElement.id, updates);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto">Beta</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout" className="text-xs">
              <Wand2 className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs">
              <Sparkles className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="tags" className="text-xs">
              <Tags className="w-3 h-3" />
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              <Mic className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="mt-4">
            <AILayoutSuggestion
              elements={currentElements}
              cardWidth={currentCard.canvas_width || 600}
              cardHeight={currentCard.canvas_height || 450}
              onApplyLayout={handleApplyLayout}
            />
          </TabsContent>

          <TabsContent value="text" className="mt-4">
            <Card>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Enhance text elements with AI-powered improvements
                  </p>
                  <Button
                    onClick={() => setShowTextEnhancer(true)}
                    disabled={!selectedElement || selectedElement.type !== 'text'}
                    size="sm"
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Enhance Selected Text
                  </Button>
                  {!selectedElement && (
                    <p className="text-xs text-gray-500">
                      Select a text element to enhance
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="mt-4">
            <AutoTagging
              elements={currentElements}
              currentTags={currentTags}
              onTagsUpdate={onTagsUpdate}
            />
          </TabsContent>

          <TabsContent value="voice" className="mt-4">
            <Card>
              <CardContent className="p-3">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Create flashcards by speaking into your microphone
                  </p>
                  <Button
                    onClick={() => setShowVoiceToCard(true)}
                    size="sm"
                    className="w-full"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Voice Input
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal overlays */}
        {showTextEnhancer && selectedElement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <AITextEnhancer
              element={selectedElement}
              onUpdate={handleElementUpdate}
              onClose={() => setShowTextEnhancer(false)}
            />
          </div>
        )}

        {showVoiceToCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <VoiceToCard
              onCreateCard={onCreateCard}
              onClose={() => setShowVoiceToCard(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
