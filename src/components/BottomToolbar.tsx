import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardBorderToggle } from './settings/CardBorderToggle';
import { GridControls } from './settings/GridControls';
import { AutoAlignToggle } from './settings/AutoAlignToggle';
import { ZoomIn, ZoomOut, Maximize2, Maximize } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface BottomToolbarProps {
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showBorder: boolean;
  autoAlign: boolean;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  onZoomChange: (zoom: number) => void;
  onShowGridChange: (show: boolean) => void;
  onSnapToGridChange: (snap: boolean) => void;
  onShowBorderChange: (show: boolean) => void;
  onAutoAlignChange: (align: boolean) => void;
  onToolbarPositionChange: (position: 'left' | 'very-top' | 'canvas-left' | 'floating') => void;
  onToolbarDockChange: (docked: boolean) => void;
  onToolbarShowTextChange: (showText: boolean) => void;
  currentSide: 'front' | 'back';
  onCardSideChange: (side: 'front' | 'back') => void;
  onFitToView?: () => void;
  onOpenFullscreen?: () => void;
  isBackSideDisabled?: boolean;
  // New navigation props
  currentCardIndex?: number;
  totalCards?: number;
  onNavigateCard?: (direction: 'prev' | 'next') => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  zoom,
  showGrid,
  snapToGrid,
  showBorder,
  autoAlign,
  onZoomChange,
  onShowGridChange,
  onSnapToGridChange,
  onShowBorderChange,
  onAutoAlignChange,
  currentSide,
  onCardSideChange,
  onFitToView,
  onOpenFullscreen,
  isBackSideDisabled = false,
  currentCardIndex,
  totalCards,
  onNavigateCard,
}) => {
  const { t } = useI18n();

  return (
    <div className="border-t bg-background p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Only show editor controls if we're not in study mode (when navigation is present) */}
          {!onNavigateCard && (
            <>
              {/* Grid Controls */}
              <GridControls
                showGrid={showGrid}
                onShowGridChange={onShowGridChange}
                snapToGrid={snapToGrid}
                onSnapToGridChange={onSnapToGridChange}
              />

              <Separator orientation="vertical" className="h-6" />

              {/* Auto Align Toggle */}
              <AutoAlignToggle
                autoAlign={autoAlign}
                onAutoAlignChange={onAutoAlignChange}
              />

              <Separator orientation="vertical" className="h-6" />

              {/* Border Toggle */}
              <CardBorderToggle
                showBorder={showBorder}
                onShowBorderChange={onShowBorderChange}
              />
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Only show zoom controls if we're not in study mode */}
          {!onNavigateCard && (
            <>
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onZoomChange(Math.max(0.1, zoom - 0.1))}
                disabled={zoom <= 0.1}
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
                disabled={zoom >= 3}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Fit to View */}
              {onFitToView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFitToView}
                  title={t('editor.fitToView')}
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              )}

              {/* Fullscreen */}
              {onOpenFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenFullscreen}
                  title={t('editor.fullscreen')}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
