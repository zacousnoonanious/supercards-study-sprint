
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Copy, Move, RotateCw } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface HoverElementPopupProps {
  element: CanvasElement;
  position: { x: number; y: number };
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  isHovered: boolean;
}

export const HoverElementPopup: React.FC<HoverElementPopupProps> = ({
  element,
  position,
  onUpdate,
  onDelete,
  isHovered,
}) => {
  const [opacity, setOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isHovered) {
      // Show popup when element is hovered
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setOpacity(1);
      setIsVisible(true);
    } else {
      // Start fade out after a brief delay when not hovering
      timeoutRef.current = setTimeout(() => {
        setOpacity(0.3);
        // Hide completely after fade
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, 200);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpacity(1);
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (!isHovered) {
      timeoutRef.current = setTimeout(() => {
        setOpacity(0.3);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }, 200);
    }
  };

  if (!isVisible) return null;

  const renderQuickSettings = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Text</Label>
              <Textarea
                value={element.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                className="h-16 text-xs"
                placeholder="Enter text..."
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Bold</Label>
              <Switch
                checked={element.fontWeight === 'bold'}
                onCheckedChange={(checked) => onUpdate({ fontWeight: checked ? 'bold' : 'normal' })}
              />
            </div>
          </div>
        );
      case 'image':
        return (
          <div>
            <Label className="text-xs">Image URL</Label>
            <Input
              value={element.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              className="text-xs"
              placeholder="Enter image URL..."
            />
          </div>
        );
      case 'multiple-choice':
        return (
          <div>
            <Label className="text-xs">Question</Label>
            <Textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              className="h-16 text-xs"
              placeholder="Enter question..."
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={popupRef}
      className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-64 transition-opacity duration-300 pointer-events-auto"
      style={{
        left: position.x,
        top: position.y,
        opacity,
        zIndex: 100,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium capitalize">
          {element.type.replace('-', ' ')}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        {renderQuickSettings()}
        
        <div className="flex gap-2 pt-2 border-t">
          <div className="flex-1">
            <Label className="text-xs">Size</Label>
            <div className="flex gap-1">
              <Input
                type="number"
                value={element.width}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 0 })}
                className="h-6 text-xs"
                min="10"
              />
              <Input
                type="number"
                value={element.height}
                onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 0 })}
                className="h-6 text-xs"
                min="10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
