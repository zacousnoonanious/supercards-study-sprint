
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { FlashcardSet } from '@/types/flashcard';

interface EditorHeaderProps {
  set: FlashcardSet;
  onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({ set, onSave }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(`/set/${set.id}`)}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Set
            </Button>
            <h1 className="text-xl font-bold text-indigo-600">
              Editing: {set.title}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={onSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
