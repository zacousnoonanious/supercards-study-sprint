
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { EmbeddedDeckViewer } from '../EmbeddedDeckViewer';

interface MediaElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const MediaElementRenderer: React.FC<MediaElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  const handleError = (error: any) => {
    console.error('Media element error:', error);
  };

  const renderContent = () => {
    switch (element.type) {
      case 'video':
        return (
          <video
            src={element.content}
            controls
            className="w-full h-full object-contain"
            onError={handleError}
          />
        );
      
      case 'iframe':
        return (
          <iframe
            src={element.content}
            className="w-full h-full border-0"
            allowFullScreen
            onError={handleError}
          />
        );
      
      case 'embedded-deck':
        if (!element.content) {
          return (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
              No deck selected
            </div>
          );
        }
        
        return (
          <EmbeddedDeckViewer
            deckId={element.content}
          />
        );
      
      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
            Unsupported media type: {element.type}
          </div>
        );
    }
  };

  return (
    <div
      className={`w-full h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        borderRadius: element.borderRadius || 0,
        overflow: 'hidden',
      }}
    >
      {renderContent()}
    </div>
  );
};
