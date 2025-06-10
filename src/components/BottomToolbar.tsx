
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  ZoomIn, 
  ZoomOut, 
  Grid3X3, 
  Maximize, 
  Monitor,
  Move,
  Type,
  Settings,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { CardSideToggle } from './CardSideToggle';
import { CardBorderToggle } from './settings/CardBorderToggle';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';

interface BottomToolbarProps {
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  toolbarPosition: 'left' | 'very-top' | 'canvas-left' | 'floating';
  toolbarIsDocked: boolean;
  toolbarShowText: boolean;
  onZoomChange: (zoom: number) => void;
  onShowGridChange?: (show: boolean) => void;
  onSnapToGridChange?: (snap: boolean) => void;
  onToolbarPositionChange?: (position: 'left' | 'very-top' | 'canvas-left' | 'floating') => void;
  onToolbarDockChange?: (docked: boolean) => void;
  onToolbarShowTextChange?: (showText: boolean) => void;
  currentSide: 'front' | 'back';
  onCardSideChange: (side: 'front' | 'back') => void;
  onFitToView?: () => void;
  onOpenFullscreen?: () => void;
  showBorder?: boolean;
  onShowBorderChange?: (show: boolean) => void;
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
  onFitToView,
  onOpenFullscreen,
  showBorder = false,
  onShowBorderChange,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleZoomIn = () => {
    onZoomChange(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoom - 0.1, 0.1));
  };

  const handleZoomReset = () => {
    onZoomChange(1);
  };

  return (
    <div className={`border-t p-2 ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-background border-border'}`}>
      <div className="flex items-center justify-between">
        {/* Left section - Card Side and Zoom Controls */}
        <div className="flex items-center gap-4">
          <CardSideToggle
            currentSide={currentSide}
            onSideChange={onCardSideChange}
          />
          
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <div className="w-32">
              <Slider
                value={[zoom]}
                onValueChange={([value]) => onZoomChange(value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              title="Reset zoom to 100%"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground min-w-12">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Center section - Grid and Border Controls */}
        <div className="flex items-center gap-4">
          {onShowGridChange && (
            <div className="flex items-center gap-2">
              <Button
                variant={showGrid ? "default" : "outline"}
                size="sm"
                onClick={() => onShowGridChange(!showGrid)}
                className="flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                {showGrid ? t('toolbar.hideGrid') : t('toolbar.showGrid')}
              </Button>
              
              {showGrid && onSnapToGridChange && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="snap-to-grid" className="text-sm">
                    Snap
                  </Label>
                  <Switch
                    id="snap-to-grid"
                    checked={snapToGrid}
                    onCheckedChange={onSnapToGridChange}
                  />
                </div>
              )}
            </div>
          )}

          {onShowBorderChange && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <CardBorderToggle
                showBorder={showBorder}
                onShowBorderChange={onShowBorderChange}
              />
            </>
          )}
        </div>

        {/* Right section - View Controls */}
        <div className="flex items-center gap-2">
          {onFitToView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFitToView}
              title="Fit to view"
            >
              <Maximize className="w-4 h-4" />
            </Button>
          )}
          
          {onOpenFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenFullscreen}
              title="Open fullscreen editor"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          )}

          <Separator orientation="vertical" className="h-6" />
          
          {onToolbarShowTextChange && (
            <Button
              variant={toolbarShowText ? "default" : "ghost"}
              size="sm"
              onClick={() => onToolbarShowTextChange(!toolbarShowText)}
              title="Toggle toolbar text labels"
            >
              <Type className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
