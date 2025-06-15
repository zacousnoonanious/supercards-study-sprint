
import { useState, useRef, useCallback } from 'react';

interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export const useGestures = (handlers: GestureHandlers) => {
  const [isPressed, setIsPressed] = useState(false);
  const startPos = useRef<TouchPosition | null>(null);
  const lastTap = useRef<number>(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const minSwipeDistance = 50;
  const maxSwipeTime = 300;
  const longPressDelay = 500;
  const doubleTapDelay = 300;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    setIsPressed(true);

    // Start long press timer
    if (handlers.onLongPress) {
      longPressTimer.current = setTimeout(() => {
        handlers.onLongPress?.();
        setIsPressed(false);
      }, longPressDelay);
    }

    // Add haptic feedback if supported
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, [handlers]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startPos.current) return;

    const touch = e.changedTouches[0];
    const endPos = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    const deltaX = endPos.x - startPos.current.x;
    const deltaY = endPos.y - startPos.current.y;
    const deltaTime = endPos.time - startPos.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    setIsPressed(false);

    // Check for swipe gestures
    if (distance > minSwipeDistance && deltaTime < maxSwipeTime) {
      const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
      
      if (Math.abs(angle) < 45) {
        // Right swipe
        handlers.onSwipeRight?.();
      } else if (Math.abs(angle) > 135) {
        // Left swipe
        handlers.onSwipeLeft?.();
      } else if (angle < -45 && angle > -135) {
        // Up swipe
        handlers.onSwipeUp?.();
      } else if (angle > 45 && angle < 135) {
        // Down swipe
        handlers.onSwipeDown?.();
      }
      return;
    }

    // Check for tap gestures
    if (distance < 10) {
      const now = Date.now();
      
      if (now - lastTap.current < doubleTapDelay && handlers.onDoubleTap) {
        handlers.onDoubleTap();
        lastTap.current = 0; // Reset to prevent triple tap
      } else {
        lastTap.current = now;
        setTimeout(() => {
          if (lastTap.current === now) {
            handlers.onTap?.();
          }
        }, doubleTapDelay);
      }
    }

    startPos.current = null;
  }, [handlers]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsPressed(false);
    startPos.current = null;
  }, []);

  return {
    isPressed,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    }
  };
};
