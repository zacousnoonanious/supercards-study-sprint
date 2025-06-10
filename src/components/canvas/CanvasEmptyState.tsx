
import React from 'react';

export const CanvasEmptyState: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg pointer-events-none">
      <div className="text-center">
        <p>No elements yet</p>
        <p className="text-sm mt-2">Use the toolbar to add elements</p>
      </div>
    </div>
  );
};
