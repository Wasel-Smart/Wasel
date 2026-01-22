/**
 * Authentication & Security Service
 * Handles JWT validation, RBAC, rate limiting, and security hardening
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import crypto from 'crypto';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export class AuthSecurityService {

  /* =========================
     AUTHENTICATION
  ========================== */

  static async authenticateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

      if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        res.status(500).json({ error: 'Failed to load user profile' });
        return;
      }

      req.user = {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role ?? 'passenger'
      };

      next();
    } catch (err) {
      console.error('Authentication error:', err);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  /* =========================
     ROLE & ADMIN
  ========================== */

  static requireRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role ?? '')) {
        res.status(403).json({
          error: 'Insufficient permissions',
          required: roles,
          current: req.user.role
        });
        return;
      }

      next();
    };
  }

  static async verifyAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', req.user.id)
      .single();

    if (error || (!data?.is_admin && data?.role !== 'admin')) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  }

  /* =========================
     RATE LIMITING
  ========================== */

  static rateLimiter(max = 100, windowMs = 60_000) {
    const requests = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction) => {
      const ip =
        (Array.isArray(req.headers['x-forwarded-for'])
          ? req.headers['x-forwarded-for'][0]
          : req.headers['x-forwarded-for']) ||
        req.ip ||
        'unknown';

      const now = Date.now();
      const timestamps = requests.get(ip) ?? [];
      const recent = timestamps.filter(t => now - t < windowMs);

      if (recent.length >= max) {
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((recent[0] + windowMs - now) / 1000)
        });
        return;
      }

      recent.push(now);
      recent.length ? requests.set(ip, recent) : requests.delete(ip);

      next();
    };
  }

  /* =========================
     VALIDATION & SANITIZATION
  ========================== */

  static sanitizeInput(value: string): string {
    return value
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  }

  static validateRequest(schema?: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        if (req.body && typeof req.body === 'object') {
          for (const key of Object.keys(req.body)) {
            if (typeof req.body[key] === 'string') {
              req.body[key] = AuthSecurityService.sanitizeInput(req.body[key]);
            }
          }
        }

        if (schema) {
          const { error } = schema.validate(req.body);
          if (error) {
            res.status(400).json({
              error: 'Validation failed',
              details: error.details.map((d: any) => d.message)
            });
            return;
          }
        }

        next();
      } catch {
        res.status(400).json({ error: 'Invalid input data' });
      }
    };
  }

  /* =========================
     API KEYS
  ========================== */

  static async generateAPIKey(userId: string): Promise<string> {
    const apiKey = `wsl_${crypto.randomBytes(32).toString('hex')}`;

    await supabase.from('api_keys').insert({
      user_id: userId,
      key: apiKey,
      is_active: true,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    return apiKey;
  }

  static async validateAPIKey(apiKey: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, expires_at, is_active')
      .eq('key', apiKey)
      .single();

    if (
      error ||
      !data ||
      !data.is_active ||
      new Date(data.expires_at) < new Date()
    ) {
      return null;
    }

    return data.user_id;
  }

  /* =========================
     SECURITY HEADERS
  ========================== */

  static securityHeaders() {
    return (_: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
      res.removeHeader('X-Powered-By');
      next();
    };
  }
}

export { AuthenticatedRequest };
