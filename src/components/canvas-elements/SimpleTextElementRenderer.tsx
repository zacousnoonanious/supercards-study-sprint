
import React from 'react';
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

  const content = (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer ${
        isStudyMode ? 'hover:bg-gray-50 rounded' : ''
      }`}
      style={textStyle}
      onClick={handleClick}
    >
      <div 
        className="w-full h-full flex items-center justify-center whitespace-pre-wrap break-words"
        style={{ textAlign: textStyle.textAlign }}
      >
        {element.content || 'Click to edit text'}
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
