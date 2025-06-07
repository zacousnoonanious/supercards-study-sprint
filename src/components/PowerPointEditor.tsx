
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';
import { MultipleChoiceRenderer, TrueFalseRenderer, YouTubeRenderer, DeckEmbedRenderer } from './InteractiveElements';
import { FillInBlankEditor } from './FillInBlankEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

interface PowerPointEditorProps {
  elements: CanvasElement[];
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onAddElement: (type: string) => void;
  onDeleteElement: (id: string) => void;
  cardWidth: number;
  cardHeight: number;
  selectedElementId?: string | null;
  onElementSelect?: (id: string | null) => void;
  showGrid?: boolean;
}

export const PowerPointEditor: React.FC<PowerPointEditorProps> = ({
  elements,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  cardWidth,
  cardHeight,
  selectedElementId,
  onElementSelect,
  showGrid = true,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    dragStart: { x: number; y: number };
    elementStart: { x: number; y: number };
    elementId: string;
  } | null>(null);
  const [resizeState, setResizeState] = useState<{
    isResizing: boolean;
    resizeStart: { x: number; y: number };
    elementStart: { width: number; height: number; x: number; y: number };
    elementId: string;
    handle: string;
  } | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [elementPopups, setElementPopups] = useState<{ [key: string]: boolean }>({});

  // Handle mouse events for dragging and resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, handle?: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    onElementSelect?.(elementId);
    
    if (handle) {
      // Start resizing
      setResizeState({
        isResizing: true,
        resizeStart: { x: e.clientX, y: e.clientY },
        elementStart: { 
          width: element.width, 
          height: element.height,
          x: element.x,
          y: element.y
        },
        elementId,
        handle
      });
    } else {
      // Start dragging
      setDragState({
        isDragging: true,
        dragStart: { x: e.clientX, y: e.clientY },
        elementStart: { x: element.x, y: element.y },
        elementId
      });
    }
  }, [elements, onElementSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState?.isDragging) {
      const deltaX = e.clientX - dragState.dragStart.x;
      const deltaY = e.clientY - dragState.dragStart.y;
      
      const newX = Math.max(0, Math.min(dragState.elementStart.x + deltaX, cardWidth - 50));
      const newY = Math.max(0, Math.min(dragState.elementStart.y + deltaY, cardHeight - 30));
      
      onUpdateElement(dragState.elementId, { x: newX, y: newY });
    }
    
    if (resizeState?.isResizing) {
      const deltaX = e.clientX - resizeState.resizeStart.x;
      const deltaY = e.clientY - resizeState.resizeStart.y;
      
      let newWidth = resizeState.elementStart.width;
      let newHeight = resizeState.elementStart.height;
      let newX = resizeState.elementStart.x;
      let newY = resizeState.elementStart.y;
      
      const handle = resizeState.handle;
      
      if (handle.includes('e')) {
        newWidth = Math.max(50, resizeState.elementStart.width + deltaX);
      }
      if (handle.includes('w')) {
        newWidth = Math.max(50, resizeState.elementStart.width - deltaX);
        newX = resizeState.elementStart.x + deltaX;
      }
      if (handle.includes('s')) {
        newHeight = Math.max(30, resizeState.elementStart.height + deltaY);
      }
      if (handle.includes('n')) {
        newHeight = Math.max(30, resizeState.elementStart.height - deltaY);
        newY = resizeState.elementStart.y + deltaY;
      }
      
      onUpdateElement(resizeState.elementId, { 
        width: newWidth, 
        height: newHeight,
        x: newX,
        y: newY
      });
    }
  }, [dragState, resizeState, cardWidth, cardHeight, onUpdateElement]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setResizeState(null);
  }, []);

  const handleDoubleClick = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const element = elements.find(el => el.id === elementId);
    if (element?.type === 'text') {
      setEditingElementId(elementId);
    } else {
      // Show popup for other element types
      setElementPopups(prev => ({ ...prev, [elementId]: true }));
    }
  };

  const handleTextEdit = (elementId: string, newContent: string) => {
    onUpdateElement(elementId, { content: newContent });
    setEditingElementId(null);
  };

  const closeElementPopup = (elementId: string) => {
    setElementPopups(prev => ({ ...prev, [elementId]: false }));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onElementSelect?.(null);
      setEditingElementId(null);
    }
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      // Add text element at click position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left - 100; // Center the text element
        const y = e.clientY - rect.top - 30;
        
        const newElement: CanvasElement = {
          id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'text',
          x: Math.max(0, Math.min(x, cardWidth - 200)),
          y: Math.max(0, Math.min(y, cardHeight - 60)),
          width: 200,
          height: 60,
          content: 'New Text',
          fontSize: 16,
          color: '#000000',
          textAlign: 'center',
          zIndex: elements.length + 1,
        };
        
        // We'll add the element through the parent component
        onAddElement('text');
        // Then immediately select it
        setTimeout(() => {
          onElementSelect?.(newElement.id);
          setEditingElementId(newElement.id);
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (dragState?.isDragging || resizeState?.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState, handleMouseMove, handleMouseUp]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedElementId) {
        e.preventDefault();
        onDeleteElement(selectedElementId);
        onElementSelect?.(null);
      }
      if (e.key === 'Escape') {
        setEditingElementId(null);
        onElementSelect?.(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, onDeleteElement, onElementSelect]);

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElementId === element.id;
    const isEditing = editingElementId === element.id;
    const showPopup = elementPopups[element.id];
    
    return (
      <div key={element.id}>
        <div
          className={`absolute cursor-move border-2 ${
            isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-transparent hover:border-gray-300'
          } ${isEditing ? 'cursor-text' : ''}`}
          style={{
            left: element.x,
            top: element.y,
            width: element.width,
            height: element.height,
            transform: `rotate(${element.rotation || 0}deg)`,
            zIndex: element.zIndex || 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onElementSelect?.(element.id);
          }}
          onDoubleClick={(e) => handleDoubleClick(e, element.id)}
          onMouseDown={(e) => !isEditing && handleMouseDown(e, element.id)}
        >
          {/* Element content based on type */}
          {element.type === 'text' && (
            <div
              className="w-full h-full flex items-center justify-center bg-white/90 rounded shadow-sm border"
              style={{
                fontSize: element.fontSize || 16,
                color: element.color || '#000000',
                fontWeight: element.fontWeight || 'normal',
                fontStyle: element.fontStyle || 'normal',
                textDecoration: element.textDecoration || 'none',
                textAlign: element.textAlign || 'center',
                padding: '8px',
              }}
            >
              {isEditing ? (
                <textarea
                  className="w-full h-full bg-transparent border-none outline-none resize-none"
                  style={{
                    fontSize: element.fontSize || 16,
                    color: element.color || '#000000',
                    fontWeight: element.fontWeight || 'normal',
                    fontStyle: element.fontStyle || 'normal',
                    textAlign: element.textAlign || 'center',
                  }}
                  defaultValue={element.content || 'Text'}
                  onBlur={(e) => handleTextEdit(element.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTextEdit(element.id, e.currentTarget.value);
                    }
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <span className="whitespace-pre-wrap">{element.content || 'Double-click to edit'}</span>
              )}
            </div>
          )}
          
          {element.type === 'image' && (
            <div className="w-full h-full bg-gray-100 rounded shadow-sm border flex items-center justify-center">
              {element.imageUrl ? (
                <img
                  src={element.imageUrl}
                  alt="Element"
                  className="w-full h-full object-cover rounded"
                  draggable={false}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">🖼️</div>
                  <span className="text-sm">Double-click to add image</span>
                </div>
              )}
            </div>
          )}
          
          {element.type === 'multiple-choice' && (
            <MultipleChoiceRenderer 
              element={element} 
              isEditing={showPopup} 
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
            />
          )}
          
          {element.type === 'true-false' && (
            <TrueFalseRenderer 
              element={element} 
              isEditing={showPopup} 
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
            />
          )}
          
          {element.type === 'fill-in-blank' && (
            <div className="w-full h-full bg-yellow-50 rounded shadow-sm border p-4">
              <div className="text-sm font-medium mb-2">Fill in the Blank</div>
              <div className="text-xs">
                {element.content || 'Double-click to edit'}
              </div>
            </div>
          )}
          
          {element.type === 'drawing' && (
            <div className="w-full h-full bg-gray-50 rounded shadow-sm border flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">✏️</div>
                <span className="text-sm">Double-click to draw</span>
              </div>
            </div>
          )}
          
          {element.type === 'youtube' && (
            <YouTubeRenderer element={element} />
          )}

          {element.type === 'audio' && (
            <div className="w-full h-full bg-purple-50 rounded shadow-sm border flex items-center justify-center">
              {element.audioUrl ? (
                <audio controls className="w-full">
                  <source src={element.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <div className="text-center text-purple-600">
                  <div className="text-4xl mb-2">🎵</div>
                  <span className="text-sm">Double-click to add audio</span>
                </div>
              )}
            </div>
          )}

          {element.type === 'deck-embed' && (
            <DeckEmbedRenderer 
              element={element} 
              isEditing={showPopup} 
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
            />
          )}

          {/* Resize handles for selected element */}
          {isSelected && !isEditing && (
            <>
              {/* Corner resize handles */}
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'se')}
              />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'ne')}
              />
              <div
                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'nw')}
              />
              <div
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'sw')}
              />
              
              {/* Edge resize handles */}
              <div
                className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'n')}
              />
              <div
                className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'e')}
              />
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 's')}
              />
              <div
                className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-w-resize rounded-sm border border-white shadow"
                onMouseDown={(e) => handleMouseDown(e, element.id, 'w')}
              />
            </>
          )}
        </div>

        {/* Element editing popups */}
        {showPopup && element.type === 'image' && (
          <ImageEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}

        {showPopup && element.type === 'audio' && (
          <AudioEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}

        {showPopup && element.type === 'youtube' && (
          <YouTubeEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}

        {showPopup && element.type === 'fill-in-blank' && (
          <FillInBlankEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}

        {showPopup && element.type === 'deck-embed' && (
          <DeckEmbedEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}

        {showPopup && element.type === 'drawing' && (
          <DrawingEditorPopup
            element={element}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            onClose={() => closeElementPopup(element.id)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="relative bg-white shadow-lg border-2 border-gray-300 overflow-hidden rounded-lg">
      <div
        ref={canvasRef}
        className="relative bg-white"
        style={{ width: cardWidth, height: cardHeight }}
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
      >
        {/* Grid background */}
        {showGrid && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        )}
        
        {/* Render all elements */}
        {elements.map(renderElement)}
        
        {/* Drop zone indicator when no elements */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <div>Click the toolbar buttons above to add elements</div>
              <div className="text-sm mt-2">Or double-click here to add text</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual editor popups for different element types
const ImageEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Edit Image</h3>
          <div>
            <Label>Image URL</Label>
            <Input
              value={element.imageUrl || ''}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="Enter image URL"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const AudioEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Edit Audio</h3>
          <div>
            <Label>Audio URL</Label>
            <Input
              value={element.audioUrl || ''}
              onChange={(e) => onUpdate({ audioUrl: e.target.value })}
              placeholder="Enter audio URL (MP3, WAV, etc.)"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const YouTubeEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Edit YouTube Video</h3>
          <div>
            <Label>YouTube URL</Label>
            <Input
              value={element.youtubeUrl || ''}
              onChange={(e) => onUpdate({ youtubeUrl: e.target.value })}
              placeholder="Enter YouTube URL"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const FillInBlankEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96 max-h-[80vh] overflow-auto">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Edit Fill in the Blank</h3>
          <FillInBlankEditor
            element={element}
            onUpdate={onUpdate}
          />
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DeckEmbedEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Embed Deck</h3>
          <div>
            <Label>Deck ID</Label>
            <Input
              value={element.deckId || ''}
              onChange={(e) => onUpdate({ deckId: e.target.value })}
              placeholder="Enter deck ID"
            />
          </div>
          <div>
            <Label>Deck Title</Label>
            <Input
              value={element.deckTitle || ''}
              onChange={(e) => onUpdate({ deckTitle: e.target.value })}
              placeholder="Enter deck title"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const DrawingEditorPopup: React.FC<{
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  onClose: () => void;
}> = ({ element, onUpdate, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <Card className="w-96">
      <CardContent className="p-4">
        <div className="space-y-4">
          <h3 className="font-semibold">Drawing Canvas</h3>
          <div className="bg-white border rounded h-40 flex items-center justify-center">
            <span className="text-gray-500">Drawing functionality coming soon</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} className="flex-1">Done</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
