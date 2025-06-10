
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Type,
  Image,
  Volume2,
  Pencil,
  CheckSquare,
  ToggleLeft,
  Youtube,
  Layers,
  FileText,
  ArrowLeft,
  Grid3X3,
  AlignCenter,
  AlignJustify,
  Layers3,
  AlignLeft,
  AlignRight,
} from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

interface VerticalMenuBarProps {
  onAddElement: (type: string) => void;
  onAutoArrange?: (type: 'grid' | 'center' | 'justify' | 'stack' | 'align-left' | 'align-center' | 'align-right') => void;
  onBackToCardView: () => void;
}

export const VerticalMenuBar: React.FC<VerticalMenuBarProps> = ({
  onAddElement,
  onAutoArrange,
  onBackToCardView,
}) => {
  const { t } = useI18n();

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-1 flex flex-col gap-1 w-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToCardView}
          className="w-10 h-10 p-0"
          title={t('common.back')}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="w-full h-px bg-border my-1" />

        {/* Add Elements */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('text')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addText')}
        >
          <Type className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('image')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addImage')}
        >
          <Image className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('audio')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addAudio')}
        >
          <Volume2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('drawing')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addDrawing')}
        >
          <Pencil className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('youtube')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addYoutube')}
        >
          <Youtube className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('deck-embed')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addDeckEmbed')}
        >
          <Layers className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('multiple-choice')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addMultipleChoice')}
        >
          <CheckSquare className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('true-false')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addTrueFalse')}
        >
          <ToggleLeft className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddElement('fill-in-blank')}
          className="w-10 h-10 p-0"
          title={t('toolbar.addFillInBlank')}
        >
          <FileText className="w-4 h-4" />
        </Button>

        <div className="w-full h-px bg-border my-1" />

        {/* Auto Arrange Menu */}
        <Menubar className="border-0 bg-transparent p-0 h-auto">
          <MenubarMenu>
            <MenubarTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0"
                title={t('toolbar.arrange')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </MenubarTrigger>
            <MenubarContent side="right" align="start" className="ml-2">
              <MenubarItem onClick={() => onAutoArrange?.('grid')}>
                <Grid3X3 className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeGrid')}
              </MenubarItem>
              <MenubarItem onClick={() => onAutoArrange?.('center')}>
                <AlignCenter className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeCenter')}
              </MenubarItem>
              <MenubarItem onClick={() => onAutoArrange?.('justify')}>
                <AlignJustify className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeJustify')}
              </MenubarItem>
              <MenubarItem onClick={() => onAutoArrange?.('stack')}>
                <Layers3 className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeStack')}
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem onClick={() => onAutoArrange?.('align-left')}>
                <AlignLeft className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeAlignLeft')}
              </MenubarItem>
              <MenubarItem onClick={() => onAutoArrange?.('align-center')}>
                <AlignCenter className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeAlignCenter')}
              </MenubarItem>
              <MenubarItem onClick={() => onAutoArrange?.('align-right')}>
                <AlignRight className="w-4 h-4 mr-2" />
                {t('toolbar.arrangeAlignRight')}
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};
