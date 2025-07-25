
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
    // Letter initials option
    'initials',
    // Cartoon character profile pictures
    '/lovable-uploads/1274a091-d94b-4e6f-a061-ceb2e1c93c54.png',
    '/lovable-uploads/8a13a67a-f28a-4f75-b538-dcfbf5b15e19.png',
    '/lovable-uploads/f000cfc9-befb-4af4-8a46-4bed2264daf8.png',
    '/lovable-uploads/eac469c3-66fd-4775-87fb-65a43eda90c5.png',
    '/lovable-uploads/ae30cfff-0b93-4759-93c9-7dae17b296c8.png',
    '/lovable-uploads/a28c8b5b-a7c4-45bf-9365-884e2f0daa6b.png',
    '/lovable-uploads/c33ada4d-5f56-46da-83c7-a70c7d4d3b9b.png',
    '/lovable-uploads/cf6e51ac-6b78-4e0f-af67-47b65b53d9cc.png',
    '/lovable-uploads/02dff4bc-318b-45f8-9c6e-3016ab6c2623.png',
    // Bright colored shapes
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful1&backgroundColor=ff6b6b',
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful2&backgroundColor=4ecdc4',
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful3&backgroundColor=45b7d1',
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful4&backgroundColor=f9ca24',
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful5&backgroundColor=f0932b',
    'https://api.dicebear.com/7.x/shapes/svg?seed=colorful6&backgroundColor=eb4d4b',
    // Nature photos from Unsplash
    'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop&crop=center',
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderAvatarContent = (avatar: string, index: number) => {
    if (avatar === 'initials') {
      // This would ideally use the user's actual name, but for demo purposes using "User"
      const initials = getInitials('User Name');
      return (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
          {initials}
        </div>
      );
    }
    
    return (
      <img
        src={avatar}
        alt={`Avatar ${index + 1}`}
        className="w-full h-full rounded-full object-cover"
      />
    );
  };

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
              className="h-20 w-20 p-0 rounded-full overflow-hidden hover:scale-105 transition-transform"
              onClick={() => {
                onSelectAvatar(avatar === 'initials' ? 'initials' : avatar);
                onClose();
              }}
            >
              {renderAvatarContent(avatar, index)}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
