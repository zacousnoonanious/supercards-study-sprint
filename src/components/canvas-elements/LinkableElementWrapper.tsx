
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { Link } from 'lucide-react';

interface LinkableElementWrapperProps {
  element: CanvasElement;
  children: React.ReactNode;
  onElementLink?: (elementId: string, linkData: any) => void;
  isStudyMode?: boolean;
}

export const LinkableElementWrapper: React.FC<LinkableElementWrapperProps> = ({
  element,
  children,
  onElementLink,
  isStudyMode = false,
}) => {
  const hasLink = element.linkData && (element.linkData.type === 'card-jump' || element.linkData.type === 'action');

  const handleClick = (e: React.MouseEvent) => {
    if (hasLink && isStudyMode && onElementLink) {
      e.preventDefault();
      e.stopPropagation();
      onElementLink(element.id, element.linkData);
    }
  };

  if (!hasLink) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative ${isStudyMode ? 'cursor-pointer hover:opacity-80' : ''}`}
      onClick={handleClick}
    >
      {children}
      {hasLink && !isStudyMode && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <Link className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
};
