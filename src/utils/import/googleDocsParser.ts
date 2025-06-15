
import { ParsedCard } from '@/types/import';

export const parseGoogleDoc = async (url: string): Promise<ParsedCard[]> => {
  try {
    // Convert Google Docs URL to export format
    const docId = extractDocId(url);
    if (!docId) {
      throw new Error('Invalid Google Docs URL');
    }

    // Export as plain text
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    
    const response = await fetch(exportUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch document. Make sure it\'s publicly accessible.');
    }

    const text = await response.text();
    return parseTextContent(text);
    
  } catch (error) {
    console.error('Error parsing Google Doc:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to import Google Docs document.');
  }
};

const extractDocId = (url: string): string | null => {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

const parseTextContent = (text: string): ParsedCard[] => {
  const cards: ParsedCard[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  let currentQuestion = '';
  let currentAnswer = '';
  let isAnswerSection = false;

  for (const line of lines) {
    // Look for Q&A patterns
    if (line.toLowerCase().startsWith('q:') || line.toLowerCase().startsWith('question:')) {
      // Save previous card if we have one
      if (currentQuestion && currentAnswer) {
        cards.push({
          front: currentQuestion,
          back: currentAnswer,
          metadata: { source: 'google_docs' }
        });
      }
      
      currentQuestion = line.replace(/^(q:|question:)/i, '').trim();
      currentAnswer = '';
      isAnswerSection = false;
    } else if (line.toLowerCase().startsWith('a:') || line.toLowerCase().startsWith('answer:')) {
      currentAnswer = line.replace(/^(a:|answer:)/i, '').trim();
      isAnswerSection = true;
    } else if (isAnswerSection && currentAnswer) {
      // Continue building the answer
      currentAnswer += ' ' + line;
    } else if (!isAnswerSection && currentQuestion) {
      // Continue building the question
      currentQuestion += ' ' + line;
    }
  }

  // Don't forget the last card
  if (currentQuestion && currentAnswer) {
    cards.push({
      front: currentQuestion,
      back: currentAnswer,
      metadata: { source: 'google_docs' }
    });
  }

  return cards;
};
