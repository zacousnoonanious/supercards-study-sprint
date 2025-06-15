
import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { cn } from '@/lib/utils';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-orange-500 text-white text-center py-2 px-4",
      "text-sm font-medium shadow-lg"
    )}>
      <div className="flex items-center justify-center space-x-2">
        <WifiOff className="w-4 h-4" />
        <span>You're offline. Study progress will sync when reconnected.</span>
      </div>
    </div>
  );
};
