
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Globe, FileUp } from 'lucide-react';
import { FileUploadImport } from './import/FileUploadImport';
import { GoogleDocsImport } from './import/GoogleDocsImport';
import { ImportPreview } from './import/ImportPreview';
import { ParsedCard } from '@/types/import';

interface ImportFlashcardsDialogProps {
  trigger?: React.ReactNode;
  onImportComplete?: (deckId: string, cardsImported: number) => void;
}

export const ImportFlashcardsDialog: React.FC<ImportFlashcardsDialogProps> = ({
  trigger,
  onImportComplete
}) => {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'import' | 'preview'>('import');
  const [parsedCards, setParsedCards] = useState<ParsedCard[]>([]);
  const [sourceInfo, setSourceInfo] = useState<{ type: string; filename?: string; url?: string }>({
    type: ''
  });

  const handleParseComplete = (cards: ParsedCard[], source: { type: string; filename?: string; url?: string }) => {
    setParsedCards(cards);
    setSourceInfo(source);
    setCurrentStep('preview');
  };

  const handleImportComplete = (deckId: string, cardsImported: number) => {
    setOpen(false);
    setCurrentStep('import');
    setParsedCards([]);
    setSourceInfo({ type: '' });
    onImportComplete?.(deckId, cardsImported);
  };

  const handleBack = () => {
    setCurrentStep('import');
    setParsedCards([]);
  };

  // If no trigger is provided, render the content directly (for embedding in other components)
  if (!trigger) {
    return (
      <div className="w-full">
        {currentStep === 'import' ? (
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="google-docs" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Google Docs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-4">
              <FileUploadImport onParseComplete={handleParseComplete} />
            </TabsContent>
            
            <TabsContent value="google-docs" className="mt-4">
              <GoogleDocsImport onParseComplete={handleParseComplete} />
            </TabsContent>
          </Tabs>
        ) : (
          <ImportPreview
            cards={parsedCards}
            sourceInfo={sourceInfo}
            onImportComplete={handleImportComplete}
            onBack={handleBack}
          />
        )}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import Flashcards
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'import' ? 'Import Flashcards' : 'Preview Import'}
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'import' ? (
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files" className="flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="google-docs" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Google Docs
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-4">
              <FileUploadImport onParseComplete={handleParseComplete} />
            </TabsContent>
            
            <TabsContent value="google-docs" className="mt-4">
              <GoogleDocsImport onParseComplete={handleParseComplete} />
            </TabsContent>
          </Tabs>
        ) : (
          <ImportPreview
            cards={parsedCards}
            sourceInfo={sourceInfo}
            onImportComplete={handleImportComplete}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
