
import React from 'react';

interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  elements: string[];
  color: string;
}

interface SmartSnapGuidesProps {
  guides: SnapGuide[];
  canvasWidth: number;
  canvasHeight: number;
}

export const SmartSnapGuides: React.FC<SmartSnapGuidesProps> = ({
  guides,
  canvasWidth,
  canvasHeight,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
      {guides.map((guide, index) => (
        <div
          key={index}
          className="absolute animate-fade-in"
          style={{
            backgroundColor: guide.color,
            ...(guide.type === 'vertical'
              ? {
                  left: guide.position - 0.5,
                  top: 0,
                  width: 1,
                  height: canvasHeight,
                }
              : {
                  left: 0,
                  top: guide.position - 0.5,
                  width: canvasWidth,
                  height: 1,
                }),
            boxShadow: `0 0 4px ${guide.color}`,
          }}
        >
          {/* Distance indicator for spaced elements */}
          {guide.color === '#10b981' && (
            <div
              className="absolute bg-green-500 text-white text-xs px-1 py-0.5 rounded"
              style={{
                ...(guide.type === 'vertical'
                  ? {
                      left: 4,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }
                  : {
                      top: 4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }),
              }}
            >
              20px
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
