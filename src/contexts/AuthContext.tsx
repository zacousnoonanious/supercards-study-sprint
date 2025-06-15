import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateUserMetadata: (metadata: object) => Promise<{ user: User | null; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/auth?verified=true&email=${encodeURIComponent(email)}`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    console.log('Sign out initiated');
    
    const { error } = await supabase.auth.signOut();

    // Force client-side state update and navigation.
    // This ensures the user is marked as logged out on the client immediately.
    setUser(null);
    setSession(null);
    navigate('/auth', { replace: true });
    
    if (error && !error.message.toLowerCase().includes('session')) {
      console.error('Sign out error:', error);
      toast({ title: "Error signing out", description: error.message, variant: "destructive" });
    } else if (!error) {
      console.log('Sign out successful');
      toast({ title: "See you next time! :)", description: "Thanks for using our app!" });
    }
  };

  const updateUserMetadata = async (metadata: object) => {
    const { data, error } = await supabase.auth.updateUser({ data: metadata });

    if (error) {
      console.error('Error updating user metadata:', error);
      toast({
        title: "Error",
        description: "Could not update your profile settings.",
        variant: "destructive",
      });
    } else if (data.user) {
      // Update local user state so UI can react immediately
      setUser(data.user);
    }
    return { user: data.user, error };
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
    updateUserMetadata,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
