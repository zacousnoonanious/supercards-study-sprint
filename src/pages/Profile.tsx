
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { AvatarSelector } from '@/components/AvatarSelector';
import { ProfileForm } from '@/components/profile/ProfileForm';

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

  const handleProfileChange = (updates: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...updates } : null);
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
      <Navigation />

      <main className="max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">{t('profile.title')}</h2>

        {profile && (
          <ProfileForm
            profile={profile}
            user={user}
            saving={saving}
            onSubmit={handleSubmit}
            onProfileChange={handleProfileChange}
            onShowAvatarSelector={() => setShowAvatarSelector(true)}
          />
        )}

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
