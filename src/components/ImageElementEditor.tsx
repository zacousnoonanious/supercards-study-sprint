
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageElementEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
}

export const ImageElementEditor: React.FC<ImageElementEditorProps> = ({
  element,
  onUpdate,
  textScale = 1
}) => {
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Image Preview */}
      <div 
        className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded relative overflow-hidden"
        style={{
          opacity: element.opacity || 1,
          transform: `rotate(${element.rotation || 0}deg)`,
        }}
      >
        {element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            style={{
              borderWidth: element.borderWidth || 0,
              borderColor: element.borderColor || '#d1d5db',
              borderStyle: element.borderStyle || 'none',
            }}
            draggable={false}
          />
        ) : (
          <div className="text-center text-gray-400">
            <p style={{ fontSize: `${12 * textScale}px` }}>No image selected</p>
            <p style={{ fontSize: `${10 * textScale}px` }}>Configure in options panel</p>
          </div>
        )}
      </div>
    </div>
  );
};
