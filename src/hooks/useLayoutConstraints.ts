
import { useCallback } from 'react';
import { CanvasElement } from '@/types/flashcard';

interface LayoutConstraint {
  type: 'pin-to-edge' | 'scale-with-canvas' | 'fixed-distance' | 'anchor-to-element';
  edge?: 'top' | 'bottom' | 'left' | 'right' | 'center-x' | 'center-y';
  targetElementId?: string;
  distance?: number;
  scaleX?: boolean;
  scaleY?: boolean;
}

interface UseLayoutConstraintsProps {
  elements: CanvasElement[];
  canvasWidth: number;
  canvasHeight: number;
  originalCanvasWidth: number;
  originalCanvasHeight: number;
  onUpdateElement: (elementId: string, updates: Partial<CanvasElement>) => void;
}

export const useLayoutConstraints = ({
  elements,
  canvasWidth,
  canvasHeight,
  originalCanvasWidth,
  originalCanvasHeight,
  onUpdateElement,
}: UseLayoutConstraintsProps) => {
  
  const applyConstraints = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || !(element as any).layoutConstraints) return;

    const constraints: LayoutConstraint[] = (element as any).layoutConstraints;
    let updates: Partial<CanvasElement> = {};

    constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'pin-to-edge':
          switch (constraint.edge) {
            case 'top':
              updates.y = 0;
              break;
            case 'bottom':
              updates.y = canvasHeight - element.height;
              break;
            case 'left':
              updates.x = 0;
              break;
            case 'right':
              updates.x = canvasWidth - element.width;
              break;
            case 'center-x':
              updates.x = (canvasWidth - element.width) / 2;
              break;
            case 'center-y':
              updates.y = (canvasHeight - element.height) / 2;
              break;
          }
          break;

        case 'scale-with-canvas':
          if (originalCanvasWidth > 0 && originalCanvasHeight > 0) {
            const scaleX = canvasWidth / originalCanvasWidth;
            const scaleY = canvasHeight / originalCanvasHeight;
            
            if (constraint.scaleX) {
              updates.width = Math.round(element.width * scaleX);
              updates.x = Math.round(element.x * scaleX);
            }
            if (constraint.scaleY) {
              updates.height = Math.round(element.height * scaleY);
              updates.y = Math.round(element.y * scaleY);
            }
          }
          break;

        case 'anchor-to-element':
          const targetElement = elements.find(el => el.id === constraint.targetElementId);
          if (targetElement && constraint.distance !== undefined) {
            // Position relative to target element (to the right by default)
            updates.x = targetElement.x + targetElement.width + constraint.distance;
            updates.y = targetElement.y;
          }
          break;

        case 'fixed-distance':
          // Maintain fixed distance from an edge
          if (constraint.edge && constraint.distance !== undefined) {
            switch (constraint.edge) {
              case 'top':
                updates.y = constraint.distance;
                break;
              case 'bottom':
                updates.y = canvasHeight - element.height - constraint.distance;
                break;
              case 'left':
                updates.x = constraint.distance;
                break;
              case 'right':
                updates.x = canvasWidth - element.width - constraint.distance;
                break;
            }
          }
          break;
      }
    });

    // Ensure element stays within canvas bounds
    if (updates.x !== undefined) {
      updates.x = Math.max(0, Math.min(updates.x, canvasWidth - element.width));
    }
    if (updates.y !== undefined) {
      updates.y = Math.max(0, Math.min(updates.y, canvasHeight - element.height));
    }

    if (Object.keys(updates).length > 0) {
      onUpdateElement(elementId, updates);
    }
  }, [elements, canvasWidth, canvasHeight, originalCanvasWidth, originalCanvasHeight, onUpdateElement]);

  const applyConstraintsToAll = useCallback(() => {
    elements.forEach(element => {
      if ((element as any).layoutConstraints?.length > 0) {
        applyConstraints(element.id);
      }
    });
  }, [elements, applyConstraints]);

  const addConstraintToElement = useCallback((elementId: string, constraint: LayoutConstraint) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const currentConstraints = (element as any).layoutConstraints || [];
    const newConstraints = [...currentConstraints, constraint];
    
    onUpdateElement(elementId, { layoutConstraints: newConstraints } as any);
    
    // Apply constraints immediately
    setTimeout(() => applyConstraints(elementId), 0);
  }, [elements, onUpdateElement, applyConstraints]);

  const removeConstraintFromElement = useCallback((elementId: string, constraintIndex: number) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || !(element as any).layoutConstraints) return;

    const currentConstraints = [...(element as any).layoutConstraints];
    currentConstraints.splice(constraintIndex, 1);
    
    onUpdateElement(elementId, { layoutConstraints: currentConstraints } as any);
  }, [elements, onUpdateElement]);

  return {
    applyConstraints,
    applyConstraintsToAll,
    addConstraintToElement,
    removeConstraintFromElement,
  };
};
