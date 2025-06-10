
import React, { useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface TextEditorDisplayProps {
  element: CanvasElement;
  textScale: number;
  onTextSelectionStart?: () => void;
  onTextSelectionEnd?: () => void;
}

export const TextEditorDisplay: React.FC<TextEditorDisplayProps> = ({
  element,
  textScale,
  onTextSelectionStart,
  onTextSelectionEnd,
}) => {
  const { t } = useI18n();
  const textDisplayRef = useRef<HTMLDivElement>(null);

  const textStyle = {
    fontSize: `${(element.fontSize || 16) * textScale}px`,
    color: element.color || '#000000',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
    textAlign: element.textAlign as React.CSSProperties['textAlign'] || 'center',
    lineHeight: '1.4',
  };

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

  return (
    <div
      ref={textDisplayRef}
      className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
      style={textStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
    >
      {element.content || (t('editor.clickToEditText') || 'Click to edit text')}
    </div>
  );
};
