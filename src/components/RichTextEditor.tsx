
import React, { useState, useRef, useEffect } from 'react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    onEditingChange(true);
  };

  const stopEditing = () => {
    setIsEditing(false);
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
