
import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { TTSComponent } from './TTSComponent';

interface RichTextEditorProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onEditingChange: (editing: boolean) => void;
  textScale?: number;
  isStudyMode?: boolean;
  onTextSelectionStart?: () => void;
  onTextSelectionEnd?: () => void;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  element,
  onUpdate,
  onEditingChange,
  textScale = 1,
  isStudyMode = false,
  onTextSelectionStart,
  onTextSelectionEnd,
}) => {
  const [isEditing, setIsEditing] = useState(false);
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
      // In study mode with TTS, clicking should play audio instead of editing
      return;
    }
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

      {/* Text Content */}
      <div
        className={`w-full h-full flex items-center justify-center border rounded cursor-text bg-background ${
          element.hasTTS ? 'border-blue-200' : ''
        }`}
        style={{ padding: '8px' }}
        onClick={(e) => {
          e.stopPropagation(); // Prevent canvas deselection
          startEditing();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation(); // Prevent canvas deselection
          startEditing();
        }}
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
