
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Paintbrush, Eraser, RotateCcw, X, GripVertical } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DrawingToolsPopupProps {
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  onClose: () => void;
  strokeColor: string;
  strokeWidth: number;
  tool: 'brush' | 'eraser';
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onToolChange: (tool: 'brush' | 'eraser') => void;
  onClear: () => void;
}

export const DrawingToolsPopup: React.FC<DrawingToolsPopupProps> = ({
  position,
  onPositionChange,
  onClose,
  strokeColor,
  strokeWidth,
  tool,
  onStrokeColorChange,
  onStrokeWidthChange,
  onToolChange,
  onClear,
}) => {
  const { theme } = useTheme();
  const isDarkTheme = theme === 'dark' || theme === 'darcula' || theme === 'console';
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    onPositionChange({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <Card
      className={`fixed z-50 w-72 shadow-lg ${isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}`}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <CardContent className="p-4">
        <div
          className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <span className={`text-sm font-medium ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
              Drawing Tools
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={tool === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('brush')}
              className="flex items-center gap-2"
            >
              <Paintbrush className="w-4 h-4" />
              Brush
            </Button>
            <Button
              variant={tool === 'eraser' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToolChange('eraser')}
              className="flex items-center gap-2"
            >
              <Eraser className="w-4 h-4" />
              Eraser
            </Button>
          </div>

          <div>
            <Label className={`text-sm ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
              Size: {strokeWidth}
            </Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={(value) => onStrokeWidthChange(value[0])}
              max={20}
              min={1}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label className={`text-sm ${isDarkTheme ? 'text-gray-200' : 'text-gray-700'}`}>
              Color
            </Label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => onStrokeColorChange(e.target.value)}
                className="w-8 h-8 rounded border"
              />
              <span className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                {strokeColor}
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear Canvas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
