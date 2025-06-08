
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import { StudyCardRenderer } from './StudyCardRenderer';
import { Flashcard } from '@/types/flashcard';

interface CardPreviewWithControlsProps {
  card: Flashcard;
  cardIndex: number;
  onClick: () => void;
  isDragging?: boolean;
}

export const CardPreviewWithControls: React.FC<CardPreviewWithControlsProps> = ({
  card,
  cardIndex,
  onClick,
  isDragging = false
}) => {
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(0.5); // Reduced initial zoom to fit content better
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button === 0) {
      setIsPanning(true);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = (e.clientX - lastMousePos.x) * 0.5;
    const deltaY = (e.clientY - lastMousePos.y) * 0.5;
    
    setPanPosition(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isPanning, lastMousePos]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.1, 0.1));
  };

  const resetView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPanPosition({ x: 0, y: 0 });
    setZoom(0.5); // Reset to better fitting zoom
  };

  // Calculate card dimensions to fit within preview
  const cardWidth = card.canvas_width || 600;
  const cardHeight = card.canvas_height || 450;
  const aspectRatio = cardWidth / cardHeight;

  return (
    <div
      className={`bg-white border-2 rounded-lg shadow-lg hover:shadow-xl transition-all select-none relative ${
        isDragging ? 'opacity-50 transform rotate-2' : ''
      }`}
      onClick={onClick}
    >
      {/* Card Header */}
      <div className="p-3 border-b bg-gray-50 rounded-t-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Card {cardIndex + 1}</span>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-sm">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} className="h-6 w-6 p-0">
              <Minus className="w-3 h-3" />
            </Button>
            <span className="text-xs px-1 min-w-[35px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView} className="h-6 w-6 p-0 text-xs">
              ⌂
            </Button>
          </div>
        </div>
      </div>
      
      {/* Card Preview Area - Increased height to show more content */}
      <div 
        className="h-80 bg-gray-50 rounded-b-lg overflow-hidden cursor-grab active:cursor-grabbing relative flex items-center justify-center"
        onMouseDown={handleMouseDown}
        ref={previewRef}
      >
        <div 
          className="transition-transform flex items-center justify-center"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoom})`,
            transformOrigin: 'center center'
          }}
        >
          <StudyCardRenderer
            elements={card.front_elements || []}
            textScale={1}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            isInformationalCard={card.card_type === 'informational'}
            className="border border-gray-200 shadow-sm"
          />
        </div>
      </div>
      
      {/* Card Info Footer */}
      <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t">
        <div className="truncate">Q: {card.question?.substring(0, 40)}...</div>
        <div className="truncate">A: {card.answer?.substring(0, 40)}...</div>
      </div>
    </div>
  );
};
