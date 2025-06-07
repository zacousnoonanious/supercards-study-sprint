
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit3 } from 'lucide-react';

interface TextInputModalProps {
  value: string;
  onSave: (text: string) => void;
  placeholder?: string;
  buttonText?: string;
  title?: string;
}

export const TextInputModal: React.FC<TextInputModalProps> = ({
  value,
  onSave,
  placeholder = "Enter your text here...",
  buttonText = "Edit Text",
  title = "Edit Text"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localText, setLocalText] = useState(value);

  const handleSave = () => {
    onSave(localText);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalText(value); // Reset to original value
    setIsOpen(false);
  };

  // Update local text when value prop changes
  React.useEffect(() => {
    setLocalText(value);
  }, [value]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Edit3 className="w-4 h-4 mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="text-input">Text Content:</Label>
            <Textarea
              id="text-input"
              value={localText}
              onChange={(e) => setLocalText(e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] max-h-[400px] resize-y"
              rows={8}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {localText.length} characters • {localText.trim().split(/\s+/).filter(w => w.length > 0).length} words
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Text
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
