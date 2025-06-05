
import React, { useState, useRef, useCallback } from 'react';
import { CanvasElement, Flashcard } from '@/types/flashcard';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { QuizOnlyLayout } from './QuizOnlyLayout';
import { ElementPopupToolbar } from './ElementPopupToolbar';
import { CanvasContextMenu } from './CanvasContextMenu';
import { CanvasInteractionHandler } from './CanvasInteractionHandler';
import { CanvasBackground } from './CanvasBackground';
import { useTheme } from '@/contexts/ThemeContext';

interface CardCanvasProps {
  elements: CanvasElement[];
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  cardSide: 'front' | 'back';
  style?: React.CSSProperties;
  cardType?: Flashcard['card_type'];
  onAddElement?: (type: string, position?: number) => void;
  quizTitle?: string;
  onQuizTitleChange?: (title: string) => void;
}

export const CardCanvas: React.FC<CardCanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  cardSide,
  style = {},
  cardType = 'standard',
  onAddElement,
  quizTitle = '',
  onQuizTitleChange,
}) => {
  const { theme } = useTheme();
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [popupToolbar, setPopupToolbar] = useState<{ element: CanvasElement; position: { x: number; y: number } } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleQuizAddElement = (type: string, position: number) => {
    if (onAddElement) {
      // Set zIndex to position for quiz layout
      onAddElement(type);
      // Update the last added element's position
      setTimeout(() => {
        const lastElement = elements[elements.length - 1];
        if (lastElement) {
          onUpdateElement(lastElement.id, { zIndex: position });
        }
      }, 100);
    }
  };

  // For quiz-only cards, use the specialized layout
  if (cardType === 'quiz-only') {
    return (
      <div
        ref={canvasRef}
        className={`relative border-2 border-dashed rounded-lg ${
          theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
        }`}
        style={{ 
          width: '100%', 
          height: '600px',
          minHeight: '600px',
          ...style 
        }}
      >
        <QuizOnlyLayout
          elements={elements}
          onAddElement={handleQuizAddElement}
          onUpdateElement={onUpdateElement}
          title={quizTitle}
          onTitleChange={onQuizTitleChange || (() => {})}
        />
      </div>
    );
  }

  // For informational cards, make canvas taller to accommodate more content
  const canvasHeight = cardType === 'informational' ? '800px' : '533px';

  return (
    <div
      ref={canvasRef}
      className={`relative border-2 border-dashed overflow-hidden rounded-lg ${
        theme === 'dark' ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
      }`}
      style={{ 
        width: '800px', 
        height: canvasHeight,
        aspectRatio: cardType === 'informational' ? 'unset' : '3/2',
        ...style 
      }}
    >
      <CanvasBackground />
      
      <CanvasInteractionHandler
        elements={elements}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        onUpdateElement={onUpdateElement}
        onShowPopupToolbar={setPopupToolbar}
        onContextMenu={setContextMenu}
        canvasRef={canvasRef}
      />

      {/* Render elements */}
      {elements.map((element) => (
        <div
          key={element.id}
          className={`absolute cursor-move ${
            selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            transformOrigin: 'center',
            zIndex: element.zIndex || 0,
          }}
        >
          <CanvasElementRenderer
            element={element}
            editingElement={editingElement}
            onUpdateElement={onUpdateElement}
            onEditingChange={setEditingElement}
          />
        </div>
      ))}

      {/* Popup Toolbar */}
      {popupToolbar && (
        <ElementPopupToolbar
          element={popupToolbar.element}
          onUpdate={(updates) => onUpdateElement(popupToolbar.element.id, updates)}
          onDelete={() => {
            onDeleteElement(popupToolbar.element.id);
            setPopupToolbar(null);
          }}
          position={popupToolbar.position}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <CanvasContextMenu
          position={contextMenu}
          onClose={() => setContextMenu(null)}
          onAddElement={onAddElement || (() => {})}
        />
      )}
    </div>
  );
};
