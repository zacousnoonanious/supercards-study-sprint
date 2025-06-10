
import React from 'react';
import { CanvasElement } from '@/types/flashcard';
import { useI18n } from '@/contexts/I18nContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ElementControls } from './settings/ElementControls';

interface SidePanelProps {
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
}) => {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isDarkTheme = ['dark', 'cobalt', 'darcula', 'console'].includes(theme);

  return (
    <div className={`w-80 border-l p-4 overflow-y-auto ${
      isDarkTheme ? 'bg-gray-800 border-gray-600' : 'bg-background border-border'
    }`}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('editor.elementOptions')}</h3>
        
        {selectedElement ? (
          <ElementControls
            selectedElement={selectedElement}
            onUpdateElement={onUpdateElement}
            onDeleteElement={onDeleteElement}
          />
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/50" />
            </div>
            <p className="font-medium">{t('editor.noElementSelected')}</p>
            <p className="text-sm mt-1">{t('editor.clickElementToEdit')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
