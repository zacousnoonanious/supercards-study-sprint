
import { useEffect } from 'react';

interface UseTextElementKeyboardProps {
  isSelected: boolean;
  isEditing: boolean;
  elementId: string;
}

export const useTextElementKeyboard = ({
  isSelected,
  isEditing,
  elementId,
}: UseTextElementKeyboardProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSelected && !isEditing && e.key === 'Delete') {
        e.preventDefault();
        console.log('Delete key pressed for text element:', elementId);
        // This will be handled by the parent component through onDeleteElement
      }
    };

    if (isSelected) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isSelected, isEditing, elementId]);
};
