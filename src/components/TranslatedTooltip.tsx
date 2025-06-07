
import React from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TranslatedTooltipProps {
  children: React.ReactNode;
  translationKey: string;
  fallback?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const TranslatedTooltip: React.FC<TranslatedTooltipProps> = ({
  children,
  translationKey,
  fallback,
  side = 'top',
  align = 'center',
}) => {
  const { t } = useI18n();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{t(translationKey) || fallback || translationKey}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
