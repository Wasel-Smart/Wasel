/**
 * Security Middleware - Production Ready
 */

import { supabase } from '../utils/supabase/client';

// Input validation
export const validateInput = {
  email: (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  phone: (phone: string): boolean => /^\+?[1-9]\d{1,14}$/.test(phone),
  password: (password: string): boolean => password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password),
  sanitize: (input: string): string => input.replace(/[<>\"'&]/g, ''),
};

// Rate limiting
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean => {
  const now = Date.now();
  const limit = rateLimits.get(key);
  
  if (!limit || now > limit.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (limit.count >= maxAttempts) return false;
  
  limit.count++;
  return true;
};

// Session validation
export const validateSession = async (): Promise<{ valid: boolean; user?: any }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return { valid: false };
    
    // Check session expiry
    if (new Date(session.expires_at!) < new Date()) {
      await supabase.auth.signOut();
      return { valid: false };
    }
    
    return { valid: true, user: session.user };
  } catch {
    return { valid: false };
  }
};

// Secure headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};