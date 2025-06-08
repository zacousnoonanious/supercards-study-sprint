
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditableDeckTitleProps {
  title: string;
  onTitleUpdate: (newTitle: string) => Promise<void>;
  className?: string;
}

export const EditableDeckTitle: React.FC<EditableDeckTitleProps> = ({
  title,
  onTitleUpdate,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (editValue.trim() === title) {
      setIsEditing(false);
      return;
    }

    if (!editValue.trim()) {
      toast({
        title: "Error",
        description: "Title cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await onTitleUpdate(editValue.trim());
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Deck title updated"
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive"
      });
      setEditValue(title); // Reset to original
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-2xl font-bold h-auto border-none px-0 focus-visible:ring-0"
          disabled={isLoading}
          autoFocus
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 group ${className}`}>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
