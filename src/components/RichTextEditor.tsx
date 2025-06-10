
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { TTSComponent } from './TTSComponent';
import { ElementPopupToolbar } from './ElementPopupToolbar';

interface RichTextEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onEditingChange: (editing: boolean) => void;
  textScale?: number;
  isStudyMode?: boolean;
  onTextSelectionStart?: () => void;
  onTextSelectionEnd?: () => void;
  isSelected?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  element,
  onUpdate,
  onEditingChange,
  textScale = 1,
  isStudyMode = false,
  onTextSelectionStart,
  onTextSelectionEnd,
  isSelected = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarTimer, setToolbarTimer] = useState<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);

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
    if (isStudyMode && element.hasTTS && element.ttsEnabled) {
      return;
    }
    setIsEditing(true);
    onEditingChange(true);
    setShowToolbar(false);
  };

  const stopEditing = () => {
    setIsEditing(false);
    onEditingChange(false);
  };

  // Handle toolbar visibility with proper timing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isEditing || isStudyMode) return;
    
    // Clear any existing timer
    if (toolbarTimer) {
      clearTimeout(toolbarTimer);
      setToolbarTimer(null);
    }
    
    // Set a timer to show toolbar after hold
    const timer = setTimeout(() => {
      setShowToolbar(true);
    }, 300);
    
    setToolbarTimer(timer);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clear timer if mouse is released quickly
    if (toolbarTimer) {
      clearTimeout(toolbarTimer);
      setToolbarTimer(null);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isEditing && !showToolbar) {
      startEditing();
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  // Handle keyboard events for selected text elements
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && !isEditing && e.key === 'Delete') {
        e.preventDefault();
        console.log('Delete key pressed for text element:', element.id);
        // This will be handled by the parent component through onDeleteElement
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSelected, isEditing, element.id]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle text selection monitoring
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && textDisplayRef.current) {
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const isWithinElement = range && textDisplayRef.current.contains(range.commonAncestorContainer);
        
        if (isWithinElement && selection.toString().length > 0) {
          onTextSelectionStart?.();
        } else if (selection.toString().length === 0) {
          onTextSelectionEnd?.();
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [onTextSelectionStart, onTextSelectionEnd]);

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
      {/* TTS Component */}
      {element.hasTTS && (
        <div className="absolute top-0 right-0 z-10 bg-white/80 rounded-bl">
          <TTSComponent
            element={element}
            onUpdate={onUpdate}
            isEditing={isEditing}
            autoplay={isStudyMode}
          />
        </div>
      )}

      {/* Popup Toolbar */}
      {showToolbar && !isEditing && (
        <div className="absolute top-0 left-0 z-20">
          <ElementPopupToolbar
            element={element}
            onUpdate={onUpdate}
            onClose={() => setShowToolbar(false)}
          />
        </div>
      )}

      {/* Text Content */}
      <div
        className={`w-full h-full flex items-center justify-center border rounded cursor-text bg-background ${
          element.hasTTS ? 'border-blue-200' : ''
        } ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
        style={{ padding: '8px' }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
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
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            ref={textDisplayRef}
            className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
            style={textStyle}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            {element.content || 'Click to edit text'}
          </div>
        )}
      </div>
    </div>
  );
};
