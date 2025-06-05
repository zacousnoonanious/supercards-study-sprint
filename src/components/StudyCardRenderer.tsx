
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
    <div className={`relative bg-white border rounded-lg overflow-hidden ${className}`} style={{ aspectRatio: '3/2', minHeight: '200px' }}>
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${(element.x / 800) * 100}%`,
            top: `${(element.y / 533) * 100}%`,
            width: `${(element.width / 800) * 100}%`,
            height: 'auto',
            minHeight: `${(element.height / 533) * 100}%`,
            transform: `rotate(${element.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          {element.type === 'text' ? (
            <div
              className="w-full h-full flex items-center justify-center p-1 sm:p-2"
              style={{
                ...getTextStyle(element),
                wordWrap: 'break-word',
                overflow: 'visible',
                whiteSpace: 'normal',
                fontSize: `clamp(${Math.max(10, (element.fontSize || 16) * 0.6)}px, ${element.fontSize || 16}px, ${(element.fontSize || 16) * 1.2}px)`,
              }}
            >
              <span className="w-full text-center leading-normal break-words">{element.content}</span>
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
