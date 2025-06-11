
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { TTSComponent } from '../TTSComponent';
import { Volume2 } from 'lucide-react';

interface TTSElementRendererProps {
  element: CanvasElement;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  textScale?: number;
  isStudyMode?: boolean;
  onElementSelect?: (elementId: string) => void;
  isSelected?: boolean;
  isDarkTheme: boolean;
}

export const TTSElementRenderer: React.FC<TTSElementRendererProps> = ({
  element,
  onUpdateElement,
  textScale = 1,
  isStudyMode = false,
  onElementSelect,
  isSelected = false,
  isDarkTheme,
}) => {
  return (
    <div 
      className={`w-full h-full flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer ${
        isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''
      }`}
      onClick={() => onElementSelect?.(element.id)}
      style={{
        opacity: element.opacity || 1,
        minWidth: '32px',
        minHeight: '32px',
      }}
    >
      <TTSComponent
        element={element}
        onUpdate={(updates) => onUpdateElement(element.id, updates)}
        isEditing={false}
        autoplay={isStudyMode && element.ttsAutoplay}
      />
      {!element.content && (
        <Volume2 className="w-4 h-4 text-white" />
      )}
    </div>
  );
};
