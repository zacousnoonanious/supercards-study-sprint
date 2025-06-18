
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CardCanvas } from './CardCanvas';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { CanvasElement, Flashcard, CardTemplate } from '@/types/flashcard';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface FullscreenEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentCard: Flashcard;
  currentSide: 'front' | 'back';
  selectedElement: CanvasElement | null;
  cardWidth: number;
  cardHeight: number;
  onElementSelect: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  onAddElement: (type: string) => void;
  onAutoArrange: (type: 'grid' | 'center' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical' | 'align-elements-left' | 'align-elements-center' | 'align-elements-right' | 'distribute-horizontal' | 'distribute-vertical' | 'scale-to-fit') => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  currentCardIndex: number;
  totalCards: number;
}

export const FullscreenEditor: React.FC<FullscreenEditorProps> = ({
  isOpen,
  onClose,
  currentCard,
  currentSide,
  selectedElement,
  cardWidth,
  cardHeight,
  onElementSelect,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
  onAutoArrange,
  onNavigateCard,
  onSideChange,
  onCreateNewCard,
  onCreateNewCardWithLayout,
  onCreateNewCardFromTemplate,
  onDeleteCard,
  currentCardIndex,
  totalCards,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  // Local state for fullscreen editor
  const [zoom, setZoom] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = React.useState(false);
  const [snapToGrid, setSnapToGrid] = React.useState(false);
  const [autoAlign, setAutoAlign] = React.useState(false);
  const canvasViewportRef = React.useRef<HTMLDivElement>(null);

  // Enhanced fit to view for fullscreen that calculates optimal zoom
  const handleFullscreenFitToView = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    
    const viewportRect = viewport.getBoundingClientRect();
    const padding = 60; // Comfortable padding for fullscreen
    const availableWidth = viewportRect.width - padding;
    const availableHeight = viewportRect.height - padding;
    
    // Calculate optimal zoom to fit canvas in available space
    const zoomX = availableWidth / cardWidth;
    const zoomY = availableHeight / cardHeight;
    const optimalZoom = Math.min(zoomX, zoomY, 3); // Allow up to 300% zoom in fullscreen
    
    setZoom(optimalZoom);
    
    // Center the canvas in the viewport
    const scaledWidth = cardWidth * optimalZoom;
    const scaledHeight = cardHeight * optimalZoom;
    const centerX = (viewportRect.width - scaledWidth) / 2;
    const centerY = (viewportRect.height - scaledHeight) / 2;
    
    setPanOffset({ x: centerX, y: centerY });
  };

  // Auto-fit when opening fullscreen
  React.useEffect(() => {
    if (isOpen) {
      // Delay to ensure viewport is fully rendered
      setTimeout(handleFullscreenFitToView, 100);
    }
  }, [isOpen, cardWidth, cardHeight]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 m-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between">
              <DialogTitle>Fullscreen Editor</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(5, zoom + 0.1))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreenFitToView}
                  title="Fit to View"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Main Content */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Toolbar */}
            <div className="w-20 border-r bg-background overflow-y-auto">
              <ConsolidatedToolbar
                onAddElement={onAddElement}
                onAutoArrange={onAutoArrange}
                currentCard={currentCard}
                currentCardIndex={currentCardIndex}
                totalCards={totalCards}
                currentSide={currentSide}
                onNavigateCard={onNavigateCard}
                onSideChange={onSideChange}
                onCreateNewCard={onCreateNewCard}
                onCreateNewCardWithLayout={onCreateNewCardWithLayout}
                onCreateNewCardFromTemplate={onCreateNewCardFromTemplate}
                onDeleteCard={onDeleteCard}
                position="left"
                isDocked={true}
                showText={false}
              />
            </div>

            {/* Canvas Area */}
            <div 
              ref={canvasViewportRef}
              className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900"
              data-canvas-background
            >
              <div
                className="absolute flex items-center justify-center w-full h-full"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                >
                  <CardCanvas
                    elements={currentSide === 'front' ? currentCard.front_elements : currentCard.back_elements}
                    selectedElement={selectedElement?.id || null}
                    onSelectElement={onElementSelect}
                    onUpdateElement={onUpdateElement}
                    onDeleteElement={onDeleteElement}
                    cardSide={currentSide}
                    style={{ width: cardWidth, height: cardHeight }}
                    showGrid={showGrid}
                    snapToGrid={snapToGrid}
                    autoAlign={autoAlign}
                    zoom={zoom}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
