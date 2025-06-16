
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Users, Trophy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PrivacySettings {
  show_in_leaderboard: boolean;
  display_name: string;
}

export const ProfilePrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    show_in_leaderboard: true,
    display_name: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPrivacySettings();
    }
  }, [user]);

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('show_in_leaderboard, display_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setSettings({
        show_in_leaderboard: data?.show_in_leaderboard ?? true,
        display_name: data?.display_name || ''
      });
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          show_in_leaderboard: settings.show_in_leaderboard,
          display_name: settings.display_name.trim() || 'Anonymous User'
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Privacy settings updated',
        description: 'Your preferences have been saved successfully'
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof PrivacySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Privacy & Social Settings
        </CardTitle>
        <CardDescription>
          Control how your profile appears to other users and on leaderboards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={settings.display_name}
            onChange={(e) => handleSettingChange('display_name', e.target.value)}
            placeholder="How you appear to other users"
          />
          <p className="text-sm text-muted-foreground">
            This name will be shown on leaderboards and to other users
          </p>
        </div>

        {/* Leaderboard Visibility */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            {settings.show_in_leaderboard ? (
              <Trophy className="h-5 w-5 text-yellow-500 mt-0.5" />
            ) : (
              <EyeOff className="h-5 w-5 text-muted-foreground mt-0.5" />
            )}
            <div>
              <div className="font-medium">Show on Leaderboard</div>
              <div className="text-sm text-muted-foreground">
                Allow other users to see your stats and rankings
              </div>
            </div>
          </div>
          <Switch
            checked={settings.show_in_leaderboard}
            onCheckedChange={(checked) => handleSettingChange('show_in_leaderboard', checked)}
          />
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-blue-900 dark:text-blue-100">
                What information is shared?
              </div>
              <div className="text-blue-700 dark:text-blue-300 mt-1">
                When visible on leaderboards, other users can see your display name, 
                avatar, study streak, total cards reviewed, and study time. Your actual 
                flashcard content and detailed study history remain private.
              </div>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};
