
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
  snapThreshold = 5,
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

    // Element edges and centers for snapping
    const draggedLeft = newX;
    const draggedRight = newX + draggedElement.width;
    const draggedTop = newY;
    const draggedBottom = newY + draggedElement.height;
    const draggedCenterX = newX + draggedElement.width / 2;
    const draggedCenterY = newY + draggedElement.height / 2;

    // Canvas snap lines
    const canvasSnapLines = [
      { type: 'vertical' as const, position: 0, label: 'left edge' },
      { type: 'vertical' as const, position: canvasWidth / 2, label: 'center' },
      { type: 'vertical' as const, position: canvasWidth, label: 'right edge' },
      { type: 'horizontal' as const, position: 0, label: 'top edge' },
      { type: 'horizontal' as const, position: canvasHeight / 2, label: 'center' },
      { type: 'horizontal' as const, position: canvasHeight, label: 'bottom edge' },
    ];

    // Check canvas snapping
    canvasSnapLines.forEach(line => {
      if (line.type === 'vertical') {
        // Check left edge
        if (Math.abs(draggedLeft - line.position) <= snapThreshold) {
          snappedX = line.position;
          guides.push({
            type: 'vertical',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
        // Check right edge
        else if (Math.abs(draggedRight - line.position) <= snapThreshold) {
          snappedX = line.position - draggedElement.width;
          guides.push({
            type: 'vertical',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
        // Check center
        else if (Math.abs(draggedCenterX - line.position) <= snapThreshold) {
          snappedX = line.position - draggedElement.width / 2;
          guides.push({
            type: 'vertical',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
      } else {
        // Check top edge
        if (Math.abs(draggedTop - line.position) <= snapThreshold) {
          snappedY = line.position;
          guides.push({
            type: 'horizontal',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
        // Check bottom edge
        else if (Math.abs(draggedBottom - line.position) <= snapThreshold) {
          snappedY = line.position - draggedElement.height;
          guides.push({
            type: 'horizontal',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
        // Check center
        else if (Math.abs(draggedCenterY - line.position) <= snapThreshold) {
          snappedY = line.position - draggedElement.height / 2;
          guides.push({
            type: 'horizontal',
            position: line.position,
            elements: ['canvas'],
            color: '#3b82f6'
          });
        }
      }
    });

    // Check element-to-element snapping
    snapTargets.forEach(target => {
      const targetLeft = target.x;
      const targetRight = target.x + target.width;
      const targetTop = target.y;
      const targetBottom = target.y + target.height;
      const targetCenterX = target.x + target.width / 2;
      const targetCenterY = target.y + target.height / 2;

      // Vertical alignment (X-axis)
      [
        { pos: targetLeft, type: 'left' },
        { pos: targetRight, type: 'right' },
        { pos: targetCenterX, type: 'center' }
      ].forEach(({ pos, type }) => {
        // Left edge alignment
        if (Math.abs(draggedLeft - pos) <= snapThreshold) {
          snappedX = pos;
          guides.push({
            type: 'vertical',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
        // Right edge alignment
        else if (Math.abs(draggedRight - pos) <= snapThreshold) {
          snappedX = pos - draggedElement.width;
          guides.push({
            type: 'vertical',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
        // Center alignment
        else if (Math.abs(draggedCenterX - pos) <= snapThreshold) {
          snappedX = pos - draggedElement.width / 2;
          guides.push({
            type: 'vertical',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
      });

      // Horizontal alignment (Y-axis)
      [
        { pos: targetTop, type: 'top' },
        { pos: targetBottom, type: 'bottom' },
        { pos: targetCenterY, type: 'center' }
      ].forEach(({ pos, type }) => {
        // Top edge alignment
        if (Math.abs(draggedTop - pos) <= snapThreshold) {
          snappedY = pos;
          guides.push({
            type: 'horizontal',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
        // Bottom edge alignment
        else if (Math.abs(draggedBottom - pos) <= snapThreshold) {
          snappedY = pos - draggedElement.height;
          guides.push({
            type: 'horizontal',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
        // Center alignment
        else if (Math.abs(draggedCenterY - pos) <= snapThreshold) {
          snappedY = pos - draggedElement.height / 2;
          guides.push({
            type: 'horizontal',
            position: pos,
            elements: [draggedElement.id, target.id],
            color: '#ef4444'
          });
        }
      });

      // Distance-based snapping (consistent spacing)
      const spacing = 20; // Standard spacing
      [
        { pos: targetRight + spacing, type: 'right-spaced' },
        { pos: targetLeft - spacing - draggedElement.width, type: 'left-spaced' },
        { pos: targetBottom + spacing, type: 'bottom-spaced' },
        { pos: targetTop - spacing - draggedElement.height, type: 'top-spaced' }
      ].forEach(({ pos, type }) => {
        if (type.includes('spaced')) {
          if (type.startsWith('right') && Math.abs(draggedLeft - pos) <= snapThreshold) {
            snappedX = pos;
            guides.push({
              type: 'vertical',
              position: pos,
              elements: [draggedElement.id, target.id],
              color: '#10b981'
            });
          } else if (type.startsWith('left') && Math.abs(draggedLeft - pos) <= snapThreshold) {
            snappedX = pos;
            guides.push({
              type: 'vertical',
              position: pos,
              elements: [draggedElement.id, target.id],
              color: '#10b981'
            });
          } else if (type.startsWith('bottom') && Math.abs(draggedTop - pos) <= snapThreshold) {
            snappedY = pos;
            guides.push({
              type: 'horizontal',
              position: pos,
              elements: [draggedElement.id, target.id],
              color: '#10b981'
            });
          } else if (type.startsWith('top') && Math.abs(draggedTop - pos) <= snapThreshold) {
            snappedY = pos;
            guides.push({
              type: 'horizontal',
              position: pos,
              elements: [draggedElement.id, target.id],
              color: '#10b981'
            });
          }
        }
      });
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
