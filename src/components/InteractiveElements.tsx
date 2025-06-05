
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CanvasElement } from '@/types/flashcard';

interface ElementRendererProps {
  element: CanvasElement;
  isEditing?: boolean;
}

export const MultipleChoiceRenderer: React.FC<ElementRendererProps> = ({ element, isEditing }) => {
  const options = element.multipleChoiceOptions || ['Option 1', 'Option 2'];
  
  return (
    <Card className="w-full h-full">
      <CardContent className="p-3">
        {element.content && (
          <div className="mb-3 text-sm font-medium">{element.content}</div>
        )}
        <RadioGroup defaultValue="0" className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value={index.toString()} id={`option-${index}`} />
              <Label htmlFor={`option-${index}`} className="text-xs cursor-pointer">
                {option}
              </Label>
              {isEditing && element.correctAnswer === index && (
                <span className="text-xs text-green-600 font-medium">✓</span>
              )}
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export const TrueFalseRenderer: React.FC<ElementRendererProps> = ({ element, isEditing }) => {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-3">
        {element.content && (
          <div className="mb-3 text-sm">{element.content}</div>
        )}
        <div className="flex gap-2">
          <Button 
            variant={isEditing && element.correctAnswer === 1 ? 'default' : 'outline'} 
            size="sm"
            className="flex-1 text-xs"
          >
            True {isEditing && element.correctAnswer === 1 && '✓'}
          </Button>
          <Button 
            variant={isEditing && element.correctAnswer === 0 ? 'default' : 'outline'} 
            size="sm"
            className="flex-1 text-xs"
          >
            False {isEditing && element.correctAnswer === 0 && '✓'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const YouTubeRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  const getEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return '';
    return `https://www.youtube.com/embed/${videoId}${element.autoplay ? '?autoplay=1' : ''}`;
  };

  const embedUrl = element.youtubeUrl ? getEmbedUrl(element.youtubeUrl) : '';

  return (
    <Card className="w-full h-full">
      <CardContent className="p-2">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full rounded"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-gray-100 rounded">
            YouTube Video
            <br />
            {element.youtubeUrl ? 'Invalid URL' : 'No URL set'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DeckEmbedRenderer: React.FC<ElementRendererProps> = ({ element }) => {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-3">
        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-blue-50 rounded border-2 border-dashed border-blue-200">
          <div className="text-sm font-medium text-blue-700 mb-1">
            📚 Embedded Deck
          </div>
          {element.deckTitle && (
            <div className="text-xs text-blue-600 mb-2">{element.deckTitle}</div>
          )}
          {element.deckId ? (
            <div className="text-xs text-gray-500">ID: {element.deckId}</div>
          ) : (
            <div className="text-xs text-gray-400">No deck selected</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
