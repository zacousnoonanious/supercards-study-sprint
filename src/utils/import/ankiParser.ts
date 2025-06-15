
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import { ParsedCard } from '@/types/import';

interface AnkiNote {
  id: number;
  flds: string; // Fields separated by \x1f
  tags: string;
  mid: number; // Model ID
}

interface AnkiModel {
  id: number;
  name: string;
  flds: Array<{ name: string; ord: number }>;
}

export const parseAnkiFile = async (file: File): Promise<ParsedCard[]> => {
  try {
    console.log('Starting Anki file parsing for:', file.name);
    
    // Load the ZIP file
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);
    
    // Look for the collection.anki2 database file
    const dbFile = zipData.file('collection.anki2');
    if (!dbFile) {
      throw new Error('Invalid Anki file: collection.anki2 not found');
    }
    
    // Extract the SQLite database
    const dbArrayBuffer = await dbFile.async('arraybuffer');
    
    // Initialize SQL.js
    const SQL = await initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`
    });
    
    // Load the database
    const db = new SQL.Database(new Uint8Array(dbArrayBuffer));
    
    // Get all notes (cards data)
    const notesQuery = db.exec("SELECT id, flds, tags, mid FROM notes");
    if (!notesQuery.length) {
      throw new Error('No notes found in Anki file');
    }
    
    // Get all models (card templates)
    const modelsQuery = db.exec("SELECT models FROM col");
    if (!modelsQuery.length) {
      throw new Error('No models found in Anki file');
    }
    
    const modelsJson = JSON.parse(modelsQuery[0].values[0][0] as string);
    const models: { [key: string]: AnkiModel } = modelsJson;
    
    const cards: ParsedCard[] = [];
    const notes = notesQuery[0].values;
    
    console.log(`Processing ${notes.length} notes from Anki file`);
    
    for (const noteRow of notes) {
      const [id, flds, tags, mid] = noteRow;
      
      // Find the model for this note
      const model = models[mid as string];
      if (!model) {
        console.warn(`Model not found for note ${id}, skipping`);
        continue;
      }
      
      // Split fields by the Anki field separator
      const fields = (flds as string).split('\x1f');
      
      // Map fields based on model structure
      const fieldNames = model.flds.map(f => f.name);
      
      // For most Anki cards, we'll use the first field as front and second as back
      let front = '';
      let back = '';
      
      if (fields.length >= 1) {
        front = cleanAnkiHtml(fields[0] || '');
      }
      
      if (fields.length >= 2) {
        back = cleanAnkiHtml(fields[1] || '');
      } else if (fields.length === 1) {
        // Single field cards - use the content as back and generate a simple front
        back = front;
        front = `Card from ${model.name}`;
      }
      
      // Skip empty cards
      if (!front.trim() && !back.trim()) {
        continue;
      }
      
      // Parse tags
      const cardTags = tags ? (tags as string).split(' ').filter(Boolean) : [];
      
      cards.push({
        front: front || 'No front content',
        back: back || 'No back content',
        tags: cardTags,
        metadata: {
          source: 'anki',
          ankiNoteId: id,
          ankiModelName: model.name,
          fieldNames: fieldNames,
          allFields: fields.map((field, index) => ({
            name: fieldNames[index] || `Field ${index + 1}`,
            content: cleanAnkiHtml(field)
          }))
        }
      });
    }
    
    db.close();
    
    console.log(`Successfully parsed ${cards.length} cards from Anki file`);
    return cards;
    
  } catch (error) {
    console.error('Error parsing Anki file:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('collection.anki2')) {
        throw new Error('Invalid Anki file format. Please ensure you\'re uploading a valid .apkg file exported from Anki.');
      }
      throw error;
    }
    
    throw new Error('Failed to parse Anki file. Please ensure it\'s a valid .apkg file exported from Anki.');
  }
};

/**
 * Clean HTML content from Anki fields and convert to plain text
 */
function cleanAnkiHtml(html: string): string {
  if (!html) return '';
  
  // Remove HTML tags but preserve line breaks
  let cleaned = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
  
  // Clean up multiple newlines
  cleaned = cleaned.replace(/\n\s*\n/g, '\n').trim();
  
  return cleaned;
}
