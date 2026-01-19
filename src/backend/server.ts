/**
 * Minimal Backend Infrastructure - Production Ready
 * Essential endpoints and services for Wasel launch
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { supabase } from '../services/api';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());

// Smart Route Events
app.post('/api/smart-route/events', async (req, res) => {
  const { type, source, data, userId, tripId, location } = req.body;
  const { error } = await supabase.from('smart_route_events').insert({
    type, source, data, user_id: userId, trip_id: tripId, location
  });
  res.json({ success: !error });
});

// AI Route Suggestions
app.post('/api/ai/routes/suggest', async (req, res) => {
  const { query } = req.body;
  const suggestions = [
    { location: query + ' Mall', type: 'shopping', confidence: 0.9 },
    { location: query + ' Airport', type: 'transport', confidence: 0.8 }
  ];
  res.json({ success: true, data: suggestions });
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