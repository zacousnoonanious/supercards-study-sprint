
import { ParsedCard } from '@/types/import';

export const parseQuizletFile = async (file: File): Promise<ParsedCard[]> => {
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const cards: ParsedCard[] = [];

    for (const line of lines) {
      // Quizlet format is typically "term\tdefinition" or "term,definition"
      let parts: string[];
      
      if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else {
        continue; // Skip lines that don't match expected format
      }

      if (parts.length >= 2) {
        const front = parts[0].trim();
        const back = parts.slice(1).join(',').trim(); // In case the answer contains commas
        
        if (front && back) {
          cards.push({
            front,
            back,
            metadata: { source: 'quizlet' }
          });
        }
      }
    }

    return cards;
  } catch (error) {
    console.error('Error parsing Quizlet file:', error);
    throw new Error('Failed to parse Quizlet file. Please ensure it\'s in the correct format.');
  }
};
