// Environment-based configuration - NEVER use hardcoded values in production
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate configuration - but don't throw, just warn
if (!projectId || !publicAnonKey) {
  console.warn('⚠️ WARNING: Supabase not fully configured. App will run in demo mode.');
  console.warn('Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY environment variables for full functionality.');
}

// Security validation
if (projectId && (projectId.includes('localhost') || publicAnonKey.length < 100)) {
  console.warn('WARNING: Using development credentials. Ensure production keys are set.');
}
