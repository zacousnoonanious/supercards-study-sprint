import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, Palette, Type, Plus, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { JoinOrganizationDialog } from './JoinOrganizationDialog';

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
  { value: 'aurora', label: 'Aurora' },
] as const;

const sizes = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
] as const;

export const UserDropdown = () => {
  const { user, signOut } = useAuth();
  const { theme, size, setTheme, setSize } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState('/placeholder.svg');
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);
  const [showJoinOrgDialog, setShowJoinOrgDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserAvatar();
    }
  }, [user]);

  const fetchUserAvatar = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={user?.email || ''} />
              <AvatarFallback className="bg-indigo-100 text-indigo-600">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-popover" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{t('common.account')}</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>{t('nav.profile')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t('common.organization')}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowCreateOrgDialog(true)} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            <span>{t('common.createOrganization')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowJoinOrgDialog(true)} className="cursor-pointer">
            <UserPlus className="mr-2 h-4 w-4" />
            <span>{t('common.joinOrganization')}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <Palette className="mr-2 h-4 w-4" />
              <span>{t('theme.settings')}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-64 bg-popover">
              <div className="p-3 space-y-4">
                <div>
                  <Label htmlFor="theme-select" className="text-sm font-medium mb-2 block">
                    {t('theme.colorTheme')}
                  </Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger id="theme-select" className="w-full">
                      <SelectValue placeholder={t('placeholders.selectOption')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {allThemes.map((themeOption) => (
                        <SelectItem key={themeOption.value} value={themeOption.value}>
                          {themeOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size-select" className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    {t('theme.interfaceSize')}
                  </Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger id="size-select" className="w-full">
                      <SelectValue placeholder={t('placeholders.selectOption')} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {sizes.map((sizeOption) => (
                        <SelectItem key={sizeOption.value} value={sizeOption.value}>
                          {sizeOption.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t('nav.signOut')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateOrganizationDialog 
        open={showCreateOrgDialog} 
        onOpenChange={setShowCreateOrgDialog} 
      />
      <JoinOrganizationDialog 
        open={showJoinOrgDialog} 
        onOpenChange={setShowJoinOrgDialog} 
      />
    </>
  );
};
