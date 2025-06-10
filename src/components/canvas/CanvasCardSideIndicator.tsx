
import React from 'react';

interface CanvasCardSideIndicatorProps {
  cardSide: 'front' | 'back';
  isDarkTheme: boolean;
}

export const CanvasCardSideIndicator: React.FC<CanvasCardSideIndicatorProps> = ({
  cardSide,
  isDarkTheme,
}) => {
  return (
    <div className="absolute top-2 left-2 z-10 pointer-events-none">
      <div className={`px-2 py-1 rounded text-xs font-medium ${
        isDarkTheme ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
      }`}>
        {cardSide === 'front' ? 'Front' : 'Back'}
      </div>
    </div>
  );
};
