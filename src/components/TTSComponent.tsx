
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { CanvasElement } from '@/types/flashcard';

interface TTSComponentProps {
  element: CanvasElement;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  isEditing?: boolean;
  autoplay?: boolean;
}

export const TTSComponent: React.FC<TTSComponentProps> = ({
  element,
  onUpdate,
  isEditing = false,
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Check if Google Neural TTS is available (API key set)
  const hasGoogleTTS = !!localStorage.getItem('google_tts_api_key');

  const stopSpeech = useCallback(() => {
    if (currentUtterance) {
      speechSynthesis.cancel();
      setCurrentUtterance(null);
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, [currentUtterance]);

  const playWithBrowserTTS = useCallback(async () => {
    if (!element.content) return;

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(element.content);
    utterance.rate = element.ttsRate || 1;
    utterance.pitch = element.ttsPitch || 1;
    
    if (element.ttsVoice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === element.ttsVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    setIsLoading(true);
    speechSynthesis.speak(utterance);
  }, [element, stopSpeech]);

  const playWithGoogleTTS = useCallback(async () => {
    if (!element.content) return;

    setIsLoading(true);
    stopSpeech();

    try {
      const apiKey = localStorage.getItem('google_tts_api_key');
      if (!apiKey) {
        throw new Error('Google TTS API key not found');
      }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: element.content },
          voice: {
            languageCode: 'en-US',
            name: element.ttsVoice || 'en-US-Neural2-F',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: element.ttsRate || 1,
            pitch: element.ttsPitch || 0
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const data = await response.json();
      const audioContent = data.audioContent;

      // Create audio element and play
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      
      audio.onloadstart = () => setIsLoading(true);
      audio.oncanplaythrough = () => setIsLoading(false);
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoading(false);
        console.error('Audio playback error');
      };

      await audio.play();

    } catch (error) {
      console.error('Google TTS error:', error);
      setIsLoading(false);
      // Fallback to browser TTS
      playWithBrowserTTS();
    }
  }, [element, stopSpeech, playWithBrowserTTS]);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      stopSpeech();
    } else {
      if (hasGoogleTTS) {
        playWithGoogleTTS();
      } else {
        playWithBrowserTTS();
      }
    }
  }, [isPlaying, hasGoogleTTS, playWithGoogleTTS, playWithBrowserTTS, stopSpeech]);

  // Auto-play functionality
  useEffect(() => {
    if (autoplay && element.ttsAutoplay && element.content && !isEditing) {
      const timer = setTimeout(() => {
        handlePlay();
      }, 500); // Small delay to avoid conflicts
      
      return () => clearTimeout(timer);
    }
  }, [autoplay, element.ttsAutoplay, element.content, isEditing, handlePlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [stopSpeech]);

  if (!element.hasTTS) return null;

  return (
    <div className="flex items-center gap-1 p-1">
      <Button
        variant="ghost"
        size="sm"
        className="w-6 h-6 p-0"
        onClick={handlePlay}
        disabled={isLoading || !element.content}
        title={isPlaying ? 'Stop TTS' : 'Play TTS'}
      >
        {isLoading ? (
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3 h-3" />
        ) : (
          <Play className="w-3 h-3" />
        )}
      </Button>
      
      {/* TTS indicator */}
      <div className="flex items-center">
        {hasGoogleTTS ? (
          <Volume2 className="w-3 h-3 text-blue-500" title="Google Neural TTS" />
        ) : (
          <VolumeX className="w-3 h-3 text-gray-500" title="Browser TTS" />
        )}
      </div>
    </div>
  );
};
