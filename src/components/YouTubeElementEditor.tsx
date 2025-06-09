
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/types/flashcard';

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
  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const handleUrlChange = (url: string) => {
    const videoId = extractVideoId(url);
    onUpdate({ 
      youtubeUrl: url,
      youtubeVideoId: videoId || undefined
    });
  };

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video Preview */}
      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded mb-2 relative overflow-hidden">
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
          <div className="text-center text-gray-400">
            <p style={{ fontSize: `${12 * textScale}px` }}>Enter YouTube URL below</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card className="mt-auto">
        <CardContent className="p-2 space-y-3">
          <div>
            <Label className="text-xs font-medium">YouTube URL</Label>
            <Input
              placeholder="https://www.youtube.com/watch?v=..."
              value={element.youtubeUrl || ''}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="h-7 text-xs"
            />
            {element.youtubeVideoId && (
              <p className="text-xs text-green-600 mt-1">✓ Valid YouTube URL</p>
            )}
          </div>

          <div>
            <Label className="text-xs font-medium">Start Time (seconds)</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="0"
                value={element.youtubeStartTime || ''}
                onChange={(e) => onUpdate({ youtubeStartTime: parseInt(e.target.value) || 0 })}
                min="0"
                className="h-7 text-xs flex-1"
              />
              {element.youtubeStartTime && (
                <span className="text-xs text-gray-500">
                  {formatTime(element.youtubeStartTime)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Autoplay</Label>
              <Switch
                checked={element.youtubeAutoplay || false}
                onCheckedChange={(checked) => onUpdate({ youtubeAutoplay: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Muted</Label>
              <Switch
                checked={element.youtubeMuted || false}
                onCheckedChange={(checked) => onUpdate({ youtubeMuted: checked })}
              />
            </div>
          </div>

          {element.youtubeUrl && !element.youtubeVideoId && (
            <div className="text-xs text-red-500 mt-2">
              Please enter a valid YouTube URL
            </div>
          )}

          <Button
            onClick={() => onUpdate({ youtubeUrl: '', youtubeVideoId: undefined })}
            variant="outline"
            size="sm"
            className="w-full text-xs"
          >
            Clear Video
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
