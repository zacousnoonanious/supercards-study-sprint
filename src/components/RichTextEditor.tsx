
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, Type } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface RichTextEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onEditingChange: (editing: boolean) => void;
  textScale?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  element,
  onUpdate,
  onEditingChange,
  textScale = 1,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleToggleStyle = (style: 'bold' | 'italic' | 'underline') => {
    switch (style) {
      case 'bold':
        onUpdate({ fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' });
        break;
      case 'italic':
        onUpdate({ fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' });
        break;
      case 'underline':
        onUpdate({ 
          textDecoration: element.textDecoration === 'underline' ? 'none' : 'underline' 
        });
        break;
    }
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    onUpdate({ textAlign: alignment });
  };

  const handleFontSizeChange = (size: string) => {
    onUpdate({ fontSize: parseInt(size) });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handleContentChange = (content: string) => {
    onUpdate({ content });
    
    // Auto-resize based on content
    if (textareaRef.current) {
      const lines = content.split('\n').length;
      const longestLine = Math.max(...content.split('\n').map(line => line.length));
      
      const fontSize = (element.fontSize || 16) * textScale;
      const newWidth = Math.max(100, Math.min(700, longestLine * fontSize * 0.6 + 32));
      const newHeight = Math.max(40, lines * fontSize * 1.4 + 20);
      
      if (newWidth !== element.width || newHeight !== element.height) {
        onUpdate({ width: newWidth, height: newHeight });
      }
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setShowToolbar(true);
    onEditingChange(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
    setShowToolbar(false);
    onEditingChange(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const textStyle = {
    fontSize: `${(element.fontSize || 16) * textScale}px`,
    color: element.color || '#000000',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
    textAlign: element.textAlign as React.CSSProperties['textAlign'] || 'center',
    lineHeight: '1.4',
  };

  return (
    <div className="w-full h-full relative">
      {/* Formatting Toolbar */}
      {showToolbar && (
        <div className="absolute -top-12 left-0 right-0 z-50 bg-background border rounded-md shadow-lg p-2 flex items-center gap-1 flex-wrap">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Button
              variant={element.fontWeight === 'bold' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleStyle('bold')}
            >
              <Bold className="w-3 h-3" />
            </Button>
            <Button
              variant={element.fontStyle === 'italic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleStyle('italic')}
            >
              <Italic className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textDecoration === 'underline' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleToggleStyle('underline')}
            >
              <Underline className="w-3 h-3" />
            </Button>
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Type className="w-3 h-3" />
            <Select value={(element.fontSize || 16).toString()} onValueChange={handleFontSizeChange}>
              <SelectTrigger className="w-16 h-7">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="14">14</SelectItem>
                <SelectItem value="16">16</SelectItem>
                <SelectItem value="18">18</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="28">28</SelectItem>
                <SelectItem value="32">32</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-1 border-r pr-2">
            <Palette className="w-3 h-3" />
            <Input
              type="color"
              value={element.color || '#000000'}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-8 h-7 p-1 border rounded"
            />
          </div>

          {/* Text Alignment */}
          <div className="flex items-center gap-1">
            <Button
              variant={element.textAlign === 'left' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('left')}
            >
              <AlignLeft className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'center' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('center')}
            >
              <AlignCenter className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'right' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('right')}
            >
              <AlignRight className="w-3 h-3" />
            </Button>
            <Button
              variant={element.textAlign === 'justify' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleAlignmentChange('justify')}
            >
              <AlignJustify className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Text Content */}
      <div
        className="w-full h-full flex items-center justify-center border rounded cursor-text bg-background"
        style={{ padding: '8px' }}
        onClick={startEditing}
        onDoubleClick={startEditing}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={element.content || ''}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                stopEditing();
              }
              e.stopPropagation();
            }}
            onBlur={stopEditing}
            className="w-full h-full bg-transparent border-none outline-none resize-none"
            style={{
              ...textStyle,
              whiteSpace: 'pre-wrap',
              padding: '0',
            }}
            placeholder="Enter your text..."
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
            style={textStyle}
          >
            {element.content || 'Click to edit text'}
          </div>
        )}
      </div>
    </div>
  );
};
