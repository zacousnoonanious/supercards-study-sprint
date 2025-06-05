
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Palette, Type } from 'lucide-react';

const allThemes = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'winterland', label: 'Winterland' },
  { value: 'cobalt', label: 'Cobalt' },
  { value: 'darcula', label: 'Darcula' },
  { value: 'console', label: 'Console' },
  { value: 'high-contrast', label: 'High Contrast' },
] as const;

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

interface ThemeToggleProps {
  limitedThemes?: boolean;
  showSizeControls?: boolean;
}

export const ThemeToggle = ({ limitedThemes = false, showSizeControls = true }: ThemeToggleProps) => {
  const { theme, size, setTheme, setSize } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = limitedThemes 
    ? allThemes.filter(t => t.value === 'light' || t.value === 'dark')
    : allThemes;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Theme
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <Label htmlFor="theme-select" className="text-sm font-medium">
              Color Theme
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme-select">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {themes.map((themeOption) => (
                  <SelectItem key={themeOption.value} value={themeOption.value}>
                    {themeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showSizeControls && (
            <div>
              <Label htmlFor="size-select" className="text-sm font-medium flex items-center gap-2">
                <Type className="w-4 h-4" />
                Interface Size
              </Label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger id="size-select">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((sizeOption) => (
                    <SelectItem key={sizeOption.value} value={sizeOption.value}>
                      {sizeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
