
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuSub,
} from '@/components/ui/context-menu';
import { 
  Undo, 
  Redo, 
  Palette,
  Image,
  Grid,
  Settings,
  Maximize2,
  Minimize2,
  RotateCw,
  Move
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface CanvasContextMenuProps {
  children: React.ReactNode;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onChangeBackground: () => void;
  onToggleGrid: () => void;
  onSettings: () => void;
  onChangeCardSize?: (size: 'small' | 'medium' | 'large' | 'custom') => void;
  onScaleToElements?: () => void;
  onSetDefaultSize?: () => void;
}

export const CanvasContextMenu: React.FC<CanvasContextMenuProps> = ({
  children,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onChangeBackground,
  onToggleGrid,
  onSettings,
  onChangeCardSize,
  onScaleToElements,
  onSetDefaultSize,
}) => {
  const { t } = useI18n();

  const backgroundColors = [
    { name: t('canvas.colorWhite') || 'White', value: '#ffffff' },
    { name: t('canvas.colorLightGray') || 'Light Gray', value: '#f5f5f5' },
    { name: t('canvas.colorBlue') || 'Blue', value: '#e3f2fd' },
    { name: t('canvas.colorGreen') || 'Green', value: '#e8f5e8' },
    { name: t('canvas.colorYellow') || 'Yellow', value: '#fff9c4' },
    { name: t('canvas.colorPink') || 'Pink', value: '#fce4ec' },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onUndo} disabled={!canUndo}>
          <Undo className="w-4 h-4 mr-2" />
          {t('canvas.undo') || 'Undo'}
        </ContextMenuItem>
        <ContextMenuItem onClick={onRedo} disabled={!canRedo}>
          <Redo className="w-4 h-4 mr-2" />
          {t('canvas.redo') || 'Redo'}
        </ContextMenuItem>
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Palette className="w-4 h-4 mr-2" />
            {t('canvas.backgroundColor') || 'Background Color'}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {backgroundColors.map((color) => (
              <ContextMenuItem 
                key={color.value}
                onClick={() => {
                  document.documentElement.style.setProperty('--canvas-bg', color.value);
                }}
                className="flex items-center justify-between"
              >
                <span>{color.name}</span>
                <div 
                  className="w-4 h-4 border border-gray-300 rounded"
                  style={{ backgroundColor: color.value }}
                />
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => {}}>
          <Image className="w-4 h-4 mr-2" />
          {t('canvas.backgroundImage') || 'Background Image'}
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Maximize2 className="w-4 h-4 mr-2" />
            {t('canvas.cardSize') || 'Card Size'}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-40">
            <ContextMenuItem onClick={() => onChangeCardSize?.('small')}>
              {t('canvas.sizeSmall') || 'Small (400x300)'}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onChangeCardSize?.('medium')}>
              {t('canvas.sizeMedium') || 'Medium (600x400)'}
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onChangeCardSize?.('large')}>
              {t('canvas.sizeLarge') || 'Large (800x600)'}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onScaleToElements}>
              <Move className="w-4 h-4 mr-2" />
              {t('canvas.scaleToElements') || 'Scale to Elements'}
            </ContextMenuItem>
            <ContextMenuItem onClick={onSetDefaultSize}>
              <Settings className="w-4 h-4 mr-2" />
              {t('canvas.setDefaultSize') || 'Set as Default Size'}
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />
        <ContextMenuItem onClick={onToggleGrid}>
          <Grid className="w-4 h-4 mr-2" />
          {t('canvas.toggleGrid') || 'Toggle Grid'}
        </ContextMenuItem>
        <ContextMenuItem onClick={onSettings}>
          <Settings className="w-4 h-4 mr-2" />
          {t('canvas.settings') || 'Canvas Settings'}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
