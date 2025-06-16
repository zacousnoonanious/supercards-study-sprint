
import React from 'react';
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
  const getBackgroundColor = () => {
    return isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300';
  };

  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  return (
    <div 
      className={`w-full h-full ${isStudyMode ? 'cursor-pointer hover:bg-gray-50 rounded' : ''}`}
      onClick={handleElementClick}
    >
      {isStudyMode ? (
        <div 
          className="w-full h-full"
          style={{
            opacity: element.opacity || 1,
            transform: `rotate(${element.rotation || 0}deg)`,
          }}
        >
          {element.imageUrl ? (
            <img
              src={element.imageUrl}
              alt="Element"
              className={`w-full h-full object-cover ${
                element.borderStyle ? `border-2 border-${element.borderColor || 'gray-300'}` : ''
              } ${element.borderRadius ? 'rounded' : ''}`}
              style={{
                borderWidth: element.borderWidth || 0,
                borderColor: element.borderColor || '#d1d5db',
                borderStyle: element.borderStyle || 'none',
              }}
              draggable={false}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${getBackgroundColor()}`}>
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      ) : (
        <ImageElementEditor
          element={element}
          onUpdate={(updates) => onUpdateElement(element.id, updates)}
          textScale={textScale}
        />
      )}
    </div>
  );
};
