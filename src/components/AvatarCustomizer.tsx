
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Palette, User } from 'lucide-react';

interface AvatarOptions {
  skinColor: string;
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  faceStyle: string;
  noseStyle: string;
  hat: string;
  width: string;
  height: string;
}

interface AvatarCustomizerProps {
  currentAvatarUrl: string;
  onAvatarChange: (newAvatarUrl: string) => void;
  onClose: () => void;
}

const skinColors = [
  { value: 'light', label: 'Light', color: '#fdbcb4' },
  { value: 'medium', label: 'Medium', color: '#edb98a' },
  { value: 'tan', label: 'Tan', color: '#d08b5b' },
  { value: 'dark', label: 'Dark', color: '#ae7242' },
  { value: 'deep', label: 'Deep', color: '#8d5524' },
];

const hairColors = [
  { value: 'blonde', label: 'Blonde', color: '#faf0be' },
  { value: 'brown', label: 'Brown', color: '#8b4513' },
  { value: 'black', label: 'Black', color: '#2c1810' },
  { value: 'red', label: 'Red', color: '#cc4125' },
  { value: 'gray', label: 'Gray', color: '#a0a0a0' },
  { value: 'blue', label: 'Blue', color: '#4a90e2' },
];

const hairStyles = [
  { value: 'short', label: 'Short' },
  { value: 'long', label: 'Long' },
  { value: 'curly', label: 'Curly' },
  { value: 'straight', label: 'Straight' },
  { value: 'wavy', label: 'Wavy' },
  { value: 'bald', label: 'Bald' },
];

const eyeColors = [
  { value: 'brown', label: 'Brown', color: '#8b4513' },
  { value: 'blue', label: 'Blue', color: '#4a90e2' },
  { value: 'green', label: 'Green', color: '#50c878' },
  { value: 'hazel', label: 'Hazel', color: '#8e7618' },
  { value: 'gray', label: 'Gray', color: '#708090' },
];

const faceStyles = [
  { value: 'round', label: 'Round' },
  { value: 'oval', label: 'Oval' },
  { value: 'square', label: 'Square' },
  { value: 'heart', label: 'Heart' },
  { value: 'diamond', label: 'Diamond' },
];

const noseStyles = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'button', label: 'Button' },
  { value: 'straight', label: 'Straight' },
];

const hats = [
  { value: 'none', label: 'None' },
  { value: 'cap', label: 'Baseball Cap' },
  { value: 'beanie', label: 'Beanie' },
  { value: 'fedora', label: 'Fedora' },
  { value: 'cowboy', label: 'Cowboy Hat' },
  { value: 'beret', label: 'Beret' },
];

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  onClose,
}) => {
  const [options, setOptions] = React.useState<AvatarOptions>({
    skinColor: 'light',
    hairColor: 'brown',
    hairStyle: 'short',
    eyeColor: 'brown',
    faceStyle: 'oval',
    noseStyle: 'medium',
    hat: 'none',
    width: 'medium',
    height: 'medium',
  });

  const generateAvatarUrl = (opts: AvatarOptions) => {
    const params = new URLSearchParams({
      seed: `${opts.skinColor}-${opts.hairColor}-${opts.hairStyle}-${opts.eyeColor}-${opts.faceStyle}-${opts.noseStyle}-${opts.hat}-${opts.width}-${opts.height}`,
      skinColor: opts.skinColor,
      hair: `${opts.hairStyle},${opts.hairColor}`,
      eyes: opts.eyeColor,
      face: opts.faceStyle,
      nose: opts.noseStyle,
      accessories: opts.hat !== 'none' ? opts.hat : '',
      size: `${opts.width}x${opts.height}`,
    });
    
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  const updateOption = (key: keyof AvatarOptions, value: string) => {
    const newOptions = { ...options, [key]: value };
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
        <div className="flex justify-center">
          <Avatar className="w-32 h-32">
            <AvatarImage src={currentGeneratedUrl} alt="Avatar Preview" />
            <AvatarFallback>
              <User className="w-16 h-16" />
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skin Color */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Skin Color</Label>
            <div className="grid grid-cols-3 gap-2">
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
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
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
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div>
            <Label htmlFor="hairStyle" className="text-sm font-medium">Hair Style</Label>
            <Select value={options.hairStyle} onValueChange={(value) => updateOption('hairStyle', value)}>
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

          {/* Eye Color */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Eye Color</Label>
            <div className="grid grid-cols-3 gap-2">
              {eyeColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateOption('eyeColor', color.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    options.eyeColor === color.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="text-xs">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Face Style */}
          <div>
            <Label htmlFor="faceStyle" className="text-sm font-medium">Face Shape</Label>
            <Select value={options.faceStyle} onValueChange={(value) => updateOption('faceStyle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select face shape" />
              </SelectTrigger>
              <SelectContent>
                {faceStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nose Style */}
          <div>
            <Label htmlFor="noseStyle" className="text-sm font-medium">Nose Style</Label>
            <Select value={options.noseStyle} onValueChange={(value) => updateOption('noseStyle', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select nose style" />
              </SelectTrigger>
              <SelectContent>
                {noseStyles.map((style) => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Hat */}
          <div>
            <Label htmlFor="hat" className="text-sm font-medium">Hat/Accessory</Label>
            <Select value={options.hat} onValueChange={(value) => updateOption('hat', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select hat" />
              </SelectTrigger>
              <SelectContent>
                {hats.map((hat) => (
                  <SelectItem key={hat.value} value={hat.value}>
                    {hat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Avatar Width */}
          <div>
            <Label htmlFor="width" className="text-sm font-medium">Avatar Width</Label>
            <Select value={options.width} onValueChange={(value) => updateOption('width', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select width" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Avatar Height */}
          <div>
            <Label htmlFor="height" className="text-sm font-medium">Avatar Height</Label>
            <Select value={options.height} onValueChange={(value) => updateOption('height', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select height" />
              </SelectTrigger>
              <SelectContent>
                {sizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.label}
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
