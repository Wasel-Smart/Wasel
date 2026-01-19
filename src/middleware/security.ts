/**
 * Security Middleware
 * Handles rate limiting, input validation, CSRF protection, and security headers
 */

import { errorTracking } from '@/services/errorTracking';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface ValidationRule {
  type: 'email' | 'phone' | 'text' | 'number' | 'url' | 'creditCard';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: string;
}

/**
 * Rate Limiter
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(maxRequests = 100, windowMs = 900000) {
    // 100 requests per 15 minutes (900000ms) by default
    this.config = { maxRequests, windowMs };
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create attempt list for this identifier
    let attempts = this.attempts.get(identifier) || [];

    // Filter out old attempts outside the window
    attempts = attempts.filter((time) => time > windowStart);

    // Check if limit exceeded
    if (attempts.length >= this.config.maxRequests) {
      console.warn(`[RateLimit] Limit exceeded for ${identifier}`);
      errorTracking.captureMessage(
        `Rate limit exceeded for ${identifier}`,
        'warning',
        { identifier, attempts: attempts.length }
      );
      return false;
    }

    // Add current attempt
    attempts.push(now);
    this.attempts.set(identifier, attempts);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(identifier: string): number {
    const attempts = this.attempts.get(identifier) || [];
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    const validAttempts = attempts.filter((time) => time > windowStart).length;

    return Math.max(0, this.config.maxRequests - validAttempts);
  }

  /**
   * Reset counter for identifier
   */
  reset(identifier: string) {
    this.attempts.delete(identifier);
  }

  /**
   * Clear all counters
   */
  clear() {
    this.attempts.clear();
  }
}

/**
 * Input Validator
 */
class InputValidator {
  /**
   * Validate email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.length >= 7;
  }

  /**
   * Validate credit card
   */
  static isValidCreditCard(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\s/g, '');
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validate URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sanitize text input
   */
  static sanitizeText(input: string, maxLength = 500): string {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[<>]/g, ''); // Remove potential HTML tags
  }

  /**
   * Validate input against rules
   */
  static validate(input: string, rules: ValidationRule): { valid: boolean; error?: string } {
    // Check required
    if (rules.required && !input) {
      return { valid: false, error: rules.message || 'This field is required' };
    }

    // Check min length
    if (rules.minLength && input.length < rules.minLength) {
      return {
        valid: false,
        error: rules.message || `Minimum length is ${rules.minLength} characters`,
      };
    }

    // Check max length
    if (rules.maxLength && input.length > rules.maxLength) {
      return {
        valid: false,
        error: rules.message || `Maximum length is ${rules.maxLength} characters`,
      };
    }

    // Check pattern
    if (rules.pattern && !rules.pattern.test(input)) {
      return { valid: false, error: rules.message || 'Invalid format' };
    }

    // Check type-specific validation
    switch (rules.type) {
      case 'email':
        if (!this.isValidEmail(input)) {
          return { valid: false, error: rules.message || 'Invalid email address' };
        }
        break;

      case 'phone':
        if (!this.isValidPhone(input)) {
          return { valid: false, error: rules.message || 'Invalid phone number' };
        }
        break;

      case 'url':
        if (!this.isValidUrl(input)) {
          return { valid: false, error: rules.message || 'Invalid URL' };
        }
        break;

      case 'creditCard':
        if (!this.isValidCreditCard(input)) {
          return { valid: false, error: rules.message || 'Invalid credit card number' };
        }
        break;

      case 'number':
        if (isNaN(Number(input))) {
          return { valid: false, error: rules.message || 'Invalid number' };
        }
        break;
    }

    return { valid: true };
  }
}

/**
 * CSRF Protection
 */
class CSRFProtection {
  private tokens: Map<string, string> = new Map();

  /**
   * Generate CSRF token
   */
  generateToken(): string {
    const token = Math.random().toString(36).substring(2, 15) +
                 Math.random().toString(36).substring(2, 15);
    const sessionId = this.getSessionId();
    this.tokens.set(sessionId, token);
    return token;
  }

  /**
   * Verify CSRF token
   */
  verifyToken(token: string): boolean {
    const sessionId = this.getSessionId();
    const storedToken = this.tokens.get(sessionId);

    if (!storedToken || storedToken !== token) {
      console.warn('[CSRF] Token verification failed');
      return false;
    }

    // Remove token after verification (one-time use)
    this.tokens.delete(sessionId);
    return true;
  }

  /**
   * Get session ID (use a consistent identifier)
   */
  private getSessionId(): string {
    // In production, use actual session ID from authentication
    return sessionStorage.getItem('sessionId') || 'unknown';
  }
}

/**
 * Security Headers Manager
 */
class SecurityHeaders {
  /**
   * Get security headers for HTTP response
   */
  static getHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    };
  }

  /**
   * Apply security headers to fetch requests
   */
  static addToRequest(headers: Record<string, string>): Record<string, string> {
    return {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }
}

// Export singletons
export const rateLimiter = new RateLimiter();
export const csrfProtection = new CSRFProtection();

// Export classes
export { InputValidator, SecurityHeaders };
export type { RateLimitConfig, ValidationRule };
