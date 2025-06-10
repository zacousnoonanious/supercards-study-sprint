
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';
import { CanvasSizeControls } from './settings/CanvasSizeControls';
import { GridControls } from './settings/GridControls';
import { TimerControls } from './settings/TimerControls';
import { ElementControls } from './settings/ElementControls';

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
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const bothSidesHaveTimers = (currentCard?.countdown_timer_front || 0) > 0 && (currentCard?.countdown_timer_back || 0) > 0;
  const bothSidesFlip = currentCard?.countdown_behavior_front === 'flip' && currentCard?.countdown_behavior_back === 'flip';
  const showFlipCount = bothSidesHaveTimers && bothSidesFlip;

  return (
    <div className={`border-b p-2 ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-background border-border'}`}>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Canvas Size Controls */}
        <CanvasSizeControls
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          onCanvasSizeChange={onCanvasSizeChange}
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
  );
};
