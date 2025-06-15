
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, File, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParsedCard } from '@/types/import';
import { parseAnkiFile } from '@/utils/import/ankiParser';
import { parseQuizletFile } from '@/utils/import/quizletParser';
import { parseCsvFile } from '@/utils/import/csvParser';
import { parsePdfFile } from '@/utils/import/pdfParser';

interface FileUploadImportProps {
  onParseComplete: (cards: ParsedCard[], source: { type: string; filename: string }) => void;
}

export const FileUploadImport: React.FC<FileUploadImportProps> = ({ onParseComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      let cards: ParsedCard[] = [];
      let sourceType = '';

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      switch (fileExtension) {
        case 'apkg':
          cards = await parseAnkiFile(file);
          sourceType = 'anki';
          break;
        case 'txt':
          cards = await parseQuizletFile(file);
          sourceType = 'quizlet';
          break;
        case 'csv':
        case 'tsv':
          cards = await parseCsvFile(file);
          sourceType = 'csv';
          break;
        case 'pdf':
          cards = await parsePdfFile(file);
          sourceType = 'pdf';
          break;
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      if (cards.length === 0) {
        throw new Error('No flashcards found in the file');
      }

      onParseComplete(cards, { type: sourceType, filename: file.name });
      
      toast({
        title: "File parsed successfully",
        description: `Found ${cards.length} flashcard(s)`,
      });
    } catch (error) {
      console.error('Error parsing file:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to parse file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const supportedFormats = [
    {
      icon: Database,
      title: 'Anki Deck (.apkg)',
      description: 'Import from Anki export files',
      accept: '.apkg'
    },
    {
      icon: FileText,
      title: 'Quizlet (.txt)',
      description: 'Tab-separated question and answer format',
      accept: '.txt'
    },
    {
      icon: File,
      title: 'CSV/TSV Files',
      description: 'Comma or tab-separated values',
      accept: '.csv,.tsv'
    },
    {
      icon: FileText,
      title: 'PDF Documents',
      description: 'Extract Q&A from PDF structure',
      accept: '.pdf'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {supportedFormats.map((format, index) => (
          <Card key={index} className="relative">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <format.icon className="w-4 h-4" />
                {format.title}
              </CardTitle>
              <CardDescription className="text-xs">
                {format.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept={format.accept}
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isProcessing}
                  className="w-full"
                  asChild
                >
                  <span>
                    <Upload className="w-3 h-3 mr-1" />
                    {isProcessing ? 'Processing...' : 'Choose File'}
                  </span>
                </Button>
              </label>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Supported formats: .apkg (Anki), .txt (Quizlet), .csv/.tsv, .pdf</p>
        <p>Maximum file size: 50MB</p>
      </div>
    </div>
  );
};
