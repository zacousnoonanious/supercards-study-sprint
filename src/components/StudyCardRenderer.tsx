
import React from 'react';
import { CanvasElement } from '@/types/flashcard';

interface StudyCardRendererProps {
  elements: CanvasElement[];
  className?: string;
}

export const StudyCardRenderer: React.FC<StudyCardRendererProps> = ({ elements, className = '' }) => {
  const getTextStyle = (element: CanvasElement) => ({
    fontSize: element.fontSize,
    color: element.color,
    fontWeight: element.fontWeight,
    fontStyle: element.fontStyle,
    textDecoration: element.textDecoration,
    textAlign: element.textAlign as any,
  });

  return (
    <div className={`relative bg-white border rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '3/2', minHeight: '300px' }}>
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: 'auto', // Changed from element.height to auto
            minHeight: element.height, // Keep original height as minimum
            transform: `rotate(${element.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {element.type === 'text' ? (
            <div
              className="w-full h-full flex items-center justify-center p-2"
              style={{
                ...getTextStyle(element),
                wordWrap: 'break-word',
                overflow: 'visible',
                whiteSpace: 'normal',
              }}
            >
              <span className="w-full text-center leading-normal">{element.content}</span>
            </div>
          ) : (
            <img
              src={element.imageUrl}
              alt="Element"
              className="w-full h-full object-cover rounded"
              draggable={false}
            />
          )}
        </div>
      ))}
    </div>
  );
};
