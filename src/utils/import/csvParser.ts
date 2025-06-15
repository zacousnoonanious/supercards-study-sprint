
import { ParsedCard } from '@/types/import';

export const parseCsvFile = async (file: File): Promise<ParsedCard[]> => {
  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const cards: ParsedCard[] = [];

    const delimiter = file.name.endsWith('.tsv') ? '\t' : ',';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(delimiter);

      // Skip header row if it looks like headers
      if (i === 0 && (parts[0].toLowerCase().includes('question') || parts[0].toLowerCase().includes('term'))) {
        continue;
      }

      if (parts.length >= 2) {
        const front = parts[0].trim().replace(/^"(.*)"$/, '$1'); // Remove quotes
        const back = parts[1].trim().replace(/^"(.*)"$/, '$1');
        
        if (front && back) {
          cards.push({
            front,
            back,
            metadata: { source: 'csv', row: i + 1 }
          });
        }
      }
    }

    return cards;
  } catch (error) {
    console.error('Error parsing CSV file:', error);
    throw new Error('Failed to parse CSV file. Please ensure it has at least two columns.');
  }
};
