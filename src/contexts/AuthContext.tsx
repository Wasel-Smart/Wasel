import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../utils/supabase/client';
import type { Database } from '../utils/supabase/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isBackendConnected: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithFacebook: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isBackendConnected: false,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signInWithFacebook: async () => ({ error: null }),
  signOut: async () => { },
  updateProfile: async () => ({ error: null }),
  refreshProfile: async () => { },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Development mode mock authentication
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      console.warn('✅ Running in mock authentication mode for development');
      setTimeout(() => {
        setUser({
          id: 'mock-user-id',
          email: 'mock@example.com',
          app_metadata: {},
          user_metadata: { full_name: 'Mock User' },
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as any);

        setProfile({
          id: 'mock-user-id',
          full_name: 'Laith Nassar',
          email: 'mock@example.com',
          role: 'driver',
          verified: true,
          created_at: new Date().toISOString()
        } as any);

        setLoading(false);
      }, 500);
      return;
    }

    // Production authentication with Supabase
    if (!isSupabaseConfigured || !supabase) {
      console.warn('⚠️ Supabase not configured. Running in demo mode without backend.');
      setLoading(false);
      return;
    }

    // Get initial session - with error handling
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.warn('Could not initialize auth session:', error);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes - with error handling
    let unsubscribe: (() => void) | null = null;

    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth state changed:', event);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );
      unsubscribe = () => subscription.unsubscribe();
    } catch (error) {
      console.warn('Could not setup auth listener:', error);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Demo mode active.') };
    }

    try {
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');

      // In demo mode, just sign in with password
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) return { error: signUpError };
      return { error: null };
    } catch (error) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Demo mode active.') };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Demo mode active.') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) return { error };
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error };
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Demo mode active.') };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) return { error };
      return { error: null };
    } catch (error) {
      console.error('Facebook sign in error:', error);
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    if (!supabase) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    if (!supabase) return { error: new Error('Backend not configured') };

    try {
      setProfile({ ...profile, ...updates } as Profile);
      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    // In demo mode, just return
    if (!supabase) return;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isBackendConnected: isSupabaseConfigured,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
