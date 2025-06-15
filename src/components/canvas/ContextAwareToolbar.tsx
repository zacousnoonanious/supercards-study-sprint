
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  Type,
  Volume2,
  Play,
  Pause,
  RotateCw,
  Copy,
  Trash2,
  Link,
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface ContextAwareToolbarProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextAwareToolbar: React.FC<ContextAwareToolbarProps> = ({
  element,
  onUpdate,
  onDelete,
  onDuplicate,
  position,
  onClose,
}) => {
  const renderTextControls = () => (
    <div className="flex items-center gap-1">
      {/* Text Styling */}
      <Button
        variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ 
          fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
        })}
        className="h-8 w-8 p-0"
      >
        <Bold className="w-4 h-4" />
      </Button>
      
      <Button
        variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ 
          fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' 
        })}
        className="h-8 w-8 p-0"
      >
        <Italic className="w-4 h-4" />
      </Button>
      
      <Button
        variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ 
          textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
        })}
        className="h-8 w-8 p-0"
      >
        <Underline className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Text Alignment */}
      <Button
        variant={element.textAlign === 'left' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ textAlign: 'left' })}
        className="h-8 w-8 p-0"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant={element.textAlign === 'center' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ textAlign: 'center' })}
        className="h-8 w-8 p-0"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      
      <Button
        variant={element.textAlign === 'right' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onUpdate({ textAlign: 'right' })}
        className="h-8 w-8 p-0"
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <Type className="w-4 h-4" />
        <Input
          type="number"
          value={element.fontSize || 16}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-16 h-8"
          min="8"
          max="72"
        />
      </div>

      {/* Text Color */}
      <div className="flex items-center gap-1">
        <Palette className="w-4 h-4" />
        <Input
          type="color"
          value={element.color || '#000000'}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="w-8 h-8 p-0 border-0"
        />
      </div>

      {/* Font Family */}
      <Select
        value={element.fontFamily || 'Arial'}
        onValueChange={(value) => onUpdate({ fontFamily: value })}
      >
        <SelectTrigger className="w-24 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Arial">Arial</SelectItem>
          <SelectItem value="Times New Roman">Times</SelectItem>
          <SelectItem value="Helvetica">Helvetica</SelectItem>
          <SelectItem value="Georgia">Georgia</SelectItem>
          <SelectItem value="Verdana">Verdana</SelectItem>
          <SelectItem value="Courier New">Courier</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const renderImageControls = () => (
    <div className="flex items-center gap-1">
      <ImageIcon className="w-4 h-4" />
      <Input
        placeholder="Image URL or upload"
        value={element.imageUrl || element.content || ''}
        onChange={(e) => onUpdate({ imageUrl: e.target.value })}
        className="w-48 h-8"
      />
      
      <Separator orientation="vertical" className="h-6" />
      
      {/* Link */}
      <div className="flex items-center gap-1">
        <Link className="w-4 h-4" />
        <Input
          placeholder="Link URL"
          value={element.hyperlink || ''}
          onChange={(e) => onUpdate({ hyperlink: e.target.value })}
          className="w-32 h-8"
        />
      </div>
    </div>
  );

  const renderAudioControls = () => (
    <div className="flex items-center gap-1">
      <Volume2 className="w-4 h-4" />
      <Input
        placeholder="Audio URL"
        value={element.audioUrl || element.content || ''}
        onChange={(e) => onUpdate({ audioUrl: e.target.value })}
        className="w-48 h-8"
      />
      
      <Button
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <Play className="w-4 h-4" />
      </Button>
    </div>
  );

  const renderInteractiveControls = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {element.type === 'multiple-choice' ? 'Multiple Choice' : 
         element.type === 'true-false' ? 'True/False' : 'Fill in Blank'}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => {
          // Open detailed editor for interactive elements
          console.log('Open detailed editor for', element.type);
        }}
      >
        Edit Options
      </Button>
    </div>
  );

  const renderCommonControls = () => (
    <div className="flex items-center gap-1">
      <Separator orientation="vertical" className="h-6" />
      
      {/* Rotation */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUpdate({ rotation: ((element.rotation || 0) + 90) % 360 })}
        className="h-8 w-8 p-0"
        title="Rotate 90°"
      >
        <RotateCw className="w-4 h-4" />
      </Button>

      {/* Layer controls */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onUpdate({ zIndex: (element.zIndex || 0) + 1 })}
        className="h-8 w-8 p-0"
        title="Bring Forward"
      >
        <Layers className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Duplicate */}
      <Button
        variant="outline"
        size="sm"
        onClick={onDuplicate}
        className="h-8 w-8 p-0"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </Button>

      {/* Delete */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <div
      className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50 animate-scale-in"
      style={{
        left: position.x,
        top: position.y - 60, // Position above the element
        minWidth: 'fit-content',
      }}
      onMouseLeave={onClose}
    >
      <div className="flex items-center gap-2">
        {/* Element-specific controls */}
        {element.type === 'text' && renderTextControls()}
        {element.type === 'image' && renderImageControls()}
        {element.type === 'audio' && renderAudioControls()}
        {(element.type === 'multiple-choice' || element.type === 'true-false' || element.type === 'fill-in-blank') && renderInteractiveControls()}
        
        {/* Common controls for all elements */}
        {renderCommonControls()}
      </div>
      
      {/* Tooltip arrow */}
      <div className="absolute left-4 bottom-0 transform translate-y-full">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
      </div>
    </div>
  );
};
