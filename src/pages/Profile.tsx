
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { UserDropdown } from '@/components/UserDropdown';
import { Navigation } from '@/components/Navigation';
import { AvatarSelector } from '@/components/AvatarSelector';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  language: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setProfile(data || {
        id: user?.id || '',
        first_name: '',
        last_name: '',
        avatar_url: null,
        language: 'en'
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: t('error.general'),
        description: t('profile.updateError'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: profile.first_name?.trim() || null,
          last_name: profile.last_name?.trim() || null,
          avatar_url: profile.avatar_url,
          language: profile.language,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: t('success.updated'),
        description: t('profile.updateSuccess')
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error.general'),
        description: t('profile.updateError'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    setShowAvatarSelector(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-foreground">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="shadow-sm border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
              <Navigation />
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t('profile.title')}</h2>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <CardDescription>
              Update your personal information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {profile && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url || '/placeholder.svg'} alt="Profile" />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAvatarSelector(true)}
                  >
                    {t('profile.changeAvatar')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={profile.first_name || ''}
                      onChange={(e) => setProfile({...profile, first_name: e.target.value})}
                      placeholder="Enter your first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={profile.last_name || ''}
                      onChange={(e) => setProfile({...profile, last_name: e.target.value})}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-sm text-muted-foreground">
                    Email address cannot be changed here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">{t('profile.language')}</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) => setProfile({...profile, language: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t('lang.en')}</SelectItem>
                      <SelectItem value="es">{t('lang.es')}</SelectItem>
                      <SelectItem value="fr">{t('lang.fr')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? t('loading') : t('save')}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {showAvatarSelector && (
          <AvatarSelector
            onSelectAvatar={handleAvatarSelect}
            onClose={() => setShowAvatarSelector(false)}
          />
        )}
      </main>
    </div>
  );
};

export default Profile;
