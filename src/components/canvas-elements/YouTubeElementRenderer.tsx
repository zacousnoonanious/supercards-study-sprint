
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface YouTubeElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  zoom: number;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const YouTubeElementRenderer: React.FC<YouTubeElementRendererProps> = ({
  element,
  isSelected,
  zoom,
  onUpdateElement,
}) => {
  const videoId = element.youtubeVideoId || element.videoId;
  
  if (!videoId) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 border rounded ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <span className="text-gray-500 text-sm">No YouTube video</span>
      </div>
    );
  }

  return (
    <div className={`w-full h-full ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}${element.youtubeAutoplay ? '?autoplay=1' : ''}`}
        className="w-full h-full rounded"
        allowFullScreen
        title="YouTube video"
      />
    </div>
  );
};
