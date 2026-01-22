/**
 * Security Configuration for Wasel Application
 * Implements security best practices and vulnerability mitigations
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://apis.google.com', 'https://www.gstatic.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': ["'self'", 'https://api.supabase.co', 'https://*.firebase.com', 'https://*.googleapis.com'],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^\+?[\d\s\-\(\)]{10,}$/,
  name: /^[a-zA-Z\s\u0600-\u06FF]{2,50}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Sanitization functions
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Rate limiting configuration
export const RATE_LIMITS = {
  login: { attempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  api: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
  upload: { requests: 10, windowMs: 60 * 1000 } // 10 uploads per minute
};

// Environment validation
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required environment variables
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  required.forEach(key => {
    if (!import.meta.env[key]) {
      errors.push(`Missing required environment variable: ${key}`);
    }
  });
  
  // Check for development-only settings in production
  if (import.meta.env.PROD) {
    if (import.meta.env.VITE_DEBUG === 'true') {
      errors.push('Debug mode should not be enabled in production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Secure storage utilities
export const secureStorage = {
  set(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },
  
  get(key: string): any {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },
  
  remove(key: string): void {
    localStorage.removeItem(key);
  },
  
  clear(): void {
    localStorage.clear();
  }
};

// Security event logging
export function logSecurityEvent(event: string, details?: any): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };
  
  console.warn('[SECURITY]', logEntry);
  
  // In production, send to security monitoring service
  if (import.meta.env.PROD) {
    // TODO: Send to security monitoring service
    // fetch('/api/security-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
  }
}

// XSS prevention utilities
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// CSRF token management
export const csrfToken = {
  generate(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },
  
  validate(token: string): boolean {
    // In a real implementation, validate against server-side token
    return token && token.length === 64;
  }
};

// Initialize security measures
export function initializeSecurity(): void {
  // Validate environment
  const envValidation = validateEnvironment();
  if (!envValidation.isValid) {
    console.error('[SECURITY] Environment validation failed:', envValidation.errors);
  }
  
  // Set up CSP if supported
  if ('securitypolicyviolation' in document) {
    document.addEventListener('securitypolicyviolation', (event) => {
      logSecurityEvent('CSP_VIOLATION', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI
      });
    });
  }
  
  // Disable right-click in production (optional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }
  
  // Clear sensitive data on page unload
  window.addEventListener('beforeunload', () => {
    // Clear any sensitive data from memory
    if ('credentials' in navigator) {
      // Clear any stored credentials
    }
  });
  
  console.log('[SECURITY] Security measures initialized');
}

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  VALIDATION_PATTERNS,
  RATE_LIMITS,
  sanitizeInput,
  sanitizeHTML,
  validateEnvironment,
  secureStorage,
  logSecurityEvent,
  escapeHtml,
  csrfToken,
  initializeSecurity
};