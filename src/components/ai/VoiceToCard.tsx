
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface VoiceToCardProps {
  onCreateCard: (question: string, answer: string) => void;
  onClose: () => void;
}

export const VoiceToCard: React.FC<VoiceToCardProps> = ({
  onCreateCard,
  onClose,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [structuredContent, setStructuredContent] = useState<{
    question: string;
    answer: string;
  } | null>(null);
  const [cardType, setCardType] = useState('definition');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak your flashcard content clearly.",
      });

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Simulate speech-to-text processing
      const simulatedTranscript = await simulateSpeechToText(audioBlob);
      setTranscript(simulatedTranscript);
      
      // Structure the content based on card type
      const structured = await structureContent(simulatedTranscript, cardType);
      setStructuredContent(structured);
      
      toast({
        title: "Voice processed!",
        description: "Your speech has been converted to flashcard content.",
      });

    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: "Processing failed",
        description: "Could not process your voice recording.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulate speech-to-text conversion
  const simulateSpeechToText = async (audioBlob: Blob): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return sample transcript based on card type
    switch (cardType) {
      case 'definition':
        return "Photosynthesis is the process by which plants use sunlight, carbon dioxide, and water to produce glucose and oxygen. This process occurs in the chloroplasts of plant cells and is essential for plant growth and survival.";
      case 'qa':
        return "What is the capital of France? The capital of France is Paris. It is located in the north-central part of the country and is known for landmarks like the Eiffel Tower and Louvre Museum.";
      case 'fact':
        return "The human brain contains approximately 86 billion neurons. These neurons communicate through electrical and chemical signals, forming the basis of all human thought, memory, and behavior.";
      default:
        return "This is a sample transcript of your voice input. The AI would normally convert your actual speech into text here.";
    }
  };

  // Structure content into question/answer format
  const structureContent = async (text: string, type: string): Promise<{ question: string; answer: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (type) {
      case 'definition':
        const terms = text.split(' is ');
        if (terms.length >= 2) {
          return {
            question: `What is ${terms[0]}?`,
            answer: terms.slice(1).join(' is ')
          };
        }
        break;
      case 'qa':
        const qaParts = text.split('?');
        if (qaParts.length >= 2) {
          return {
            question: qaParts[0] + '?',
            answer: qaParts.slice(1).join('').trim()
          };
        }
        break;
      case 'fact':
        return {
          question: 'True or False?',
          answer: text
        };
    }
    
    // Default structure
    const sentences = text.split('. ');
    return {
      question: sentences[0] || 'Question',
      answer: sentences.slice(1).join('. ') || text
    };
  };

  const createFlashcard = () => {
    if (structuredContent) {
      onCreateCard(structuredContent.question, structuredContent.answer);
      toast({
        title: "Flashcard created!",
        description: "Your voice input has been converted to a flashcard.",
      });
      onClose();
    }
  };

  const resetRecording = () => {
    setTranscript('');
    setStructuredContent(null);
    chunksRef.current = [];
  };

  return (
    <Card className="w-96 max-w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="w-5 h-5" />
          Voice-to-Card
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Card Type</label>
          <Select value={cardType} onValueChange={setCardType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="definition">Definition</SelectItem>
              <SelectItem value="qa">Question & Answer</SelectItem>
              <SelectItem value="fact">Fact Statement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            size="lg"
            className={`w-20 h-20 rounded-full ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-8 h-8" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-gray-600">
          {isProcessing ? (
            "Processing your voice..."
          ) : isRecording ? (
            "Recording... Click to stop"
          ) : (
            "Click to start recording"
          )}
        </div>

        {transcript && (
          <div>
            <label className="text-sm font-medium mb-2 block">Transcript</label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              className="min-h-20"
              placeholder="Your speech will appear here..."
            />
          </div>
        )}

        {structuredContent && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Textarea
                value={structuredContent.question}
                onChange={(e) => setStructuredContent(prev => 
                  prev ? { ...prev, question: e.target.value } : null
                )}
                className="min-h-16"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Answer</label>
              <Textarea
                value={structuredContent.answer}
                onChange={(e) => setStructuredContent(prev => 
                  prev ? { ...prev, answer: e.target.value } : null
                )}
                className="min-h-20"
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {structuredContent && (
            <Button onClick={createFlashcard} className="flex-1">
              Create Card
            </Button>
          )}
          <Button onClick={resetRecording} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={onClose} variant="outline" size="sm">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
