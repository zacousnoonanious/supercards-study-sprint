
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Save, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { FlashcardSet } from '@/types/flashcard';
import { EditableDeckTitle } from './EditableDeckTitle';

interface EditorHeaderProps {
  set: FlashcardSet;
  onSave: () => void;
  isEditingDeckName: boolean;
  deckName: string;
  onDeckNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateDeckTitle: (title: string) => Promise<void>;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToArea?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  set,
  onSave,
  isEditingDeckName,
  deckName,
  onDeckNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onUpdateDeckTitle,
  zoom,
  onZoomChange,
  onFitToArea,
}) => {
  const [zoomInput, setZoomInput] = useState(Math.round(zoom * 100).toString());

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    onZoomChange(newZoom);
    setZoomInput(Math.round(newZoom * 100).toString());
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom * 0.8, 0.1);
    onZoomChange(newZoom);
    setZoomInput(Math.round(newZoom * 100).toString());
  };

  const handleZoomInputChange = (value: string) => {
    setZoomInput(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 300) {
      onZoomChange(numValue / 100);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-14">
      <div className="flex items-center space-x-4">
        <EditableDeckTitle
          title={deckName}
          onTitleUpdate={onUpdateDeckTitle}
          className="text-lg font-semibold"
        />
        
        <Separator orientation="vertical" className="h-6" />
        
        <div className="text-sm text-muted-foreground">
          Created: {new Date(set.created_at).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            <Input
              type="text"
              value={zoomInput}
              onChange={(e) => handleZoomInputChange(e.target.value)}
              className="w-16 h-8 text-center text-sm"
              onBlur={() => setZoomInput(Math.round(zoom * 100).toString())}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {onFitToArea && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFitToArea}
              title="Fit to area"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />
        
        <Button onClick={onSave} variant="default" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};
