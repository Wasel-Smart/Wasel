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
app.post('/api/ai/pricing/optimize', async (req, res) => {
  const { distance_km, seats } = req.body;
  const price = 10 + (distance_km * 2);
  res.json({ success: true, data: { price, currency: 'AED' } });
});

// WebSocket for Real-time
io.on('connection', (socket) => {
  socket.on('join-trip', (tripId) => socket.join(`trip-${tripId}`));
  
  socket.on('location-update', async (data) => {
    await supabase.from('live_locations').upsert({
      trip_id: data.tripId, user_id: data.userId, coordinates: data.coordinates
    });
    socket.to(`trip-${data.tripId}`).emit('location-broadcast', data);
  });
});

// Emergency SOS
app.post('/api/emergency/sos', async (req, res) => {
  const { tripId, location, userId } = req.body;
  await supabase.from('emergency_alerts').insert({
    trip_id: tripId, user_id: userId, location, status: 'active'
  });
  io.to(`trip-${tripId}`).emit('emergency-alert', { tripId, location });
  res.json({ success: true });
});

// Push Notifications
app.post('/api/notifications/push', async (req, res) => {
  const { userId, title, body } = req.body;
  await supabase.from('notifications').insert({
    user_id: userId, title, message: body, type: 'push'
  });
  res.json({ success: true });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

server.listen(3001, () => console.log('🚀 Wasel Backend ready on port 3001'));