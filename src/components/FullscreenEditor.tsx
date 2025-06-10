
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { CardCanvas } from './CardCanvas';
import { ConsolidatedToolbar } from './ConsolidatedToolbar';
import { CanvasElement, Flashcard, CardTemplate } from '@/types/flashcard';
import { useCanvasInteraction } from '@/hooks/useCanvasInteraction';
import { useCardEditorState } from '@/hooks/useCardEditorState';
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
  onAutoArrange: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right' | 'center-horizontal' | 'center-vertical') => void;
  onNavigateCard: (direction: 'prev' | 'next') => void;
  onSideChange: (side: 'front' | 'back') => void;
  onCreateNewCard: () => void;
  onCreateNewCardWithLayout: () => void;
  onCreateNewCardFromTemplate: (template: CardTemplate) => void;
  onDeleteCard: () => void;
  onCardTypeChange: (type: 'normal' | 'simple' | 'informational' | 'single-sided' | 'quiz-only' | 'password-protected') => void;
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
  onCardTypeChange,
  currentCardIndex,
  totalCards,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const {
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    showGrid,
    setShowGrid,
    snapToGrid,
    setSnapToGrid,
    canvasContainerRef,
    canvasViewportRef,
  } = useCardEditorState();

  const { fitToView } = useCanvasInteraction({
    canvasContainerRef,
    canvasViewportRef,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
    panOffset,
    setPanOffset,
    zoom,
    setZoom,
    cardWidth,
    cardHeight,
  });

  // Custom fit to view for fullscreen that calculates based on the fullscreen viewport
  const handleFullscreenFitToView = () => {
    const viewport = canvasViewportRef.current;
    if (!viewport) return;
    
    const viewportRect = viewport.getBoundingClientRect();
    const padding = 80; // Extra padding for fullscreen
    const availableWidth = viewportRect.width - padding;
    const availableHeight = viewportRect.height - padding;
    
    const zoomX = availableWidth / cardWidth;
    const zoomY = availableHeight / cardHeight;
    const newZoom = Math.min(zoomX, zoomY, 2); // Allow up to 200% zoom in fullscreen
    
    setZoom(newZoom);
    
    // Center the canvas in the viewport
    const scaledWidth = cardWidth * newZoom;
    const scaledHeight = cardHeight * newZoom;
    const centerX = (viewportRect.width - scaledWidth) / 2;
    const centerY = (viewportRect.height - scaledHeight) / 2;
    
    setPanOffset({ x: centerX, y: centerY });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
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
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
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
                onCardTypeChange={onCardTypeChange}
                position="left"
                isDocked={true}
                showText={false}
              />
            </div>

            {/* Canvas Area */}
            <div 
              ref={canvasViewportRef}
              className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-800"
              style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
              data-canvas-background
            >
              <div
                ref={canvasContainerRef}
                className="absolute"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
                  transformOrigin: '0 0',
                  left: 0,
                  top: 0,
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
                  zoom={zoom}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
