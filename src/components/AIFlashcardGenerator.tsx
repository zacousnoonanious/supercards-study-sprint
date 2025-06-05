import React from 'react';
import { Button } from '@/components/ui/button';
import { CanvasElement } from '@/types/flashcard';

interface AIFlashcardGeneratorProps {
  onAddElement: (type: string) => void;
  selectedElement: CanvasElement | null;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
}

export const AIFlashcardGenerator: React.FC<AIFlashcardGeneratorProps> = ({
  onAddElement,
  selectedElement,
  onUpdateElement,
}) => {
  const [question, setQuestion] = React.useState('');
  const [answer, setAnswer] = React.useState('');

  const generateCard = async () => {
    // Basic validation
    if (!question.trim() || !answer.trim()) {
      alert('Please fill in both question and answer fields.');
      return;
    }

    addTextElement(question, true);
    addTextElement(answer);

    // Clear the input fields after generating the card
    setQuestion('');
    setAnswer('');
  };

  const addTextElement = (text: string, isQuestion: boolean = false) => {
    // Calculate appropriate dimensions based on text length
    const estimatedCharWidth = 8; // Average character width in pixels
    const estimatedLineHeight = 20; // Line height in pixels
    const maxWidth = 600; // Maximum width before wrapping
    const padding = 20; // Padding inside the element
    
    // Estimate how many lines the text will need
    const wordsPerLine = Math.floor(maxWidth / (estimatedCharWidth * 6)); // Rough estimate
    const words = text.split(' ');
    const estimatedLines = Math.ceil(words.length / wordsPerLine);
    
    // Calculate dimensions
    const textWidth = Math.min(text.length * estimatedCharWidth + padding, maxWidth);
    const textHeight = Math.max(estimatedLines * estimatedLineHeight + padding, 60);
    
    const newElement: CanvasElement = {
      id: Date.now().toString() + Math.random(),
      type: 'text',
      x: isQuestion ? 50 : 400,
      y: isQuestion ? 50 : 200,
      width: textWidth,
      height: textHeight,
      rotation: 0,
      zIndex: 0,
      content: text,
      fontSize: 16,
      color: '#000000',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
    };

    onAddElement('text');
    setTimeout(() => {
      onUpdateElement(newElement.id, newElement);
    }, 100);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">AI Flashcard Generator</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700">Question:</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Answer:</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      </div>
      <Button onClick={generateCard}>Generate Card</Button>
    </div>
  );
};
