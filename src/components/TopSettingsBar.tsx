
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tags } from 'lucide-react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';
import { CanvasSizeControls } from './settings/CanvasSizeControls';
import { GridControls } from './settings/GridControls';
import { CardBorderToggle } from './settings/CardBorderToggle';
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
  
  // CRITICAL: Visual editor props - these are LOCAL ONLY and should NOT sync with database
  showGrid?: boolean;
  onShowGridChange?: (show: boolean) => void;
  snapToGrid?: boolean;
  onSnapToGridChange?: (snap: boolean) => void;
  showBorder?: boolean;
  onShowBorderChange?: (show: boolean) => void;
  
  currentSide?: 'front' | 'back';
  deckName?: string;
  onUpdateDeckTitle?: (title: string) => Promise<void>;
}

/**
 * TopSettingsBar Component
 * 
 * Main settings bar for the card editor containing all essential controls.
 * 
 * CRITICAL: Visual editor features (grid, snap, border) are LOCAL ONLY
 * and should never sync with the database. They are purely for DOM visualization.
 */
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
  showBorder = false,
  onShowBorderChange,
  currentSide = 'front',
  deckName,
  onUpdateDeckTitle,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);
  const [showTagsManager, setShowTagsManager] = useState(false);

  /**
   * Handle canvas size changes with validation
   */
  const handleCanvasSizeChange = React.useCallback((width: number, height: number) => {
    // Validate input parameters
    if (typeof width !== 'number' || typeof height !== 'number') {
      console.error('TopSettingsBar: Invalid canvas size values:', { width, height });
      return;
    }
    
    if (width <= 0 || height <= 0) {
      console.error('TopSettingsBar: Canvas dimensions must be positive:', { width, height });
      return;
    }
    
    console.log('Canvas size change requested:', width, height);
    onCanvasSizeChange(width, height);
  }, [onCanvasSizeChange]);

  /**
   * CRITICAL: Visual editor handlers - these manage LOCAL ONLY state
   * They should NEVER trigger database updates or cause state conflicts
   */
  const handleShowGridChange = React.useCallback((show: boolean) => {
    console.log('TopSettingsBar: Grid visibility change (LOCAL ONLY):', show);
    if (onShowGridChange && typeof onShowGridChange === 'function') {
      onShowGridChange(show);
    }
  }, [onShowGridChange]);

  const handleSnapToGridChange = React.useCallback((snap: boolean) => {
    console.log('TopSettingsBar: Snap to grid change (LOCAL ONLY):', snap);
    if (onSnapToGridChange && typeof onSnapToGridChange === 'function') {
      onSnapToGridChange(snap);
    }
  }, [onSnapToGridChange]);

  const handleShowBorderChange = React.useCallback((show: boolean) => {
    console.log('TopSettingsBar: Border visibility change (LOCAL ONLY):', show);
    if (onShowBorderChange && typeof onShowBorderChange === 'function') {
      onShowBorderChange(show);
    }
  }, [onShowBorderChange]);

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

          {/* Grid Controls - Essential for visual editing - LOCAL ONLY */}
          <GridControls
            showGrid={showGrid}
            onShowGridChange={handleShowGridChange}
            snapToGrid={snapToGrid}
            onSnapToGridChange={handleSnapToGridChange}
          />

          <Separator orientation="vertical" className="h-8" />

          {/* Border Toggle - Critical for visual editing - LOCAL ONLY */}
          <CardBorderToggle
            showBorder={showBorder}
            onShowBorderChange={handleShowBorderChange}
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
