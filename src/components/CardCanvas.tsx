
import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { CanvasBackground } from './CanvasBackground';
import { useTheme } from '@/contexts/ThemeContext';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement?: string | null;
  onSelectElement: (elementId: string | null) => void;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (elementId: string) => void;
  cardSide: 'front' | 'back';
  style?: React.CSSProperties;
  showGrid?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  zoom?: number;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
  style,
  showGrid = false,
  gridSize = 20,
  snapToGrid = false,
  zoom = 1,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragElementId, setDragElementId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    onSelectElement(elementId);
    setIsDragging(true);
    setDragElementId(elementId);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  }, [onSelectElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragElementId) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const element = elements.find(el => el.id === dragElementId);
    if (!element) return;
    
    let newX = Math.max(0, Math.min(element.x + deltaX, (style?.width as number || 600) - element.width));
    let newY = Math.max(0, Math.min(element.y + deltaY, (style?.height as number || 450) - element.height));
    
    if (snapToGrid) {
      newX = Math.round(newX / gridSize) * gridSize;
      newY = Math.round(newY / gridSize) * gridSize;
    }
    
    onUpdateElement(dragElementId, { x: newX, y: newY });
    
    setDragStart({ x: currentX, y: currentY });
  }, [isDragging, dragElementId, dragStart, elements, style, snapToGrid, gridSize, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragElementId(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
      setEditingElement(null);
    }
  }, [onSelectElement]);

  return (
    <div
      ref={canvasRef}
      className={`relative overflow-hidden ${isDarkTheme ? 'bg-gray-900' : 'bg-white'}`}
      style={style}
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      data-canvas-background="true"
    >
      <CanvasBackground 
        showGrid={showGrid} 
        gridSize={gridSize}
        isDarkTheme={isDarkTheme}
      />
      
      {/* Card side indicator */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
        }`}>
          {cardSide === 'front' ? 'Front' : 'Back'}
        </div>
      </div>
      
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute select-none ${
            selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            transformOrigin: 'center',
            zIndex: element.zIndex || 0,
            cursor: isDragging && dragElementId === element.id ? 'grabbing' : 'grab',
          }}
          onMouseDown={(e) => handleElementMouseDown(e, element.id)}
          onClick={(e) => {
            e.stopPropagation();
            onSelectElement(element.id);
          }}
          data-element="true"
        >
          <CanvasElementRenderer
            element={element}
            editingElement={editingElement}
            onUpdateElement={onUpdateElement}
            onEditingChange={setEditingElement}
            zoom={zoom}
            onElementDragStart={(e, elementId) => handleElementMouseDown(e, elementId)}
            isDragging={isDragging && dragElementId === element.id}
          />
          
          {selectedElement === element.id && (
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          )}
        </div>
      ))}
      
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
          <div className="text-center">
            <p>No elements yet</p>
            <p className="text-sm mt-2">Use the toolbar to add elements</p>
          </div>
        </div>
      )}
    </div>
  );
};
