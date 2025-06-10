
import React, { useRef, useEffect } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';

interface TextEditorInputProps {
  element: CanvasElement;
  textScale: number;
  onContentChange: (content: string) => void;
  onStopEditing: () => void;
}

export const TextEditorInput: React.FC<TextEditorInputProps> = ({
  element,
  textScale,
  onContentChange,
  onStopEditing,
}) => {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const textStyle = {
    fontSize: `${(element.fontSize || 16) * textScale}px`,
    color: element.color || '#000000',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
    textAlign: element.textAlign as React.CSSProperties['textAlign'] || 'center',
    lineHeight: '1.4',
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={element.content || ''}
      onChange={(e) => onContentChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onStopEditing();
        }
        e.stopPropagation();
      }}
      onBlur={onStopEditing}
      className="w-full h-full bg-transparent border-none outline-none resize-none"
      style={{
        ...textStyle,
        whiteSpace: 'pre-wrap',
        padding: '0',
      }}
      placeholder={t('editor.enterYourText')}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  );
};
