"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.isSupabaseConfigured = void 0;
exports.handleSupabaseError = handleSupabaseError;
exports.isAuthenticated = isAuthenticated;
exports.getCurrentUser = getCurrentUser;
exports.getUserProfile = getUserProfile;
const supabase_js_1 = require("@supabase/supabase-js");
const info_1 = require("./info");
// Build Supabase URL from project ID
const supabaseUrl = `https://${info_1.projectId}.supabase.co`;
const supabaseAnonKey = info_1.publicAnonKey;
// Check if Supabase is configured
exports.isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
// Create Supabase client with TypeScript support (or null if not configured)
const getSupabaseClient = () => {
    // Use a symbol to prevent collisions and ensure singleton across HMR/module reloads
    const CLIENT_KEY = Symbol.for('supabase.client.instance');
    const globalAny = typeof window !== 'undefined' ? window : globalThis;
    if (globalAny[CLIENT_KEY]) {
        return globalAny[CLIENT_KEY];
    }
    // Fallback check for previous string-based key
    if (typeof window !== 'undefined' && window._supabaseClient) {
        return window._supabaseClient;
    }
    const client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
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
        window._supabaseClient = client;
    }
    globalAny[CLIENT_KEY] = client;
    return client;
};
exports.supabase = exports.isSupabaseConfigured ? getSupabaseClient() : null;
// Helper function to handle Supabase errors
function handleSupabaseError(error) {
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
async function isAuthenticated() {
    if (!exports.supabase)
        return false;
    const { data: { session } } = await exports.supabase.auth.getSession();
    return !!session;
}
// Helper to get current user
async function getCurrentUser() {
    if (!exports.supabase)
        return null;
    const { data: { user } } = await exports.supabase.auth.getUser();
    return user;
}
// Helper to get user profile from server
async function getUserProfile(userId) {
    if (!exports.supabase)
        return null;
    const uid = userId || (await getCurrentUser())?.id;
    if (!uid)
        return null;
    try {
        // Get current session for auth token
        const { data: { session } } = await exports.supabase.auth.getSession();
        if (!session)
            return null;
        // Fetch profile from server
        const response = await fetch(`https://${supabaseUrl.split('//')[1]}/functions/v1/make-server-0b1f4071/profile/${uid}`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            console.error('Failed to fetch profile:', response.status);
            return null;
        }
        const { profile } = await response.json();
        return profile;
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
}
//# sourceMappingURL=client.js.map