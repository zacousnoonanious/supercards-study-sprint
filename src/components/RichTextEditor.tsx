
import React, { useState } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { TTSComponent } from './TTSComponent';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { TextEditorDisplay } from './text-editor/TextEditorDisplay';
import { TextEditorInput } from './text-editor/TextEditorInput';
import { useTextEditorInteractions } from './text-editor/useTextEditorInteractions';
import { useTextElementKeyboard } from './text-editor/useTextElementKeyboard';

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

  const {
    showToolbar,
    setShowToolbar,
    startEditing,
    stopEditing,
    handleMouseDown,
    handleMouseUp,
    handleClick,
    handleDoubleClick,
  } = useTextEditorInteractions({
    isStudyMode,
    isEditing,
    onEditingChange: (editing) => {
      setIsEditing(editing);
      onEditingChange(editing);
    },
    element,
  });

  useTextElementKeyboard({
    isSelected,
    isEditing,
    elementId: element.id,
  });

  const handleContentChange = (content: string) => {
    onUpdate({ content });
    
    // Auto-resize based on content
    const lines = content.split('\n').length;
    const longestLine = Math.max(...content.split('\n').map(line => line.length));
    
    const fontSize = (element.fontSize || 16) * textScale;
    const newWidth = Math.max(100, Math.min(700, longestLine * fontSize * 0.6 + 32));
    const newHeight = Math.max(40, lines * fontSize * 1.4 + 20);
    
    if (newWidth !== element.width || newHeight !== element.height) {
      onUpdate({ width: newWidth, height: newHeight });
    }
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
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isStudyMode) {
            startEditing();
          }
        }}
      >
        {isEditing ? (
          <TextEditorInput
            element={element}
            textScale={textScale}
            onContentChange={handleContentChange}
            onStopEditing={stopEditing}
          />
        ) : (
          <TextEditorDisplay
            element={element}
            textScale={textScale}
            onTextSelectionStart={onTextSelectionStart}
            onTextSelectionEnd={onTextSelectionEnd}
          />
        )}
      </div>
    </div>
  );
};
