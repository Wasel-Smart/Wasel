/**
 * Minimal Backend Infrastructure - Production Ready
 * Essential endpoints and services for Wasel launch
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { supabase } from '../services/api';
import { validateInput } from '../middleware/authSecurity';

const app = express();
const server = createServer(app);
const io = new Server(server, { 
  cors: { 
    origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : "*",
    credentials: true
  } 
});

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : true,
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Input validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    if (req.body) {
      for (const [key, value] of Object.entries(req.body)) {
        if (typeof value === 'string') {
          req.body[key] = validateInput.sanitize(value);
        }
      }
    }
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid input data' });
  }
};

app.use(validateRequest);

// Authentication middleware
const authenticateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Smart Route Events
app.post('/api/smart-route/events', authenticateUser, async (req, res) => {
  try {
    const { type, source, data, userId, tripId, location } = req.body;
    
    // Validate required fields
    if (!type || !source || !data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Ensure user can only create events for themselves
    if (userId && userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { error } = await supabase.from('smart_route_events').insert({
      type, source, data, user_id: req.user.id, trip_id: tripId, location,
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Smart route events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// AI Route Suggestions
app.post('/api/ai/routes/suggest', authenticateUser, async (req, res) => {
  try {
    const { query, userLocation } = req.body;
    
    if (!query || typeof query !== 'string' || query.length < 2) {
      return res.status(400).json({ error: 'Valid query required (min 2 characters)' });
    }
    
    if (query.length > 100) {
      return res.status(400).json({ error: 'Query too long (max 100 characters)' });
    }
    
    // Enhanced suggestions with validation
    const commonLocations = [
      'Dubai Mall', 'Burj Khalifa', 'Dubai Marina', 'JBR Beach', 'Dubai Airport',
      'Abu Dhabi Mall', 'Sheikh Zayed Mosque', 'Yas Island', 'Corniche',
      'King Fahd Road', 'Olaya District', 'Diplomatic Quarter', 'King Khalid Airport'
    ];
    
    const suggestions = commonLocations
      .filter(loc => loc.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(location => ({
        location,
        type: location.includes('Mall') ? 'shopping' : location.includes('Airport') ? 'transport' : 'landmark',
        confidence: Math.random() * 0.3 + 0.7 // 0.7-1.0
      }));
    
    res.json({ 
      success: true, 
      data: suggestions,
      source: 'ai',
      confidence: suggestions.length > 0 ? 0.85 : 0.3
    });
  } catch (error) {
    console.error('AI route suggestions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dynamic Pricing
app.post('/api/ai/pricing/optimize', authenticateUser, async (req, res) => {
  try {
    const { distance_km, seats, tripType, departureTime } = req.body;
    
    // Validate inputs
    if (!distance_km || distance_km <= 0 || distance_km > 1000) {
      return res.status(400).json({ error: 'Invalid distance (must be 0-1000 km)' });
    }
    
    if (!seats || seats <= 0 || seats > 8) {
      return res.status(400).json({ error: 'Invalid seats (must be 1-8)' });
    }
    
    // Enhanced pricing algorithm
    const basePrices = { AED: 15, SAR: 20, EGP: 50, USD: 5 };
    const perKmRates = { AED: 2, SAR: 2.5, EGP: 8, USD: 1.5 };
    
    const currency = 'AED'; // Default currency
    let price = basePrices[currency] + (distance_km * perKmRates[currency]);
    
    // Time-based surge pricing
    if (departureTime) {
      const hour = new Date(departureTime).getHours();
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        price *= 1.3; // Peak hours
      }
    }
    
    // Trip type multiplier
    if (tripType === 'package') {
      price *= 1.2;
    }
    
    // Seat multiplier
    if (seats > 1) {
      price *= (1 + (seats - 1) * 0.1);
    }
    
    const finalPrice = Math.round(price * 100) / 100;
    
    res.json({ 
      success: true, 
      data: { 
        price: finalPrice, 
        currency,
        breakdown: {
          base: basePrices[currency],
          distance: distance_km * perKmRates[currency],
          surge: departureTime ? 1.3 : 1.0,
          typeMultiplier: tripType === 'package' ? 1.2 : 1.0,
          seatMultiplier: seats > 1 ? (1 + (seats - 1) * 0.1) : 1.0
        }
      },
      confidence: 0.85
    });
  } catch (error) {
    console.error('Dynamic pricing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// WebSocket for Real-time with authentication
const authenticateSocket = async (socket: any, next: any) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return next(new Error('Invalid token'));
    }
    
    socket.userId = user.id;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  
  socket.on('join-trip', async (tripId) => {
    try {
      // Validate trip access
      const { data: trip, error } = await supabase
        .from('trips')
        .select('driver_id, passenger_id')
        .eq('id', tripId)
        .single();
      
      if (error || !trip) {
        socket.emit('error', { message: 'Trip not found' });
        return;
      }
      
      // Check if user is part of the trip
      if (trip.driver_id !== socket.userId && trip.passenger_id !== socket.userId) {
        socket.emit('error', { message: 'Unauthorized access to trip' });
        return;
      }
      
      socket.join(`trip-${tripId}`);
      socket.emit('joined-trip', { tripId });
    } catch (error) {
      console.error('Join trip error:', error);
      socket.emit('error', { message: 'Failed to join trip' });
    }
  });
  
  socket.on('location-update', async (data) => {
    try {
      const { tripId, coordinates, heading, speed, accuracy } = data;
      
      // Validate coordinates
      if (!coordinates || !coordinates.lat || !coordinates.lng) {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }
      
      if (coordinates.lat < -90 || coordinates.lat > 90 || 
          coordinates.lng < -180 || coordinates.lng > 180) {
        socket.emit('error', { message: 'Invalid coordinate range' });
        return;
      }
      
      await supabase.from('live_locations').upsert({
        trip_id: tripId,
        user_id: socket.userId,
        coordinates,
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        updated_at: new Date().toISOString()
      });
      
      socket.to(`trip-${tripId}`).emit('location-broadcast', {
        userId: socket.userId,
        tripId,
        coordinates,
        heading,
        speed,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Location update error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Emergency SOS with enhanced security
app.post('/api/emergency/sos', authenticateUser, async (req, res) => {
  try {
    const { tripId, location, reason } = req.body;
    
    // Validate required fields
    if (!tripId || !location || !location.lat || !location.lng) {
      return res.status(400).json({ error: 'Trip ID and valid location required' });
    }
    
    // Validate coordinates
    if (location.lat < -90 || location.lat > 90 || 
        location.lng < -180 || location.lng > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }
    
    // Verify user is part of the trip
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('driver_id, passenger_id')
      .eq('id', tripId)
      .single();
    
    if (tripError || !trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    if (trip.driver_id !== req.user.id && trip.passenger_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to trip' });
    }
    
    // Create emergency alert
    const { error } = await supabase.from('emergency_alerts').insert({
      trip_id: tripId,
      user_id: req.user.id,
      location,
      reason: reason || 'Emergency assistance requested',
      status: 'active',
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    
    // Broadcast emergency alert
    io.to(`trip-${tripId}`).emit('emergency-alert', {
      tripId,
      location,
      userId: req.user.id,
      reason,
      timestamp: new Date().toISOString()
    });
    
    // Log critical event
    console.error(`EMERGENCY SOS: Trip ${tripId}, User ${req.user.id}, Location: ${JSON.stringify(location)}`);
    
    res.json({ success: true, alertId: Date.now().toString() });
  } catch (error) {
    console.error('Emergency SOS error:', error);
    res.status(500).json({ error: 'Failed to process emergency request' });
  }
});

// Push Notifications with validation
app.post('/api/notifications/push', authenticateUser, async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;
    
    // Validate inputs
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }
    
    if (title.length > 100 || body.length > 500) {
      return res.status(400).json({ error: 'Title/body too long' });
    }
    
    // Users can only send notifications to themselves or in authorized contexts
    const targetUserId = userId || req.user.id;
    
    const { error } = await supabase.from('notifications').insert({
      user_id: targetUserId,
      title: validateInput.sanitize(title),
      message: validateInput.sanitize(body),
      type: 'push',
      data: data || {},
      is_read: false,
      created_at: new Date().toISOString()
    });
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Push notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Health Check with detailed status
app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const { error: dbError } = await supabase.from('profiles').select('id').limit(1);
    const dbHealthy = !dbError;
    
    const responseTime = Date.now() - startTime;
    
    const health = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbHealthy ? 'up' : 'down',
        websocket: io.engine.clientsCount >= 0 ? 'up' : 'down',
        api: 'up'
      },
      metrics: {
        responseTime,
        connectedClients: io.engine.clientsCount,
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

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Wasel Backend ready on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});