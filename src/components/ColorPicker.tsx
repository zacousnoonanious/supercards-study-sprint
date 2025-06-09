
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

const presetColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#800000', '#008000',
  '#000080', '#808000', '#800080', '#008080', '#c0c0c0',
  '#808080', '#9999ff', '#993366', '#ffffcc', '#ccffff',
  '#660066', '#ff8080', '#0066cc', '#ccccff', '#000080',
  '#ff00ff', '#ffff00', '#00ffff', '#800080', '#800000',
  '#008080', '#0000ff', '#00ccff', '#ccffcc', '#ffccff',
  '#ff6600', '#ffcc00', '#ff9999', '#cc6600', '#ffcc99'
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  className = ""
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-8 h-8 p-0 border-2 ${className}`}
          style={{ backgroundColor: color }}
          title="Choose color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 p-0 border-0"
            />
            <Input
              type="text"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 text-xs"
              placeholder="#000000"
            />
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                className={`w-6 h-6 rounded border-2 ${
                  color === presetColor ? 'border-black' : 'border-gray-300'
                } hover:border-gray-500`}
                style={{ backgroundColor: presetColor }}
                onClick={() => onChange(presetColor)}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
