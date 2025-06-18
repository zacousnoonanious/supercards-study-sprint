
import React, { useMemo } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

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
  const { t } = useI18n();

  // Memoize styles to prevent re-renders
  const containerStyles = useMemo(() => ({
    opacity: element.opacity || 1,
    transform: `rotate(${element.rotation || 0}deg)`,
  }), [element.opacity, element.rotation]);

  const imageStyles = useMemo(() => ({
    borderWidth: element.borderWidth || 0,
    borderColor: element.borderColor || '#d1d5db',
    borderStyle: element.borderWidth ? 'solid' : 'none',
    borderRadius: element.borderRadius ? '8px' : '0px',
  }), [element.borderWidth, element.borderColor, element.borderRadius]);

  console.log('🖼️ ImageElementEditor render for element:', element.id);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Simple Image Display */}
      <div 
        className="flex-1 flex items-center justify-center rounded relative overflow-hidden"
        style={containerStyles}
      >
        {element.imageUrl ? (
          <img
            src={element.imageUrl}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            style={imageStyles}
            draggable={false}
          />
        ) : (
          <div className="text-center text-gray-400 p-4">
            <p style={{ fontSize: `${12 * textScale}px` }}>{t('editor.noImageSelected')}</p>
            <p style={{ fontSize: `${10 * textScale}px` }}>{t('editor.configureInSidebar')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
