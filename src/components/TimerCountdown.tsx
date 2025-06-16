
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

interface TimerCountdownProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  className?: string;
}

export const TimerCountdown: React.FC<TimerCountdownProps> = ({
  duration,
  onTimeUp,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  if (duration <= 0) return null;

  return (
    <div className={`flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm ${className}`}>
      <Timer className="w-4 h-4 text-blue-500" />
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-gray-700">
          {formatTime(timeLeft)}
        </span>
        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>
    </div>
  );
};
