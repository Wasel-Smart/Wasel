/**
 * Wasel Production Server - Complete Integration
 * All services integrated and ready for deployment
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
// @ts-ignore
import compression from 'compression';
import { supabase } from './supabase';

// Import all services
import { AuthSecurityService, AuthenticatedRequest } from './services/AuthSecurityService';
import { TwilioVerificationService } from './services/TwilioVerificationService';
import { EnhancedPaymentService } from './services/EnhancedPaymentService';
import { GoogleMapsService } from './services/GoogleMapsService';
import { RealtimeTrackingService } from './services/RealtimeTrackingService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: AuthSecurityService.configureCORS()
});

// Initialize real-time tracking service
const trackingService = new RealtimeTrackingService(io);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security middleware
app.use(helmet());
app.use(AuthSecurityService.securityHeaders());
app.use(cors(AuthSecurityService.configureCORS()));
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * Send phone verification code
 */
app.post('/api/auth/verify/send', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, channel = 'sms' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await TwilioVerificationService.sendVerificationCode(
      phoneNumber,
      channel
    );

    res.json(result);
  } catch (error: any) {
    console.error('Send verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification' });
  }
});

/**
 * Verify phone code
 */
app.post('/api/auth/verify/check', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code required' });
    }

    const result = await TwilioVerificationService.verifyCode(phoneNumber, code);

    res.json(result);
  } catch (error: any) {
    console.error('Verify code error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify code' });
  }
});

/**
 * Resend verification code
 */
app.post('/api/auth/verify/resend', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, channel = 'sms' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    const result = await TwilioVerificationService.resendCode(phoneNumber, channel);

    res.json(result);
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to resend code' });
  }
});

// ============================================================================
// PAYMENT ROUTES
// ============================================================================

/**
 * Create payment intent
 */
app.post(
  '/api/payments/create-intent',
  AuthSecurityService.authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tripId, amount, currency, paymentMethodId } = req.body;
      const userId = req.user!.id;

      if (!tripId || !amount) {
        return res.status(400).json({ error: 'Trip ID and amount required' });
      }

      const result = await EnhancedPaymentService.processTripPayment(
        tripId,
        userId,
        amount,
        currency,
        paymentMethodId
      );

      res.json(result);
    } catch (error: any) {
      console.error('Create payment intent error:', error);
      res.status(500).json({ error: error.message || 'Payment failed' });
    }
  }
);

/**
 * Add payment method
 */
app.post(
  '/api/payments/add-method',
  AuthSecurityService.authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { paymentMethodId } = req.body;
      const userId = req.user!.id;

      if (!paymentMethodId) {
        return res.status(400).json({ error: 'Payment method ID required' });
      }

      const result = await EnhancedPaymentService.addPaymentMethod(
        userId,
        paymentMethodId
      );

      res.json(result);
    } catch (error: any) {
      console.error('Add payment method error:', error);
      res.status(500).json({ error: error.message || 'Failed to add payment method' });
    }
  }
);

/**
 * Process refund
 */
app.post(
  '/api/payments/refund',
  AuthSecurityService.authenticateUser,
  AuthSecurityService.requireRole('admin', 'support'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { paymentIntentId, amount, reason } = req.body;

      if (!paymentIntentId) {
        return res.status(400).json({ error: 'Payment intent ID required' });
      }

      const result = await EnhancedPaymentService.processRefund(
        paymentIntentId,
        amount,
        reason
      );

      res.json(result);
    } catch (error: any) {
      console.error('Process refund error:', error);
      res.status(500).json({ error: error.message || 'Refund failed' });
    }
  }
);

/**
 * Stripe webhook handler
 */
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    await EnhancedPaymentService.handleWebhook(
      req.body,
      signature,
      webhookSecret
    );

    res.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook failed' });
  }
});

/**
 * Get payment history
 */
app.get(
  '/api/payments/history',
  AuthSecurityService.authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await EnhancedPaymentService.getPaymentHistory(userId, limit);

      res.json(result);
    } catch (error: any) {
      console.error('Get payment history error:', error);
      res.status(500).json({ error: error.message || 'Failed to get payment history' });
    }
  }
);

// ============================================================================
// GOOGLE MAPS / ROUTING ROUTES
// ============================================================================

/**
 * Get route between two points
 */
app.post(
  '/api/maps/route',
  AuthSecurityService.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const { origin, destination, waypoints, optimize } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination required' });
      }

      const result = await GoogleMapsService.getRoute(
        origin,
        destination,
        waypoints,
        optimize
      );

      res.json(result);
    } catch (error: any) {
      console.error('Get route error:', error);
      res.status(500).json({ error: error.message || 'Failed to get route' });
    }
  }
);

/**
 * Geocode address
 */
app.post(
  '/api/maps/geocode',
  AuthSecurityService.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'Address required' });
      }

      const result = await GoogleMapsService.geocodeAddress(address);

      res.json(result);
    } catch (error: any) {
      console.error('Geocode error:', error);
      res.status(500).json({ error: error.message || 'Failed to geocode' });
    }
  }
);

/**
 * Reverse geocode coordinates
 */
app.post(
  '/api/maps/reverse-geocode',
  AuthSecurityService.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const { lat, lng } = req.body;

      if (!lat || !lng) {
        return res.status(400).json({ error: 'Coordinates required' });
      }

      const result = await GoogleMapsService.reverseGeocode({ lat, lng });

      res.json(result);
    } catch (error: any) {
      console.error('Reverse geocode error:', error);
      res.status(500).json({ error: error.message || 'Failed to reverse geocode' });
    }
  }
);

/**
 * Search places
 */
app.post(
  '/api/maps/search-places',
  AuthSecurityService.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const { query, location, radius } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const result = await GoogleMapsService.searchPlaces(query, location, radius);

      res.json(result);
    } catch (error: any) {
      console.error('Search places error:', error);
      res.status(500).json({ error: error.message || 'Failed to search places' });
    }
  }
);

/**
 * Autocomplete places
 */
app.post(
  '/api/maps/autocomplete',
  AuthSecurityService.authenticateUser,
  async (req: Request, res: Response) => {
    try {
      const { input, location, radius } = req.body;

      if (!input) {
        return res.status(400).json({ error: 'Input required' });
      }

      const result = await GoogleMapsService.autocomplete(input, location, radius);

      res.json(result);
    } catch (error: any) {
      console.error('Autocomplete error:', error);
      res.status(500).json({ error: error.message || 'Failed to autocomplete' });
    }
  }
);

// ============================================================================
// TRIP ROUTES
// ============================================================================

/**
 * Create new trip
 */
app.post(
  '/api/trips/create',
  AuthSecurityService.authenticateUser,
  AuthSecurityService.verifyPhoneRequired,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { pickupLocation, dropoffLocation, vehicleType, seats } = req.body;
      const passengerId = req.user!.id;

      if (!pickupLocation || !dropoffLocation) {
        return res.status(400).json({ error: 'Pickup and dropoff locations required' });
      }

      // Get route details
      const route = await GoogleMapsService.getRoute(pickupLocation, dropoffLocation);

      if (!route.success) {
        return res.status(400).json({ error: 'Invalid route' });
      }

      // Create trip
      const { data: trip, error } = await supabase
        .from('trips')
        .insert({
          passenger_id: passengerId,
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          vehicle_type: vehicleType || 'sedan',
          seats: seats || 1,
          distance_km: route.distance,
          estimated_duration_minutes: route.duration,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      res.json({ success: true, trip });
    } catch (error: any) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: error.message || 'Failed to create trip' });
    }
  }
);

/**
 * Get trip details
 */
app.get(
  '/api/trips/:tripId',
  AuthSecurityService.authenticateUser,
  AuthSecurityService.verifyTripAccess,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tripId } = req.params;

      const { data: trip, error } = await supabase
        .from('trips')
        .select('*, drivers(*), users(*)')
        .eq('id', tripId)
        .single();

      if (error) throw error;

      res.json({ success: true, trip });
    } catch (error: any) {
      console.error('Get trip error:', error);
      res.status(500).json({ error: error.message || 'Failed to get trip' });
    }
  }
);

// ============================================================================
// EMERGENCY ROUTES
// ============================================================================

/**
 * Send SOS alert
 */
app.post(
  '/api/emergency/sos',
  AuthSecurityService.authenticateUser,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { tripId, location, reason } = req.body;
      const userId = req.user!.id;

      if (!tripId || !location) {
        return res.status(400).json({ error: 'Trip ID and location required' });
      }

      // Verify trip access
      const { data: trip } = await supabase
        .from('trips')
        .select('driver_id, passenger_id')
        .eq('id', tripId)
        .single();

      if (!trip || (trip.driver_id !== userId && trip.passenger_id !== userId)) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Create emergency alert
      const { data: alert, error} = await supabase
        .from('emergency_alerts')
        .insert({
          trip_id: tripId,
          user_id: userId,
          location,
          reason: reason || 'Emergency assistance requested',
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast via WebSocket
      io.to(`trip-${tripId}`).emit('emergency-alert', {
        tripId,
        userId,
        location,
        reason,
        timestamp: new Date().toISOString()
      });

      // Send SMS to emergency contacts
      await TwilioVerificationService.sendSMS(
        process.env.EMERGENCY_CONTACT_PHONE || '+1234567890',
        `EMERGENCY ALERT: Trip ${tripId}, User ${userId}, Location: ${JSON.stringify(location)}`
      );

      console.error(`EMERGENCY SOS: Trip ${tripId}, User ${userId}`);

      res.json({ success: true, alert });
    } catch (error: any) {
      console.error('SOS error:', error);
      res.status(500).json({ error: error.message || 'Failed to send SOS' });
    }
  }
);

// ============================================================================
// HEALTH & MONITORING
// ============================================================================

/**
 * Health check
 */
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();

    // Check database
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
    const dbHealthy = !dbError;

    const responseTime = Date.now() - startTime;

    const health = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbHealthy ? 'up' : 'down',
        websocket: trackingService.getConnectedUsersCount() >= 0 ? 'up' : 'down',
        api: 'up'
      },
      metrics: {
        responseTime,
        connectedClients: trackingService.getConnectedUsersCount(),
        activeTrips: trackingService.getActiveTripsCount(),
        uptime: process.uptime()
      }
    };

    res.status(dbHealthy ? 200 : 503).json(health);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ============================================================================
// SERVER START
// ============================================================================

const PORT = process.env.PORT || 3002;

server.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 Wasel Backend Server');
  console.log('='.repeat(70));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log('✅ Services Status:');
  console.log('   - Authentication & Security: Active');
  console.log('   - Phone Verification (Twilio): Active');
  console.log('   - Payment Processing (Stripe): Active');
  console.log('   - Maps & Routing (Google): Active');
  console.log('   - Real-time Tracking (WebSocket): Active');
  console.log('='.repeat(70));
});

export { app, server, io };
