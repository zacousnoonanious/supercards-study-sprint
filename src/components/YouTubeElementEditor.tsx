
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface YouTubeElementEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  textScale?: number;
}

export const YouTubeElementEditor: React.FC<YouTubeElementEditorProps> = ({
  element,
  onUpdate,
  textScale = 1
}) => {
  const { t } = useI18n();

  const getEmbedUrl = () => {
    if (!element.youtubeVideoId) return '';
    
    let embedUrl = `https://www.youtube.com/embed/${element.youtubeVideoId}?`;
    const params = [];
    
    if (element.youtubeAutoplay) {
      params.push('autoplay=1');
    }
    
    if (element.youtubeMuted) {
      params.push('mute=1');
    }
    
    if (element.youtubeStartTime) {
      params.push(`start=${element.youtubeStartTime}`);
    }
    
    return embedUrl + params.join('&');
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video Preview */}
      <div 
        className="flex-1 flex items-center justify-center rounded relative overflow-hidden"
        style={{
          opacity: element.opacity || 1,
          borderWidth: element.borderWidth || 0,
          borderColor: element.borderColor || '#d1d5db',
          borderStyle: element.borderWidth ? 'solid' : 'none',
          borderRadius: element.borderRadius ? '8px' : '0px',
        }}
      >
        {element.youtubeVideoId ? (
          <iframe
            src={getEmbedUrl()}
            title="YouTube video player"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="text-center text-gray-400 p-4">
            <p style={{ fontSize: `${12 * textScale}px` }}>{t('editor.noVideoSelected')}</p>
            <p style={{ fontSize: `${10 * textScale}px` }}>{t('editor.configureInSidebar')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
