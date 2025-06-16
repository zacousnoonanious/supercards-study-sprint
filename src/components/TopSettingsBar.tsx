
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';
import { CanvasSizeControls } from './settings/CanvasSizeControls';
import { GridControls } from './settings/GridControls';
import { TimerControls } from './settings/TimerControls';
import { ElementControls } from './settings/ElementControls';
import { EditableDeckTitle } from './EditableDeckTitle';
import { TagsManager } from './TagsManager';

interface TopSettingsBarProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  canvasWidth: number;
  canvasHeight: number;
  onCanvasSizeChange: (width: number, height: number) => void;
  currentCard: Flashcard;
  onUpdateCard: (updates: Partial<Flashcard>) => void;
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  currentSide?: 'front' | 'back';
  deckName?: string;
  onUpdateDeckTitle?: (title: string) => Promise<void>;
}

export const TopSettingsBar: React.FC<TopSettingsBarProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  canvasWidth,
  canvasHeight,
  onCanvasSizeChange,
  currentCard,
  onUpdateCard,
  showGrid = false,
  onShowGridChange,
  snapToGrid = false,
  onSnapToGridChange,
  currentSide = 'front',
  deckName,
  onUpdateDeckTitle,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);
  const [showTagsManager, setShowTagsManager] = useState(false);

  const handleCanvasSizeChange = (width: number, height: number) => {
    console.log('Canvas size change requested:', width, height);
    onCanvasSizeChange(width, height);
  };

  // Get tag counts for display
  const manualTagsCount = currentCard?.metadata?.tags?.length || 0;
  const aiTagsCount = currentCard?.metadata?.aiTags?.length || 0;
  const totalTagsCount = manualTagsCount + aiTagsCount;

  return (
    <div className={`border-b p-2 ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-background border-border'}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Deck Title - moved to prominent left position */}
          {deckName && onUpdateDeckTitle && (
            <>
              <div className="flex items-center">
                <EditableDeckTitle
                  title={deckName}
                  onTitleUpdate={onUpdateDeckTitle}
                  className="px-2 py-1 rounded border border-border/50 bg-muted/30"
                />
              </div>
              
              <Separator orientation="vertical" className="h-8" />
            </>
          )}

          {/* Tags Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTagsManager(true)}
            className="flex items-center gap-2"
          >
            <Tags className="w-4 h-4" />
            Tags
            {totalTagsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                {totalTagsCount}
              </span>
            )}
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Canvas Size Controls */}
          <CanvasSizeControls
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
            onCanvasSizeChange={handleCanvasSizeChange}
          />

          <Separator orientation="vertical" className="h-8" />

          {/* Grid Controls */}
          <GridControls
            showGrid={showGrid}
            onShowGridChange={onShowGridChange}
            snapToGrid={snapToGrid}
            onSnapToGridChange={onSnapToGridChange}
          />

          <Separator orientation="vertical" className="h-8" />

          {/* Timer Settings - Side Specific */}
          <TimerControls
            currentCard={currentCard}
            onUpdateCard={onUpdateCard}
            currentSide={currentSide}
          />

          {/* Only show separator if there are element controls to show */}
          {selectedElement && (
            <>
              <Separator orientation="vertical" className="h-8" />
              
              {/* Element Controls */}
              <ElementControls
                selectedElement={selectedElement}
                onUpdateElement={onUpdateElement}
                onDeleteElement={onDeleteElement}
              />
            </>
          )}
        </div>
      </div>

      {/* Tags Manager Dialog */}
      <TagsManager
        isOpen={showTagsManager}
        onClose={() => setShowTagsManager(false)}
        currentCard={currentCard}
        onUpdateCard={onUpdateCard}
      />
    </div>
  );
};
