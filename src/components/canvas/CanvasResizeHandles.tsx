
import React from 'react';

interface CanvasResizeHandlesProps {
  elementId: string;
  onResizeStart: (e: React.MouseEvent, elementId: string, action: 'resize', handle: string) => void;
}

export const CanvasResizeHandles: React.FC<CanvasResizeHandlesProps> = ({
  elementId,
  onResizeStart,
}) => {
  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(e, elementId, 'resize', handle);
  };

  return (
    <>
      {/* Corner handles */}
      <div
        className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
      />
      <div
        className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
      />
      <div
        className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
      />
      <div
        className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'se')}
      />
      
      {/* Edge handles */}
      <div
        className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'n')}
      />
      <div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 's')}
      />
      <div
        className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-w-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'w')}
      />
      <div
        className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-3 h-3 bg-blue-500 cursor-e-resize border border-white"
        onMouseDown={(e) => handleMouseDown(e, 'e')}
      />
    </>
  );
};
