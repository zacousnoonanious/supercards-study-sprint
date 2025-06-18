
import { useState, useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  elements: string[];
  color: string;
}

interface UseSmartSnappingProps {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  snapThreshold?: number;
}

export const useSmartSnapping = ({
  elements,
  canvasWidth,
  canvasHeight,
  snapThreshold = 15, // Increased default for better magnetic behavior
}: UseSmartSnappingProps) => {
  const [activeSnapGuides, setActiveSnapGuides] = useState<SnapGuide[]>([]);

  const getSnapTargets = useCallback((draggedElementId: string) => {
    return elements.filter(el => el.id !== draggedElementId);
  }, [elements]);

  const calculateSnapPosition = useCallback((
    draggedElement: CanvasElement,
    newX: number,
    newY: number
  ) => {
    const snapTargets = getSnapTargets(draggedElement.id);
    let snappedX = newX;
    let snappedY = newY;
    const guides: SnapGuide[] = [];

    // Track if we've snapped to anything for magnetic behavior
    let hasSnappedX = false;
    let hasSnappedY = false;

    // Element edges and centers for snapping
    const draggedLeft = newX;
    const draggedRight = newX + draggedElement.width;
    const draggedTop = newY;
    const draggedBottom = newY + draggedElement.height;
    const draggedCenterX = newX + draggedElement.width / 2;
    const draggedCenterY = newY + draggedElement.height / 2;

    // Canvas snap lines with higher priority (checked first)
    const canvasSnapLines = [
      { type: 'vertical' as const, position: 0, label: 'left edge', priority: 1 },
      { type: 'vertical' as const, position: canvasWidth / 2, label: 'center', priority: 2 },
      { type: 'vertical' as const, position: canvasWidth, label: 'right edge', priority: 1 },
      { type: 'horizontal' as const, position: 0, label: 'top edge', priority: 1 },
      { type: 'horizontal' as const, position: canvasHeight / 2, label: 'center', priority: 2 },
      { type: 'horizontal' as const, position: canvasHeight, label: 'bottom edge', priority: 1 },
    ];

    // Check canvas snapping with magnetic behavior
    canvasSnapLines.forEach(line => {
      if (line.type === 'vertical' && !hasSnappedX) {
        let snapDistance = Infinity;
        let snapPosition = null;
        
        // Check left edge
        const leftDistance = Math.abs(draggedLeft - line.position);
        if (leftDistance <= snapThreshold && leftDistance < snapDistance) {
          snapDistance = leftDistance;
          snapPosition = line.position;
        }
        
        // Check right edge
        const rightDistance = Math.abs(draggedRight - line.position);
        if (rightDistance <= snapThreshold && rightDistance < snapDistance) {
          snapDistance = rightDistance;
          snapPosition = line.position - draggedElement.width;
        }
        
        // Check center
        const centerDistance = Math.abs(draggedCenterX - line.position);
        if (centerDistance <= snapThreshold && centerDistance < snapDistance) {
          snapDistance = centerDistance;
          snapPosition = line.position - draggedElement.width / 2;
        }
        
        if (snapPosition !== null) {
          snappedX = snapPosition;
          hasSnappedX = true;
          guides.push({
            type: 'vertical',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
      } else if (line.type === 'horizontal' && !hasSnappedY) {
        let snapDistance = Infinity;
        let snapPosition = null;
        
        // Check top edge
        const topDistance = Math.abs(draggedTop - line.position);
        if (topDistance <= snapThreshold && topDistance < snapDistance) {
          snapDistance = topDistance;
          snapPosition = line.position;
        }
        
        // Check bottom edge
        const bottomDistance = Math.abs(draggedBottom - line.position);
        if (bottomDistance <= snapThreshold && bottomDistance < snapDistance) {
          snapDistance = bottomDistance;
          snapPosition = line.position - draggedElement.height;
        }
        
        // Check center
        const centerDistance = Math.abs(draggedCenterY - line.position);
        if (centerDistance <= snapThreshold && centerDistance < snapDistance) {
          snapDistance = centerDistance;
          snapPosition = line.position - draggedElement.height / 2;
        }
        
        if (snapPosition !== null) {
          snappedY = snapPosition;
          hasSnappedY = true;
          guides.push({
            type: 'horizontal',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
      }
    });

    // Check element-to-element snapping (lower priority than canvas)
    snapTargets.forEach(target => {
      const targetLeft = target.x;
      const targetRight = target.x + target.width;
      const targetTop = target.y;
      const targetBottom = target.y + target.height;
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;

      // Vertical alignment (X-axis) - only if not already snapped to canvas
      if (!hasSnappedX) {
        const alignmentPoints = [
          { pos: targetLeft, type: 'left' },
          { pos: targetRight, type: 'right' },
          { pos: targetCenterX, type: 'center' }
        ];

        let bestSnapDistance = Infinity;
        let bestSnapPosition = null;
        let bestSnapGuidePosition = null;

        alignmentPoints.forEach(({ pos, type }) => {
          // Left edge alignment
          const leftDistance = Math.abs(draggedLeft - pos);
          if (leftDistance <= snapThreshold && leftDistance < bestSnapDistance) {
            bestSnapDistance = leftDistance;
            bestSnapPosition = pos;
            bestSnapGuidePosition = pos;
          }
          
          // Right edge alignment
          const rightDistance = Math.abs(draggedRight - pos);
          if (rightDistance <= snapThreshold && rightDistance < bestSnapDistance) {
            bestSnapDistance = rightDistance;
            bestSnapPosition = pos - draggedElement.width;
            bestSnapGuidePosition = pos;
          }
          
          // Center alignment
          const centerDistance = Math.abs(draggedCenterX - pos);
          if (centerDistance <= snapThreshold && centerDistance < bestSnapDistance) {
            bestSnapDistance = centerDistance;
            bestSnapPosition = pos - draggedElement.width / 2;
            bestSnapGuidePosition = pos;
          }
        });

        if (bestSnapPosition !== null) {
          snappedX = bestSnapPosition;
          hasSnappedX = true;
          guides.push({
            type: 'vertical',
            position: bestSnapGuidePosition!,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
      }

      // Horizontal alignment (Y-axis) - only if not already snapped to canvas
      if (!hasSnappedY) {
        const alignmentPoints = [
          { pos: targetTop, type: 'top' },
          { pos: targetBottom, type: 'bottom' },
          { pos: targetCenterY, type: 'center' }
        ];

        let bestSnapDistance = Infinity;
        let bestSnapPosition = null;
        let bestSnapGuidePosition = null;

        alignmentPoints.forEach(({ pos, type }) => {
          // Top edge alignment
          const topDistance = Math.abs(draggedTop - pos);
          if (topDistance <= snapThreshold && topDistance < bestSnapDistance) {
            bestSnapDistance = topDistance;
            bestSnapPosition = pos;
            bestSnapGuidePosition = pos;
          }
          
          // Bottom edge alignment
          const bottomDistance = Math.abs(draggedBottom - pos);
          if (bottomDistance <= snapThreshold && bottomDistance < bestSnapDistance) {
            bestSnapDistance = bottomDistance;
            bestSnapPosition = pos - draggedElement.height;
            bestSnapGuidePosition = pos;
          }
          
          // Center alignment
          const centerDistance = Math.abs(draggedCenterY - pos);
          if (centerDistance <= snapThreshold && centerDistance < bestSnapDistance) {
            bestSnapDistance = centerDistance;
            bestSnapPosition = pos - draggedElement.height / 2;
            bestSnapGuidePosition = pos;
          }
        });

        if (bestSnapPosition !== null) {
          snappedY = bestSnapPosition;
          hasSnappedY = true;
          guides.push({
            type: 'horizontal',
            position: bestSnapGuidePosition!,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
      }

      // Distance-based snapping (consistent spacing) - lower priority
      if (!hasSnappedX || !hasSnappedY) {
        const spacing = 20; // Standard spacing
        const spacingPoints = [
          { pos: targetRight + spacing, type: 'right-spaced', axis: 'x' },
          { pos: targetLeft - spacing - draggedElement.width, type: 'left-spaced', axis: 'x' },
          { pos: targetBottom + spacing, type: 'bottom-spaced', axis: 'y' },
          { pos: targetTop - spacing - draggedElement.height, type: 'top-spaced', axis: 'y' }
        ];

        spacingPoints.forEach(({ pos, type, axis }) => {
          if (axis === 'x' && !hasSnappedX) {
            const distance = Math.abs(draggedLeft - pos);
            if (distance <= snapThreshold) {
              snappedX = pos;
              hasSnappedX = true;
              guides.push({
                type: 'vertical',
                position: pos,
                elements: [draggedElement.id, target.id],
                color: '#10b981'
              });
            }
          } else if (axis === 'y' && !hasSnappedY) {
            const distance = Math.abs(draggedTop - pos);
            if (distance <= snapThreshold) {
              snappedY = pos;
              hasSnappedY = true;
              guides.push({
                type: 'horizontal',
                position: pos,
                elements: [draggedElement.id, target.id],
                color: '#10b981'
              });
            }
          }
        });
      }
    });

    setActiveSnapGuides(guides);
    return { x: snappedX, y: snappedY };
  }, [getSnapTargets, canvasWidth, canvasHeight, snapThreshold]);

  const clearSnapGuides = useCallback(() => {
    setActiveSnapGuides([]);
  }, []);

  return {
    calculateSnapPosition,
    clearSnapGuides,
    activeSnapGuides,
  };
};
