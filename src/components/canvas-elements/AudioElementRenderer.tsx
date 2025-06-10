
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface AudioElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme: boolean;
}

export const AudioElementRenderer: React.FC<AudioElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
  isDarkTheme,
}) => {
  const handleElementClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  const audioContent = (
    <div className={`w-full h-full flex flex-col items-center justify-center rounded border p-2 ${
      isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
    } ${isStudyMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
    onClick={handleElementClick}
    >
      {element.audioUrl ? (
        <audio controls className="w-full max-w-full">
          <source src={element.audioUrl} type="audio/mpeg" />
          Your browser does not support audio playback.
        </audio>
      ) : (
        !isStudyMode && (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2" style={{ fontSize: `${12 * textScale}px` }}>
              No audio file
            </div>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    onUpdateElement(element.id, { audioUrl: result });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="text-xs"
              style={{ fontSize: `${10 * textScale}px` }}
            />
          </div>
        )
      )}
    </div>
  );

  return element.hyperlink ? (
    <a 
      href={element.hyperlink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full h-full block"
    >
      {audioContent}
    </a>
  ) : (
    audioContent
  );
};
