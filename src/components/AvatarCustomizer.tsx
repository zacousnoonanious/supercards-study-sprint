
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Palette, User } from 'lucide-react';

interface AvatarOptions {
  seed: string;
  backgroundColor: string;
  hair: string;
  hairColor: string;
  eyes: string;
  eyebrows: string;
  mouth: string;
  skinColor: string;
  accessories: string;
  clothingGraphic: string;
  clothing: string;
  clothingColor: string;
}

interface AvatarCustomizerProps {
  currentAvatarUrl: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  onClose: () => void;
}

const backgroundColors = [
  { value: 'b6e3f4', label: 'Light Blue' },
  { value: 'c0aede', label: 'Light Purple' },
  { value: 'ffd93d', label: 'Yellow' },
  { value: 'ffb3ba', label: 'Pink' },
  { value: 'bae1ff', label: 'Blue' },
  { value: 'ffffba', label: 'Light Yellow' },
  { value: 'ffdfba', label: 'Peach' },
  { value: 'baffc9', label: 'Light Green' },
];

const hairStyles = [
  { value: 'short01', label: 'Short 1' },
  { value: 'short02', label: 'Short 2' },
  { value: 'short03', label: 'Short 3' },
  { value: 'short04', label: 'Short 4' },
  { value: 'short05', label: 'Short 5' },
  { value: 'long01', label: 'Long 1' },
  { value: 'long02', label: 'Long 2' },
  { value: 'long03', label: 'Long 3' },
  { value: 'dreads01', label: 'Dreads 1' },
  { value: 'dreads02', label: 'Dreads 2' },
  { value: 'fonze01', label: 'Fonze' },
  { value: 'mrClean01', label: 'Bald' },
];

const hairColors = [
  { value: '724133', label: 'Brown' },
  { value: '2c1b18', label: 'Black' },
  { value: 'b58143', label: 'Blonde' },
  { value: 'a55728', label: 'Auburn' },
  { value: 'd6b370', label: 'Light Brown' },
  { value: 'c93305', label: 'Red' },
];

const eyeStyles = [
  { value: 'variant01', label: 'Default' },
  { value: 'variant02', label: 'Happy' },
  { value: 'variant03', label: 'Squint' },
  { value: 'variant04', label: 'Wink' },
  { value: 'variant05', label: 'Surprised' },
];

const eyebrowStyles = [
  { value: 'variant01', label: 'Default' },
  { value: 'variant02', label: 'Raised' },
  { value: 'variant03', label: 'Angry' },
  { value: 'variant04', label: 'Sad' },
];

const mouthStyles = [
  { value: 'variant01', label: 'Smile' },
  { value: 'variant02', label: 'Serious' },
  { value: 'variant03', label: 'Open' },
  { value: 'variant04', label: 'Surprised' },
  { value: 'variant05', label: 'Tongue' },
];

const skinColors = [
  { value: 'f2d3b1', label: 'Light' },
  { value: 'e4a853', label: 'Medium' },
  { value: 'a76f42', label: 'Tan' },
  { value: '8b5a2b', label: 'Dark' },
];

const accessories = [
  { value: 'none', label: 'None' },
  { value: 'glasses01', label: 'Glasses 1' },
  { value: 'glasses02', label: 'Glasses 2' },
  { value: 'sunglasses01', label: 'Sunglasses' },
  { value: 'eyepatch01', label: 'Eyepatch' },
];

const clothingStyles = [
  { value: 'shirt01', label: 'Shirt' },
  { value: 'shirt02', label: 'Polo' },
  { value: 'shirt03', label: 'Tank Top' },
  { value: 'shirt04', label: 'Sweater' },
  { value: 'shirt05', label: 'Hoodie' },
  { value: 'shirt06', label: 'Dress Shirt' },
];

const clothingColors = [
  { value: '3c4f5c', label: 'Dark Blue' },
  { value: '5199e4', label: 'Blue' },
  { value: '25557c', label: 'Navy' },
  { value: 'd84315', label: 'Orange' },
  { value: '4caf50', label: 'Green' },
  { value: 'e91e63', label: 'Pink' },
  { value: '9c27b0', label: 'Purple' },
  { value: 'f44336', label: 'Red' },
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  onClose,
}) => {
  const [options, setOptions] = React.useState<AvatarOptions>({
    seed: 'custom-avatar',
    backgroundColor: 'b6e3f4',
    hair: 'short01',
    hairColor: '724133',
    eyes: 'variant01',
    eyebrows: 'variant01',
    mouth: 'variant01',
    skinColor: 'f2d3b1',
    accessories: 'none',
    clothingGraphic: '',
    clothing: 'shirt01',
    clothingColor: '3c4f5c',
  });

  const generateAvatarUrl = (opts: AvatarOptions) => {
    const params = new URLSearchParams({
      seed: opts.seed,
      backgroundColor: opts.backgroundColor,
      hair: opts.hair,
      hairColor: opts.hairColor,
      eyes: opts.eyes,
      eyebrows: opts.eyebrows,
      mouth: opts.mouth,
      skinColor: opts.skinColor,
      clothing: opts.clothing,
      clothingColor: opts.clothingColor,
    });

    // Only add accessories if it's not 'none'
    if (opts.accessories !== 'none') {
      params.set('accessories', opts.accessories);
    }
    
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  const updateOption = (key: keyof AvatarOptions, value: string) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
  };

  const randomizeAvatar = () => {
    const newOptions: AvatarOptions = {
      seed: `avatar-${Date.now()}`,
      backgroundColor: backgroundColors[Math.floor(Math.random() * backgroundColors.length)].value,
      hair: hairStyles[Math.floor(Math.random() * hairStyles.length)].value,
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)].value,
      eyes: eyeStyles[Math.floor(Math.random() * eyeStyles.length)].value,
      eyebrows: eyebrowStyles[Math.floor(Math.random() * eyebrowStyles.length)].value,
      mouth: mouthStyles[Math.floor(Math.random() * mouthStyles.length)].value,
      skinColor: skinColors[Math.floor(Math.random() * skinColors.length)].value,
      accessories: Math.random() > 0.5 ? accessories[Math.floor(Math.random() * accessories.length)].value : 'none',
      clothingGraphic: '',
      clothing: clothingStyles[Math.floor(Math.random() * clothingStyles.length)].value,
      clothingColor: clothingColors[Math.floor(Math.random() * clothingColors.length)].value,
    };
    setOptions(newOptions);
  };

  const handleSave = () => {
    const newAvatarUrl = generateAvatarUrl(options);
    onAvatarChange(newAvatarUrl);
    onClose();
  };

  const currentGeneratedUrl = generateAvatarUrl(options);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Customize Your Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="flex justify-center items-center gap-4">
          <Avatar className="w-32 h-32">
            <AvatarImage src={currentGeneratedUrl} alt="Avatar Preview" />
            <AvatarFallback>
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
          <Button onClick={randomizeAvatar} variant="outline">
            Randomize
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Background Color */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Background Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {backgroundColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('backgroundColor', color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    options.backgroundColor === color.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: `#${color.value}` }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <Label htmlFor="hair" className="text-sm font-medium">Hair Style</Label>
            <Select value={options.hair} onValueChange={(value) => updateOption('hair', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hair style" />
              </SelectTrigger>
              <SelectContent>
                {hairStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hair Color */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Hair Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {hairColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('hairColor', color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    options.hairColor === color.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: `#${color.value}` }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Color */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Skin Color</Label>
            <div className="grid grid-cols-2 gap-2">
              {skinColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('skinColor', color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    options.skinColor === color.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: `#${color.value}` }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Eyes */}
          <div>
            <Label htmlFor="eyes" className="text-sm font-medium">Eyes</Label>
            <Select value={options.eyes} onValueChange={(value) => updateOption('eyes', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select eye style" />
              </SelectTrigger>
              <SelectContent>
                {eyeStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Eyebrows */}
          <div>
            <Label htmlFor="eyebrows" className="text-sm font-medium">Eyebrows</Label>
            <Select value={options.eyebrows} onValueChange={(value) => updateOption('eyebrows', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select eyebrow style" />
              </SelectTrigger>
              <SelectContent>
                {eyebrowStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mouth */}
          <div>
            <Label htmlFor="mouth" className="text-sm font-medium">Mouth</Label>
            <Select value={options.mouth} onValueChange={(value) => updateOption('mouth', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select mouth style" />
              </SelectTrigger>
              <SelectContent>
                {mouthStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Accessories */}
          <div>
            <Label htmlFor="accessories" className="text-sm font-medium">Accessories</Label>
            <Select value={options.accessories} onValueChange={(value) => updateOption('accessories', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select accessories" />
              </SelectTrigger>
              <SelectContent>
                {accessories.map((accessory) => (
                  <SelectItem key={accessory.value} value={accessory.value}>
                    {accessory.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clothing */}
          <div>
            <Label htmlFor="clothing" className="text-sm font-medium">Clothing</Label>
            <Select value={options.clothing} onValueChange={(value) => updateOption('clothing', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select clothing" />
              </SelectTrigger>
              <SelectContent>
                {clothingStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
