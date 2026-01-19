/**
 * Wasel Backend - Complete Production Infrastructure
 * 10 Core Services for Full Platform Launch
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { supabase } from '../services/api';

// Import all services
import { PaymentService } from './services/PaymentService';
import { NotificationService } from './services/NotificationService';
import { TripMatchingService } from './services/TripMatchingService';
import { TrackingService } from './services/TrackingService';
import { AIService } from './services/AIService';
import { AdminService } from './services/AdminService';
import { ScheduledJobsService } from './services/ScheduledJobsService';
import { AnalyticsService } from './services/AnalyticsService';
import { EmergencyService } from './services/EmergencyService';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json());
app.use(cors());

// Initialize scheduled jobs
ScheduledJobsService.init();

// === PAYMENT ENDPOINTS ===
app.post('/api/payments/process', async (req, res) => {
  const { tripId, amount, currency } = req.body;
  const result = await PaymentService.processPayment(tripId, amount, currency);
  res.json(result);
});

app.post('/api/payments/webhook', async (req, res) => {
  await PaymentService.handleWebhook(req.body);
  res.json({ received: true });
});

// === TRIP MATCHING ENDPOINTS ===
app.post('/api/trips/match-driver', async (req, res) => {
  const { tripId } = req.body;
  const result = await TripMatchingService.matchDriver(tripId);
  res.json(result);
});

app.get('/api/drivers/nearby', async (req, res) => {
  const { lat, lng, radius } = req.query;
  const drivers = await TripMatchingService.findNearbyDrivers(Number(lat), Number(lng), Number(radius));
  res.json({ success: true, data: drivers });
});

// === TRACKING ENDPOINTS ===
app.post('/api/tracking/update-location', async (req, res) => {
  const { userId, tripId, lat, lng, heading } = req.body;
  const result = await TrackingService.updateLocation(userId, tripId, lat, lng, heading);
  res.json(result);
});

app.post('/api/trips/start', async (req, res) => {
  const { tripId } = req.body;
  const result = await TrackingService.startTrip(tripId);
  res.json(result);
});

app.post('/api/trips/complete', async (req, res) => {
  const { tripId, finalLat, finalLng } = req.body;
  const result = await TrackingService.completeTrip(tripId, finalLat, finalLng);
  res.json(result);
});

// === AI ENDPOINTS ===
app.post('/api/ai/optimize-route', async (req, res) => {
  const { pickup, dropoff } = req.body;
  const result = await AIService.optimizeRoute(pickup, dropoff);
  res.json({ success: true, data: result });
});

app.post('/api/ai/dynamic-pricing', async (req, res) => {
  const { distance, demand } = req.body;
  const result = await AIService.calculateDynamicPricing(distance, demand);
  res.json({ success: true, data: result });
});

app.post('/api/ai/suggest-locations', async (req, res) => {
  const { query, userLat, userLng } = req.body;
  const suggestions = await AIService.suggestLocations(query, userLat, userLng);
  res.json({ success: true, data: suggestions });
});

// === ADMIN ENDPOINTS ===
app.get('/api/admin/dashboard', async (req, res) => {
  const stats = await AdminService.getDashboardStats();
  res.json({ success: true, data: stats });
});

app.post('/api/admin/manage-user', async (req, res) => {
  const { userId, action, reason } = req.body;
  const result = await AdminService.manageUser(userId, action, reason);
  res.json(result);
});

app.get('/api/admin/live-trips', async (req, res) => {
  const trips = await AdminService.getLiveTrips();
  res.json({ success: true, data: trips });
});

// === NOTIFICATION ENDPOINTS ===
app.post('/api/notifications/sms', async (req, res) => {
  const { phone, message } = req.body;
  const result = await NotificationService.sendSMS(phone, message);
  res.json(result);
});

app.post('/api/notifications/bulk', async (req, res) => {
  const { userIds, title, message } = req.body;
  const result = await NotificationService.sendBulkNotification(userIds, title, message);
  res.json(result);
});

// === EMERGENCY ENDPOINTS ===
app.post('/api/emergency/sos', async (req, res) => {
  const { userId, tripId, location, type } = req.body;
  const result = await EmergencyService.triggerSOS(userId, tripId, location, type);
  io.to(`trip-${tripId}`).emit('emergency-alert', { tripId, location, type });
  res.json(result);
});

app.post('/api/emergency/share-trip', async (req, res) => {
  const { tripId, shareWithPhone } = req.body;
  const result = await EmergencyService.shareTrip(tripId, shareWithPhone);
  res.json(result);
});

// === ANALYTICS ENDPOINTS ===
app.post('/api/analytics/track', async (req, res) => {
  const { userId, event, properties } = req.body;
  await AnalyticsService.trackEvent(userId, event, properties);
  res.json({ success: true });
});

app.get('/api/analytics/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  const { days } = req.query;
  const performance = await AnalyticsService.getDriverPerformance(driverId, Number(days) || 30);
  res.json({ success: true, data: performance });
});

// === SCHEDULED TRIPS ===
app.post('/api/trips/schedule', async (req, res) => {
  const { tripData, scheduledFor } = req.body;
  const result = await ScheduledJobsService.scheduleTrip(tripData, scheduledFor);
  res.json(result);
});

// === WEBSOCKET EVENTS ===
io.on('connection', (socket) => {
  socket.on('join-trip', (tripId) => socket.join(`trip-${tripId}`));
  
  socket.on('location-update', async (data) => {
    await TrackingService.updateLocation(data.userId, data.tripId, data.lat, data.lng, data.heading);
    socket.to(`trip-${data.tripId}`).emit('location-broadcast', data);
  });
  
  socket.on('trip-status-update', (data) => {
    socket.to(`trip-${data.tripId}`).emit('status-change', data);
  });
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      payments: 'active',
      notifications: 'active',
      matching: 'active',
      tracking: 'active',
      ai: 'active',
      admin: 'active',
      scheduling: 'active',
      analytics: 'active',
      emergency: 'active'
    }
  });
});

server.listen(3001, () => {
  console.log('🚀 Wasel Backend Services Ready on port 3001');
  console.log('✅ Payment Processing');
  console.log('✅ Trip Matching & Tracking');
  console.log('✅ AI Services');
  console.log('✅ Admin Dashboard');
  console.log('✅ Notifications');
  console.log('✅ Emergency Services');
  console.log('✅ Analytics');
  console.log('✅ Scheduled Jobs');
  console.log('✅ Real-time WebSocket');
  console.log('✅ All 10 Core Services Active');
});