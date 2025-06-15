
export interface ParsedCard {
  front: string;
  back: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ImportSource {
  type: 'anki' | 'quizlet' | 'csv' | 'txt' | 'pdf' | 'google_docs';
  filename?: string;
  url?: string;
}

export interface ImportLog {
  id: string;
  user_id: string;
  source: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  imported_at: string;
  source_url?: string;
  original_filename?: string;
  deck_id?: string;
  cards_imported: number;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
