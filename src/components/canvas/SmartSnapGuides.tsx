
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
            opacity: 0.8,
            ...(guide.type === 'vertical'
              ? {
                  left: guide.position - 1,
                  top: 0,
                  width: 2,
                  height: canvasHeight,
                }
              : {
                  left: 0,
                  top: guide.position - 1,
                  width: canvasWidth,
                  height: 2,
                }),
            boxShadow: `0 0 6px ${guide.color}`,
            transition: 'opacity 0.2s ease-in-out',
          }}
        >
          {/* Enhanced indicators for different guide types */}
          {guide.color === '#10b981' && (
            <div
              className="absolute bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg font-medium"
              style={{
                ...(guide.type === 'vertical'
                  ? {
                      left: 6,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }
                  : {
                      top: 6,
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }),
              }}
            >
              20px spacing
            </div>
          )}
          
          {guide.color === '#ef4444' && (
            <div
              className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg font-medium"
              style={{
                ...(guide.type === 'vertical'
                  ? {
                      left: 6,
                      top: 10,
                    }
                  : {
                      top: 6,
                      left: 10,
                    }),
              }}
            >
              Aligned
            </div>
          )}
          
          {guide.color === '#3b82f6' && (
            <div
              className="absolute bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg font-medium"
              style={{
                ...(guide.type === 'vertical'
                  ? {
                      left: 6,
                      top: 10,
                    }
                  : {
                      top: 6,
                      left: 10,
                    }),
              }}
            >
              Canvas edge
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
