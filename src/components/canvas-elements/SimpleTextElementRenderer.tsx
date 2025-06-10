
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface SimpleTextElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme: boolean;
}

export const SimpleTextElementRenderer: React.FC<SimpleTextElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
  isDarkTheme,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getTextColor = () => {
    return element.color || (isDarkTheme ? '#ffffff' : '#000000');
  };

  const textStyle = {
    fontSize: `${(element.fontSize || 16) * textScale}px`,
    color: getTextColor(),
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
    textAlign: element.textAlign as React.CSSProperties['textAlign'] || 'center',
    fontFamily: element.fontFamily || 'Arial',
    backgroundColor: element.backgroundColor || 'transparent',
    lineHeight: '1.4',
    padding: '8px',
    borderRadius: '4px',
    border: element.hasTTS ? '1px solid #3b82f6' : '1px solid transparent',
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isStudyMode && onElementSelect) {
      e.stopPropagation();
      onElementSelect(element.id);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isStudyMode) {
      e.stopPropagation();
      setIsEditing(true);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onUpdateElement(element.id, { content: newContent });
    
    // Auto-resize based on content
    const lines = newContent.split('\n').length;
    const longestLine = Math.max(...newContent.split('\n').map(line => line.length));
    
    const fontSize = (element.fontSize || 16) * textScale;
    const newWidth = Math.max(100, Math.min(700, longestLine * fontSize * 0.6 + 32));
    const newHeight = Math.max(40, lines * fontSize * 1.4 + 20);
    
    if (newWidth !== element.width || newHeight !== element.height) {
      onUpdateElement(element.id, { width: newWidth, height: newHeight });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
    // Allow normal text editing shortcuts
    e.stopPropagation();
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  // Focus and select text when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const content = isEditing ? (
    <textarea
      ref={textareaRef}
      value={element.content || ''}
      onChange={handleTextChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="w-full h-full bg-transparent border-none outline-none resize-none"
      style={{
        ...textStyle,
        whiteSpace: 'pre-wrap',
        padding: '8px',
      }}
      placeholder="Enter your text..."
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    />
  ) : (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer ${
        isStudyMode ? 'hover:bg-gray-50 rounded' : ''
      }`}
      style={textStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div 
        className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
        style={{ textAlign: textStyle.textAlign }}
      >
        {element.content || 'Double-click to edit text'}
      </div>
    </div>
  );

  return element.hyperlink ? (
    <a 
      href={element.hyperlink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full h-full block"
      onClick={(e) => e.stopPropagation()}
    >
      {content}
    </a>
  ) : (
    content
  );
};
