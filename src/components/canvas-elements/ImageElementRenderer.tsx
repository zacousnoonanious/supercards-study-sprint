
import React, { useCallback, useMemo } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { ImageElementEditor } from '../ImageElementEditor';

interface ImageElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDragStart?: (e: React.MouseEvent, elementId: string) => void;
  isDragging?: boolean;
  textScale?: number;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme?: boolean;
}

export const ImageElementRenderer: React.FC<ImageElementRendererProps> = ({
  element,
  isSelected = false,
  zoom = 1,
  onUpdateElement,
  onElementDragStart,
  isDragging = false,
  textScale = 1,
  isStudyMode = false,
  onElementSelect,
  isDarkTheme = false,
}) => {
  // Memoize background color to prevent re-renders
  const backgroundColorClass = useMemo(() => {
    return isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  }, [isDarkTheme]);

  // Memoize image styles to prevent re-renders
  const imageStyles = useMemo(() => ({
    borderWidth: element.borderWidth || 0,
    borderColor: element.borderColor || '#d1d5db',
    borderStyle: element.borderStyle || 'none',
    opacity: element.opacity || 1,
    transform: `rotate(${element.rotation || 0}deg)`,
  }), [element.borderWidth, element.borderColor, element.borderStyle, element.opacity, element.rotation]);

  // Stable click handler to prevent re-renders
  const handleElementClick = useCallback((e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  }, [isStudyMode, onElementSelect, element.id]);

  // Stable update handler to prevent re-renders
  const handleUpdate = useCallback((updates: Partial<CanvasElement>) => {
    onUpdateElement(element.id, updates);
  }, [onUpdateElement, element.id]);

  console.log('🖼️ ImageElementRenderer render for element:', element.id, { isSelected, isDragging });

  return (
    <div 
      className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
      onClick={handleElementClick}
    >
      {isStudyMode ? (
        <div className="w-full h-full" style={imageStyles}>
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt="Element"
              className={`w-full h-full object-cover ${
                element.borderStyle ? `border-2` : ''
              } ${element.borderRadius ? 'rounded' : ''}`}
              style={{
                borderWidth: element.borderWidth || 0,
                borderColor: element.borderColor || '#d1d5db',
                borderStyle: element.borderStyle || 'none',
              }}
              draggable={false}
              onError={(e) => {
                console.warn('🖼️ Image failed to load:', element.imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${backgroundColorClass}`}>
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      ) : (
        <ImageElementEditor
          element={element}
          onUpdate={handleUpdate}
          textScale={textScale}
        />
      )}
    </div>
  );
};
