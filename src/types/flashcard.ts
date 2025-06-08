export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'youtube' | 'deck-embed' | 'drawing' | 'audio';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  imageUrl?: string;
  audioUrl?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  color?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  hyperlink?: string;
  mcOptions?: string[];
  mcCorrectAnswer?: number;
  mcCorrectAnswers?: number[];
  mcType?: 'single' | 'multiple';
  tfCorrectAnswer?: boolean;
  fillInBlankText?: string;
  fillInBlankBlanks?: Array<{
    word: string;
    position: number;
    id: string;
  }>;
  fillInBlankMode?: 'every-nth' | 'random' | 'sentence-start' | 'manual' | 'significant-words';
  fillInBlankInterval?: number;
  fillInBlankPercentage?: number;
  showLetterCount?: boolean;
  ignoreCase?: boolean;
  youtubeUrl?: string;
  deckId?: string;
  deckTitle?: string;
  drawingData?: string;
  strokeColor?: string;
  strokeWidth?: number;
}
