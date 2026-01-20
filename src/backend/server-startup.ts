/**
 * Wasel Backend - Simplified Startup Server
 * This version starts with basic features and loads others progressively
 */

import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { supabase } from './supabase';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// BASIC ROUTES
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
        websocket: 'up',
        api: 'up'
      },
      metrics: {
        responseTime,
        uptime: process.uptime()
      },
      environment: process.env.NODE_ENV || 'development'
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

/**
 * Root endpoint
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Wasel Backend API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      docs: '/api/docs'
    }
  });
});

/**
 * API Documentation
 */
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    name: 'Wasel API Documentation',
    version: '1.0.0',
    baseUrl: `http://localhost:${process.env.PORT || 3002}/api`,
    endpoints: [
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      {
        method: 'POST',
        path: '/auth/verify/send',
        description: 'Send phone verification code',
        body: {
          phoneNumber: 'string',
          channel: 'sms|call'
        }
      },
      {
        method: 'POST',
        path: '/auth/verify/check',
        description: 'Verify phone code',
        body: {
          phoneNumber: 'string',
          code: 'string'
        }
      }
    ]
  });
});

// ============================================================================
// LAZY LOAD SERVICES
// ============================================================================

let servicesLoaded = false;

async function loadServices() {
  if (servicesLoaded) return;

  try {
    console.log('📦 Loading services...');

    // Import services dynamically
    const { TwilioVerificationService } = await import('./services/TwilioVerificationService');
    const { EnhancedPaymentService } = await import('./services/EnhancedPaymentService');
    const { GoogleMapsService } = await import('./services/GoogleMapsService');
    const { AuthSecurityService } = await import('./services/AuthSecurityService');

    // Authentication routes
    app.post('/api/auth/verify/send', async (req: Request, res: Response) => {
      try {
        const { phoneNumber, channel = 'sms' } = req.body;
        if (!phoneNumber) {
          return res.status(400).json({ error: 'Phone number required' });
        }
        const result = await TwilioVerificationService.sendVerificationCode(phoneNumber, channel as any);
        res.json(result);
      } catch (error: any) {
        console.error('Send verification error:', error);
        res.status(500).json({ error: error.message || 'Failed to send verification' });
      }
    });

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

    // Maps routes
    app.post('/api/maps/route', AuthSecurityService.authenticateUser, async (req: Request, res: Response) => {
      try {
        const { origin, destination, waypoints, optimize } = req.body;
        if (!origin || !destination) {
          return res.status(400).json({ error: 'Origin and destination required' });
        }
        const result = await GoogleMapsService.getRoute(origin, destination, waypoints, optimize);
        res.json(result);
      } catch (error: any) {
        console.error('Get route error:', error);
        res.status(500).json({ error: error.message || 'Failed to get route' });
      }
    });

    app.post('/api/maps/geocode', AuthSecurityService.authenticateUser, async (req: Request, res: Response) => {
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
    });

    servicesLoaded = true;
    console.log('✅ Services loaded successfully');
  } catch (error) {
    console.error('❌ Error loading services:', error);
    console.log('⚠️  Server running in basic mode only');
  }
}

// Load services after server starts
setTimeout(loadServices, 1000);

// ============================================================================
// WEBSOCKET
// ============================================================================

io.on('connection', (socket) => {
  console.log(`✓ Socket connected: ${socket.id}`);

  socket.on('join-trip', (data) => {
    const { tripId } = data;
    socket.join(`trip-${tripId}`);
    console.log(`Socket ${socket.id} joined trip ${tripId}`);
  });

  socket.on('location-update', (data) => {
    const { tripId } = data;
    socket.to(`trip-${tripId}`).emit('location-update', data);
  });

  socket.on('disconnect', () => {
    console.log(`✓ Socket disconnected: ${socket.id}`);
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: ['GET /', 'GET /api/health', 'GET /api/docs']
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
  console.log('🚀 Wasel Backend Server - STARTED');
  console.log('='.repeat(70));
  console.log(`📡 Server:      http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started:     ${new Date().toISOString()}`);
  console.log('='.repeat(70));
  console.log('✅ Core Services:');
  console.log('   - Express API Server');
  console.log('   - WebSocket (Socket.IO)');
  console.log('   - Supabase Connection');
  console.log('='.repeat(70));
  console.log('📝 Available Endpoints:');
  console.log(`   - GET  http://localhost:${PORT}/`);
  console.log(`   - GET  http://localhost:${PORT}/api/health`);
  console.log(`   - GET  http://localhost:${PORT}/api/docs`);
  console.log('='.repeat(70));
  console.log('⏳ Loading additional services...');
  console.log('='.repeat(70));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export { app, server, io };
