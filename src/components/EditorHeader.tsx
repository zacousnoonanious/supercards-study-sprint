
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/contexts/I18nContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Check, X, Edit, Grid3x3 } from 'lucide-react';
import { FlashcardSet } from '@/types/flashcard';

interface EditorHeaderProps {
  set: FlashcardSet;
  onSave: () => void;
  isEditingDeckName: boolean;
  deckName: string;
  onDeckNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onShowCardOverview?: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ 
  set, 
  onSave,
  isEditingDeckName,
  deckName,
  onDeckNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onShowCardOverview
}) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(`/sets/${set.id}`)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('back')}
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('edit')}:</span>
              {isEditingDeckName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={deckName}
                    onChange={(e) => onDeckNameChange(e.target.value)}
                    className="h-8 text-lg font-bold text-indigo-600"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveEdit();
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSaveEdit}
                    className="h-8 w-8 p-0 text-green-600"
                    title={t('save')}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelEdit}
                    className="h-8 w-8 p-0 text-red-600"
                    title={t('cancel')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-indigo-600">{deckName}</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onStartEdit}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                    title={t('edit')}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {onShowCardOverview && (
              <Button onClick={onShowCardOverview} variant="outline">
                <Grid3x3 className="w-4 h-4 mr-2" />
                {t('dashboard.viewCards')}
              </Button>
            )}
            <Button onClick={onSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              {t('save')}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
