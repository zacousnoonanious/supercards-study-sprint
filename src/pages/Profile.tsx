
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  language: string;
}

const defaultAvatars = [
  '/placeholder.svg',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=9',
];

const languages = [
  { code: 'en', name: 'lang.en' },
  { code: 'es', name: 'lang.es' },
  { code: 'fr', name: 'lang.fr' },
  { code: 'de', name: 'lang.de' },
  { code: 'it', name: 'lang.it' },
];

const Profile = () => {
  const { user } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  
  const [profile, setProfile] = useState<Profile>({
    id: '',
    first_name: '',
    last_name: '',
    avatar_url: '/placeholder.svg',
    language: 'en',
  });
  
  const [email, setEmail] = useState('');

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
      
      if (data) {
        setProfile(data);
        setLanguage(data.language || 'en');
      } else {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user?.id,
          first_name: '',
          last_name: '',
          avatar_url: '/placeholder.svg',
          language: 'en',
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);
          
        if (insertError) throw insertError;
        setProfile(newProfile);
      }
      
      setEmail(user?.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
          language: profile.language,
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Update email if changed
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      setLanguage(profile.language);
      
      toast({
        title: t('profile.updateSuccess'),
        description: t('profile.updateSuccess'),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: t('profile.updateError'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">SuperCards</h1>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              {t('nav.dashboard')}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('profile.title')}</CardTitle>
            <CardDescription>{t('profile.personalInfo')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile.avatar_url} alt="Profile" />
                <AvatarFallback>
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                >
                  {t('profile.selectAvatar')}
                </Button>
              </div>
            </div>

            {/* Avatar Selector */}
            {showAvatarSelector && (
              <div className="grid grid-cols-5 gap-4 p-4 border rounded-lg bg-gray-50">
                {defaultAvatars.map((avatarUrl, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setProfile({ ...profile, avatar_url: avatarUrl });
                      setShowAvatarSelector(false);
                    }}
                    className={`p-2 rounded-lg border-2 transition-colors ${
                      profile.avatar_url === avatarUrl
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Avatar className="w-12 h-12 mx-auto">
                      <AvatarImage src={avatarUrl} alt={`Avatar ${index + 1}`} />
                      <AvatarFallback>
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            )}

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('profile.firstName')}</Label>
                <Input
                  id="firstName"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder={t('profile.firstName')}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('profile.lastName')}</Label>
                <Input
                  id="lastName"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder={t('profile.lastName')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('profile.email')}
              />
            </div>

            {/* Language Selection */}
            <div>
              <Label htmlFor="language">{t('profile.language')}</Label>
              <Select
                value={profile.language}
                onValueChange={(value) => setProfile({ ...profile, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.language')} />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {t(lang.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={updateProfile} disabled={saving}>
                {saving ? t('loading') : t('save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
