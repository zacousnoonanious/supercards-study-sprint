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
    // Cute mascot characters
    '/lovable-uploads/1274a091-d94b-4e6f-a061-ceb2e1c93c54.png', // Yellow devil with horns
    '/lovable-uploads/ae30cfff-0b93-4759-93c9-7dae17b296c8.png', // Purple creature writing
    '/lovable-uploads/8a13a67a-f28a-4f75-b538-dcfbf5b15e19.png', // Teal robot with A card
    '/lovable-uploads/a28c8b5b-a7c4-45bf-9365-884e2f0daa6b.png', // Orange owl with glasses
    '/lovable-uploads/f000cfc9-befb-4af4-8a46-4bed2264daf8.png', // Orange chick with star card
    '/lovable-uploads/c33ada4d-5f56-46da-83c7-a70c7d4d3b9b.png', // Purple creature with books
    '/lovable-uploads/cf6e51ac-6b78-4e0f-af67-47b65b53d9cc.png', // Orange owl with floating cards
    '/lovable-uploads/02dff4bc-318b-45f8-9c6e-3016ab6c2623.png', // Yellow fluffy creature with card
    '/lovable-uploads/eac469c3-66fd-4775-87fb-65a43eda90c5.png', // Purple creature at desk
    // Keep some generated options
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Avatar</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {avatars.map((avatar, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 w-20 p-1 hover:scale-105 transition-transform"
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
