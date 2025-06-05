
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Check } from 'lucide-react';

interface AvatarSelectorProps {
  currentAvatarUrl: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  onClose: () => void;
}

const avatarOptions = [
  { id: 'pawn', url: 'https://images.unsplash.com/photo-1611195974226-ef16f8959a4b?w=200&h=200&fit=crop&crop=center', name: 'Chess Pawn' },
  { id: 'piano', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=200&h=200&fit=crop&crop=center', name: 'Piano Keys' },
  { id: 'diamond', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop&crop=center', name: 'Diamond' },
  { id: 'compass', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop&crop=center', name: 'Compass' },
  { id: 'lightbulb', url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200&h=200&fit=crop&crop=center', name: 'Light Bulb' },
  { id: 'feather', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&h=200&fit=crop&crop=center', name: 'Feather' },
  { id: 'origami', url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=200&fit=crop&crop=center', name: 'Origami' },
  { id: 'geometric', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=200&h=200&fit=crop&crop=center', name: 'Geometric' },
  { id: 'crystal', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200&h=200&fit=crop&crop=center', name: 'Crystal' },
  { id: 'leaf', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop&crop=center', name: 'Leaf' },
  { id: 'butterfly', url: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=200&h=200&fit=crop&crop=center', name: 'Butterfly' },
  { id: 'shell', url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop&crop=center', name: 'Shell' },
  { id: 'flower', url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=200&h=200&fit=crop&crop=center', name: 'Flower' },
  { id: 'moon', url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=200&h=200&fit=crop&crop=center', name: 'Moon' },
  { id: 'star', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&h=200&fit=crop&crop=center', name: 'Star' },
  { id: 'key', url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=200&h=200&fit=crop&crop=center', name: 'Vintage Key' },
  { id: 'clock', url: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?w=200&h=200&fit=crop&crop=center', name: 'Clock' },
  { id: 'book', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop&crop=center', name: 'Book' },
  { id: 'camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&h=200&fit=crop&crop=center', name: 'Camera' },
  { id: 'tree', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop&crop=center', name: 'Tree' },
];

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  onClose,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl);

  const handleSave = () => {
    onAvatarChange(selectedAvatar);
    onClose();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Select Your Profile Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection Preview */}
        <div className="flex justify-center items-center gap-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={selectedAvatar} alt="Selected Avatar" />
            <AvatarFallback>
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Avatar Options Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {avatarOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedAvatar(option.url)}
              className={`relative p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedAvatar === option.url
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={option.name}
            >
              <Avatar className="w-16 h-16 mx-auto">
                <AvatarImage src={option.url} alt={option.name} />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              {selectedAvatar === option.url && (
                <div className="absolute -top-1 -right-1 bg-indigo-500 text-white rounded-full p-1">
                  <Check className="w-3 h-3" />
                </div>
              )}
              <span className="text-xs text-center block mt-1 truncate">{option.name}</span>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Avatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
