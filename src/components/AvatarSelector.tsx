
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AvatarSelectorProps {
  onSelectAvatar: (avatarUrl: string) => void;
  onClose: () => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  onSelectAvatar,
  onClose,
}) => {
  const avatars = [
    '/placeholder.svg',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4">
          {avatars.map((avatar, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 w-20 p-0"
              onClick={() => {
                onSelectAvatar(avatar);
                onClose();
              }}
            >
              <img
                src={avatar}
                alt={`Avatar ${index + 1}`}
                className="w-full h-full rounded object-cover"
              />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
