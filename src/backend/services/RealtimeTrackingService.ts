/**
 * Real-time Tracking Service using WebSockets
 * Handles live location updates, trip tracking, and driver-passenger communication
 */

import { Server, Socket } from 'socket.io';
import { supabase } from '../supabase';

interface LocationUpdate {
  tripId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

interface ChatMessage {
  tripId: string;
  message: string;
  senderId: string;
  timestamp: string;
}

export class RealtimeTrackingService {
  private io: Server;
  private connectedUsers: Map<string, Socket> = new Map();
  private tripRooms: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  /**
   * Set up all socket event handlers
   */
  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Store user connection
      const userId = socket.handshake.auth.userId;
      if (userId) {
        this.connectedUsers.set(userId, socket);
      }

      // Join trip room
      socket.on('join-trip', async (data: { tripId: string; userId: string }) => {
        await this.handleJoinTrip(socket, data);
      });

      // Leave trip room
      socket.on('leave-trip', (data: { tripId: string }) => {
        this.handleLeaveTrip(socket, data.tripId);
      });

      // Location updates
      socket.on('location-update', async (data: LocationUpdate) => {
        await this.handleLocationUpdate(socket, data);
      });

      // Chat messages
      socket.on('chat-message', async (data: ChatMessage) => {
        await this.handleChatMessage(socket, data);
      });

      // Trip status updates
      socket.on('trip-status-update', async (data: { tripId: string; status: string }) => {
        await this.handleTripStatusUpdate(socket, data);
      });

      // Driver arrived
      socket.on('driver-arrived', async (data: { tripId: string }) => {
        await this.handleDriverArrived(socket, data.tripId);
      });

      // Trip started
      socket.on('trip-started', async (data: { tripId: string }) => {
        await this.handleTripStarted(socket, data.tripId);
      });

      // Trip completed
      socket.on('trip-completed', async (data: { tripId: string }) => {
        await this.handleTripCompleted(socket, data.tripId);
      });

      // Emergency SOS
      socket.on('emergency-sos', async (data: { tripId: string; location: any }) => {
        await this.handleEmergencySOS(socket, data);
      });

      // Typing indicator
      socket.on('typing', (data: { tripId: string; userId: string }) => {
        this.handleTyping(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  /**
   * Handle user joining a trip room
   */
  private async handleJoinTrip(
    socket: Socket,
    data: { tripId: string; userId: string }
  ): Promise<void> {
    try {
      const { tripId, userId } = data;

      // Verify user has access to this trip
      const { data: trip, error } = await supabase
        .from('trips')
        .select('driver_id, passenger_id, status')
        .eq('id', tripId)
        .single();

      if (error || !trip) {
        socket.emit('error', { message: 'Trip not found' });
        return;
      }

      // Check authorization
      if (trip.driver_id !== userId && trip.passenger_id !== userId) {
        socket.emit('error', { message: 'Unauthorized access to trip' });
        return;
      }

      // Join room
      socket.join(`trip-${tripId}`);

      // Track room membership
      if (!this.tripRooms.has(tripId)) {
        this.tripRooms.set(tripId, new Set());
      }
      this.tripRooms.get(tripId)!.add(userId);

      // Notify others in the room
      socket.to(`trip-${tripId}`).emit('user-joined', {
        userId,
        timestamp: new Date().toISOString()
      });

      // Send current trip data
      socket.emit('trip-joined', {
        tripId,
        status: trip.status,
        timestamp: new Date().toISOString()
      });

      // Get and send last known location
      const { data: location } = await supabase
        .from('live_locations')
        .select('*')
        .eq('trip_id', tripId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (location) {
        socket.emit('location-update', location);
      }

      console.log(`User ${userId} joined trip ${tripId}`);
    } catch (error) {
      console.error('Join trip error:', error);
      socket.emit('error', { message: 'Failed to join trip' });
    }
  }

  /**
   * Handle user leaving a trip room
   */
  private handleLeaveTrip(socket: Socket, tripId: string): void {
    socket.leave(`trip-${tripId}`);
    
    // Remove from tracking
    const room = this.tripRooms.get(tripId);
    if (room) {
      const userId = socket.handshake.auth.userId;
      room.delete(userId);
      
      if (room.size === 0) {
        this.tripRooms.delete(tripId);
      }
    }

    console.log(`Socket ${socket.id} left trip ${tripId}`);
  }

  /**
   * Handle location updates
   */
  private async handleLocationUpdate(
    socket: Socket,
    data: LocationUpdate
  ): Promise<void> {
    try {
      const { tripId, coordinates, heading, speed, accuracy } = data;
      const userId = socket.handshake.auth.userId;

      // Validate coordinates
      if (!this.validateCoordinates(coordinates)) {
        socket.emit('error', { message: 'Invalid coordinates' });
        return;
      }

      // Update location in database
      await supabase.from('live_locations').upsert({
        trip_id: tripId,
        user_id: userId,
        coordinates,
        heading: heading || 0,
        speed: speed || 0,
        accuracy: accuracy || 0,
        updated_at: new Date().toISOString()
      });

      // Broadcast to others in the trip
      socket.to(`trip-${tripId}`).emit('location-update', {
        userId,
        tripId,
        coordinates,
        heading,
        speed,
        timestamp: new Date().toISOString()
      });

      // Calculate and update ETA if this is the driver
      const { data: trip } = await supabase
        .from('trips')
        .select('driver_id, dropoff_location')
        .eq('id', tripId)
        .single();

      if (trip && trip.driver_id === userId) {
        // You can integrate with GoogleMapsService here to calculate updated ETA
        // const eta = await GoogleMapsService.calculateETA(coordinates, trip.dropoff_location);
      }
    } catch (error) {
      console.error('Location update error:', error);
      socket.emit('error', { message: 'Failed to update location' });
    }
  }

  /**
   * Handle chat messages
   */
  private async handleChatMessage(
    socket: Socket,
    data: ChatMessage
  ): Promise<void> {
    try {
      const { tripId, message, senderId } = data;

      // Sanitize message
      const sanitizedMessage = message.trim().substring(0, 1000);

      // Save message to database
      const { data: savedMessage, error } = await supabase
        .from('trip_messages')
        .insert({
          trip_id: tripId,
          sender_id: senderId,
          message: sanitizedMessage,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast to trip room
      this.io.to(`trip-${tripId}`).emit('chat-message', {
        ...savedMessage,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle trip status updates
   */
  private async handleTripStatusUpdate(
    socket: Socket,
    data: { tripId: string; status: string }
  ): Promise<void> {
    try {
      const { tripId, status } = data;

      // Update trip status
      await supabase
        .from('trips')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', tripId);

      // Broadcast to all users in trip
      this.io.to(`trip-${tripId}`).emit('trip-status-changed', {
        tripId,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Trip status update error:', error);
      socket.emit('error', { message: 'Failed to update trip status' });
    }
  }

  /**
   * Handle driver arrived notification
   */
  private async handleDriverArrived(socket: Socket, tripId: string): Promise<void> {
    try {
      await supabase
        .from('trips')
        .update({
          status: 'driver_arrived',
          driver_arrived_at: new Date().toISOString()
        })
        .eq('id', tripId);

      // Notify passenger
      this.io.to(`trip-${tripId}`).emit('driver-arrived', {
        tripId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Driver arrived error:', error);
    }
  }

  /**
   * Handle trip started
   */
  private async handleTripStarted(socket: Socket, tripId: string): Promise<void> {
    try {
      await supabase
        .from('trips')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', tripId);

      this.io.to(`trip-${tripId}`).emit('trip-started', {
        tripId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Trip started error:', error);
    }
  }

  /**
   * Handle trip completed
   */
  private async handleTripCompleted(socket: Socket, tripId: string): Promise<void> {
    try {
      await supabase
        .from('trips')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', tripId);

      this.io.to(`trip-${tripId}`).emit('trip-completed', {
        tripId,
        timestamp: new Date().toISOString()
      });

      // Clean up tracking data after a delay
      setTimeout(() => {
        this.cleanupTripData(tripId);
      }, 60000); // 1 minute delay
    } catch (error) {
      console.error('Trip completed error:', error);
    }
  }

  /**
   * Handle emergency SOS
   */
  private async handleEmergencySOS(
    socket: Socket,
    data: { tripId: string; location: any }
  ): Promise<void> {
    try {
      const { tripId, location } = data;
      const userId = socket.handshake.auth.userId;

      // Save emergency alert
      await supabase.from('emergency_alerts').insert({
        trip_id: tripId,
        user_id: userId,
        location,
        status: 'active',
        created_at: new Date().toISOString()
      });

      // Alert everyone in the trip
      this.io.to(`trip-${tripId}`).emit('emergency-alert', {
        tripId,
        userId,
        location,
        timestamp: new Date().toISOString()
      });

      // Send to emergency monitoring system (if implemented)
      // await EmergencyService.handleSOS(tripId, userId, location);

      console.error(`EMERGENCY SOS: Trip ${tripId}, User ${userId}`);
    } catch (error) {
      console.error('Emergency SOS error:', error);
    }
  }

  /**
   * Handle typing indicator
   */
  private handleTyping(socket: Socket, data: { tripId: string; userId: string }): void {
    socket.to(`trip-${data.tripId}`).emit('user-typing', {
      userId: data.userId,
      tripId: data.tripId
    });
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(socket: Socket, userId?: string): void {
    if (userId) {
      this.connectedUsers.delete(userId);
    }

    // Remove from all trip rooms
    this.tripRooms.forEach((users, tripId) => {
      if (userId && users.has(userId)) {
        users.delete(userId);
        socket.to(`trip-${tripId}`).emit('user-left', {
          userId,
          timestamp: new Date().toISOString()
        });
      }
    });

    console.log(`Socket disconnected: ${socket.id}`);
  }

  /**
   * Broadcast location update to specific trip
   */
  public broadcastLocationUpdate(tripId: string, locationData: any): void {
    this.io.to(`trip-${tripId}`).emit('location-update', locationData);
  }

  /**
   * Send notification to specific user
   */
  public sendNotificationToUser(userId: string, notification: any): void {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }

  /**
   * Validate coordinates
   */
  private validateCoordinates(coordinates: { lat: number; lng: number }): boolean {
    return (
      coordinates.lat >= -90 &&
      coordinates.lat <= 90 &&
      coordinates.lng >= -180 &&
      coordinates.lng <= 180
    );
  }

  /**
   * Clean up trip data after completion
   */
  private async cleanupTripData(tripId: string): Promise<void> {
    try {
      // Archive live locations
      await supabase
        .from('live_locations')
        .delete()
        .eq('trip_id', tripId);

      // Remove from tracking
      this.tripRooms.delete(tripId);

      console.log(`Cleaned up data for trip ${tripId}`);
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get active trips count
   */
  public getActiveTripsCount(): number {
    return this.tripRooms.size;
  }
}
