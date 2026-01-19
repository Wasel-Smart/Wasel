import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../utils/supabase/client';
import { authAPI } from '../services/api';
import { validateInput, rateLimit } from '../middleware/authSecurity';
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

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const profileData = await authAPI.getProfile();
      // Wrap profile data in object if response contains { profile: ... }
      // authAPI.getProfile() returns the raw JSON. Server returns { profile: ... }.
      // Let's check api.ts. It calls response.json().
      // Server returns { profile }.
      setProfile(profileData?.profile || null);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Development mode mock authentication (only in development)
    if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_AUTH === 'true') {
      console.warn('Running in mock authentication mode for development');
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
      console.warn('Supabase not configured. Running in demo mode without backend.');
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event);

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile();
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up
  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Please set up Supabase first.') };
    }

    try {
      // Call server signup (which creates user and KV profile)
      // Assuming first and last name split for api signature
      const [firstName, ...rest] = fullName.split(' ');
      const lastName = rest.join(' ');

      // authAPI.signUp signature: (email, password, firstName, lastName, phone)
      // Wait, server/index.tsx: const { email, password, fullName } = body;
      // services/api.ts: async signUp(email: string, password: string, firstName: string, lastName: string, phone: string)
      // And sends: body: JSON.stringify({ email, password, fullName: `${firstName} ${lastName}` })
      // So I can just pass "" for phone.

      const result = await authAPI.signUp(email, password, firstName, lastName || '', '');

      if (result.success) {
        // Auto login after signup?
        // Server creates user but doesn't return session.
        // We need to sign in manually or ask user to sign in.
        // But wait, the server uses admin.createUser with email_confirm: true.
        // Does that mean we can login immediately? Yes.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInError) return { error: signInError };

        return { error: null };
      }

      return { error: new Error('Signup failed') };

    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('already been registered') ||
        error.message.includes('User already registered')
      )) {
        // Return duplicate user error gracefully without logging as system error
        return { error };
      }

      console.error('Signup error:', error);
      return { error };
    }
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: new Error('Backend not configured. Please set up Supabase first.') };
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
      return { error: new Error('Backend not configured. Please set up Supabase first.') };
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
      return { error: new Error('Backend not configured. Please set up Supabase first.') };
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
      const result = await authAPI.updateProfile(updates);
      if (result.success) {
        await fetchProfile();
        return { error: null };
      }
      return { error: new Error('Failed to update profile') };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (user) {
      await fetchProfile();
    }
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
