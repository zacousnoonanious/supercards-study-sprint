
export interface CanvasElement {
  id: string;
  type: 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  imageUrl?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  front_elements: CanvasElement[];
  back_elements: CanvasElement[];
  created_at: string;
  updated_at: string;
  set_id: string;
  last_reviewed_at: string | null;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}
