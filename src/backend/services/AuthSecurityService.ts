/**
 * Authentication & Security Service
 * Handles JWT validation, role-based access control, and security
 */

import { Request, Response, NextFunction } from 'express';
import { supabase } from '../supabase';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  body: any;
}

interface JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

export class AuthSecurityService {
  /**
   * Authenticate user via JWT token
   */
  static async authenticateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        res.status(401).json({ error: 'Authentication token required' });
        return;
      }

      // Verify token with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      // Get user role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || 'passenger'
      };

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Authentication failed' });
    }
  }

  /**
   * Require specific role
   */
  static requireRole(...roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(req.user.role || '')) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          required: roles,
          current: req.user.role
        });
      }

      next();
    };
  }

  /**
   * Verify admin access
   */
  static async verifyAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_admin')
      .eq('id', req.user.id)
      .single();

    if (!profile?.is_admin && profile?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  }

  /**
   * Rate limiting middleware
   */
  static rateLimiter(
    maxRequests: number = 100,
    windowMs: number = 60000
  ) {
    const requests = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const now = Date.now();
      
      // Get request timestamps for this identifier
      const timestamps = requests.get(identifier) || [];
      
      // Filter out old requests outside the window
      const recentRequests = timestamps.filter(time => now - time < windowMs);
      
      // Check if limit exceeded
      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
        });
      }
      
      // Add current request
      recentRequests.push(now);
      requests.set(identifier, recentRequests);
      
      next();
    };
  }

  /**
   * Input sanitization
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  /**
   * Validate request body
   */
  static validateRequest(schema: any) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        // Sanitize string inputs
        if (req.body && typeof req.body === 'object') {
          for (const [key, value] of Object.entries(req.body)) {
            if (typeof value === 'string') {
              req.body[key] = this.sanitizeInput(value);
            }
          }
        }

        // Validate against schema if provided
        if (schema) {
          const { error } = schema.validate(req.body);
          if (error) {
            return res.status(400).json({
              error: 'Validation failed',
              details: error.details.map((d: any) => d.message)
            });
          }
        }

        next();
      } catch (error) {
        res.status(400).json({ error: 'Invalid input data' });
      }
    };
  }

  /**
   * Verify trip access
   */
  static async verifyTripAccess(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tripId = req.params.tripId || req.body.tripId;
      const userId = req.user?.id;

      if (!tripId || !userId) {
        res.status(400).json({ error: 'Trip ID and user ID required' });
        return;
      }

      // Check if user is driver or passenger
      const { data: trip, error } = await supabase
        .from('trips')
        .select('driver_id, passenger_id')
        .eq('id', tripId)
        .single();

      if (error || !trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      if (trip.driver_id !== userId && trip.passenger_id !== userId) {
        res.status(403).json({ error: 'Access denied to this trip' });
        return;
      }

      next();
    } catch (error) {
      console.error('Verify trip access error:', error);
      res.status(500).json({ error: 'Failed to verify trip access' });
    }
  }

  /**
   * Verify driver status
   */
  static async verifyDriverStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { data: driver, error } = await supabase
        .from('drivers')
        .select('id, status, is_verified, documents_verified')
        .eq('user_id', userId)
        .single();

      if (error || !driver) {
        res.status(403).json({ error: 'Driver profile not found' });
        return;
      }

      if (!driver.is_verified || !driver.documents_verified) {
        res.status(403).json({
          error: 'Driver not verified',
          details: 'Please complete verification process'
        });
        return;
      }

      if (driver.status === 'suspended' || driver.status === 'banned') {
        res.status(403).json({
          error: 'Driver account suspended',
          status: driver.status
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Verify driver status error:', error);
      res.status(500).json({ error: 'Failed to verify driver status' });
    }
  }

  /**
   * Verify phone number
   */
  static async verifyPhoneRequired(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('phone_verified')
        .eq('id', userId)
        .single();

      if (!user?.phone_verified) {
        res.status(403).json({
          error: 'Phone verification required',
          message: 'Please verify your phone number to continue'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Verify phone required error:', error);
      res.status(500).json({ error: 'Failed to verify phone' });
    }
  }

  /**
   * CORS configuration
   */
  static configureCORS() {
    return {
      origin: (origin: string | undefined, callback: Function) => {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://wasel.app'
        ];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };
  }

  /**
   * Security headers middleware
   */
  static securityHeaders() {
    return (req: Request, res: Response, next: NextFunction) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.removeHeader('X-Powered-By');
      next();
    };
  }

  /**
   * Generate API key for third-party integrations
   */
  static async generateAPIKey(userId: string): Promise<string> {
    const apiKey = `wsl_${Buffer.from(`${userId}_${Date.now()}`).toString('base64')}`;
    
    await supabase.from('api_keys').insert({
      user_id: userId,
      key: apiKey,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    });

    return apiKey;
  }

  /**
   * Validate API key
   */
  static async validateAPIKey(apiKey: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('user_id, expires_at, is_active')
        .eq('key', apiKey)
        .single();

      if (error || !data || !data.is_active) {
        return null;
      }

      if (new Date(data.expires_at) < new Date()) {
        return null;
      }

      return data.user_id;
    } catch (error) {
      console.error('Validate API key error:', error);
      return null;
    }
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(
    userId: string,
    eventType: string,
    details: any
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        user_id: userId,
        event_type: eventType,
        details,
        ip_address: details.ip,
        user_agent: details.userAgent,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Log security event error:', error);
    }
  }
}

export { AuthenticatedRequest };
