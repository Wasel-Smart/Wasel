import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { projectId, publicAnonKey } from './info.tsx';

// Build Supabase URL from project ID
const supabaseUrl = projectId ? `https://${projectId}.supabase.co` : '';
const supabaseAnonKey = publicAnonKey;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.length > 10);

// Create Supabase client with error handling
const getSupabaseClient = () => {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - running in demo mode');
    return null;
  }

  try {
    const CLIENT_KEY = Symbol.for('supabase.client.instance');
    const globalAny = typeof window !== 'undefined' ? window : globalThis;

    if ((globalAny as any)[CLIENT_KEY]) {
      return (globalAny as any)[CLIENT_KEY];
    }

    if (typeof window !== 'undefined' && (window as any)._supabaseClient) {
      return (window as any)._supabaseClient;
    }

    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'wassel-auth-token',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    if (typeof window !== 'undefined') {
      (window as any)._supabaseClient = client;
    }
    
    (globalAny as any)[CLIENT_KEY] = client;

    return client;
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    return null;
  }
};

export const supabase = getSupabaseClient();

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    // Translate common Supabase errors to user-friendly messages
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.warn('Could not check authentication:', error);
    return false;
  }
}

// Helper to get current user
export async function getCurrentUser() {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.warn('Could not get current user:', error);
    return null;
  }
}

// Helper to get user profile from server
export async function getUserProfile(userId?: string) {
  if (!supabase) return null;
  try {
    const uid = userId || (await getCurrentUser())?.id;
    if (!uid) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/make-server-0b1f4071/profile/${uid}`,
      {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch profile:', response.status);
      return null;
    }

    const { profile } = await response.json();
    return profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}
