
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ParsedCard } from '@/types/import';
import { parseGoogleDoc } from '@/utils/import/googleDocsParser';

interface GoogleDocsImportProps {
  onParseComplete: (cards: ParsedCard[], source: { type: string; url: string }) => void;
}

export const GoogleDocsImport: React.FC<GoogleDocsImportProps> = ({ onParseComplete }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a Google Docs URL",
        variant: "destructive",
      });
      return;
    }

    // Validate Google Docs URL
    if (!url.includes('docs.google.com/document')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Google Docs URL",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const cards = await parseGoogleDoc(url);
      
      if (cards.length === 0) {
        throw new Error('No flashcards found in the document');
      }

      onParseComplete(cards, { type: 'google_docs', url });
      
      toast({
        title: "Document imported successfully",
        description: `Found ${cards.length} flashcard(s)`,
      });
    } catch (error) {
      console.error('Error importing Google Doc:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import document",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Import from Google Docs
          </CardTitle>
          <CardDescription>
            Import flashcards from a public Google Docs document. The document should be structured with headings or clear Q&A format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google-docs-url">Google Docs URL</Label>
            <Input
              id="google-docs-url"
              placeholder="https://docs.google.com/document/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          <Button 
            onClick={handleImport} 
            disabled={isProcessing || !url.trim()}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            {isProcessing ? 'Importing...' : 'Import from Google Docs'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-sm space-y-2">
            <p className="font-medium">Document Format Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use headings (H1, H2) to separate question and answer sections</li>
              <li>Format as "Question: ... Answer: ..." pairs</li>
              <li>Use bullet points for multiple choice questions</li>
              <li>Make sure the document is publicly accessible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
