
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { TextEditorInput } from '../text-editor/TextEditorInput';
import { TextEditorDisplay } from '../text-editor/TextEditorDisplay';
import { useI18n } from '@/contexts/I18nContext';

interface SimpleTextElementRendererProps {
  element: CanvasElement;
  textScale?: number;
  isStudyMode?: boolean;
  onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
  onElementSelect?: (elementId: string) => void;
  isDarkTheme: boolean;
}

export const SimpleTextElementRenderer: React.FC<SimpleTextElementRendererProps> = ({
  element,
  textScale = 1,
  isStudyMode = false,
  onUpdateElement,
  onElementSelect,
  isDarkTheme,
}) => {
  const { t } = useI18n();

  return (
    <div className="w-full h-full">
      <TextEditorDisplay
        element={element}
        textScale={textScale}
      />
    </div>
  );
};
