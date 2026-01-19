// Environment-based configuration - NEVER use hardcoded values in production
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!projectId || !publicAnonKey) {
  throw new Error('CRITICAL: Missing Supabase configuration. Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Security validation
if (projectId.includes('localhost') || publicAnonKey.length < 100) {
  console.warn('WARNING: Using development credentials. Ensure production keys are set.');
}