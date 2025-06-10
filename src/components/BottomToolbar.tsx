
import React from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { CardSideToggle } from './CardSideToggle';
import { ZoomIn, ZoomOut, Grid, Move } from 'lucide-react';

interface BottomToolbarProps {
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  onZoomChange: (zoom: number) => void;
  onShowGridChange: (show: boolean) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onToolbarPositionChange: (position: 'left' | 'very-top' | 'canvas-left' | 'floating') => void;
  onToolbarDockChange: (docked: boolean) => void;
  onToolbarShowTextChange: (showText: boolean) => void;
  currentSide: 'front' | 'back';
  onCardSideChange: (side: 'front' | 'back') => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  zoom,
  showGrid,
  snapToGrid,
  toolbarPosition,
  toolbarIsDocked,
  toolbarShowText,
  onZoomChange,
  onShowGridChange,
  onSnapToGridChange,
  onToolbarPositionChange,
  onToolbarDockChange,
  onToolbarShowTextChange,
  currentSide,
  onCardSideChange,
}) => {
  return (
    <div className="border-t p-2 bg-background">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardSideToggle
            currentSide={currentSide}
            onSideChange={onCardSideChange}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={showGrid ? "default" : "outline"}
            size="sm"
            onClick={() => onShowGridChange(!showGrid)}
          >
            <Grid className="w-4 h-4" />
          </Button>
          
          <Button
            variant={snapToGrid ? "default" : "outline"}
            size="sm"
            onClick={() => onSnapToGridChange(!snapToGrid)}
          >
            <Move className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.min(3, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
