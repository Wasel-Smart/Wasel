// Environment-based configuration
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'srmiwuaujdzhyoozhakp';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybWl3dWF1amR6aHlvb3poYWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTEwNDAsImV4cCI6MjA3OTIyNzA0MH0.5Pi7u5ToUmXKLhVEfwyWj5rMmQVtPh6PX3MDici8JIc';

// Validate configuration
if (!projectId || !publicAnonKey) {
  console.error('Missing Supabase configuration. Please set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY environment variables.');
}