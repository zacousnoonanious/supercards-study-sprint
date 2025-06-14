
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
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to auth page');
          // Clear any local state
          setUser(null);
          setSession(null);
          // Force navigation to auth page
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 100);
        }
        
        // Handle sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
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
  }, [navigate]);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
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
    try {
      // Clear local state immediately to prevent UI issues
      setUser(null);
      setSession(null);
      
      const { error } = await supabase.auth.signOut();
      
      // Don't treat "session_not_found" as an error since the user is already signed out
      if (error && !error.message?.includes('session_not_found')) {
        console.error('Sign out error:', error);
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log('Sign out successful');
        toast({
          title: "See you next time! :)",
          description: "Thanks for using our app!",
        });
      }
      
      // Always navigate to auth page regardless of API response
      navigate('/auth', { replace: true });
      
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Even if there's an error, clear the state and redirect
      setUser(null);
      setSession(null);
      navigate('/auth', { replace: true });
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
