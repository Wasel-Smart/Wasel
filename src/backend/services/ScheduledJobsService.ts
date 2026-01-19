import * as cron from 'node-cron';
import { supabase } from '../supabase';
import { NotificationService } from './NotificationService';

export class ScheduledJobsService {
  static init() {
    // Clean expired sessions every hour
    cron.schedule('0 * * * *', this.cleanExpiredSessions);
    
    // Process scheduled trips every minute
    cron.schedule('* * * * *', this.processScheduledTrips);
    
    // Generate daily reports at midnight
    cron.schedule('0 0 * * *', this.generateDailyReports);
    
    // Check driver availability every 5 minutes
    cron.schedule('*/5 * * * *', this.updateDriverAvailability);
    
    console.log('📅 Scheduled jobs initialized');
  }

  private static async cleanExpiredSessions() {
    const expiredTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('user_sessions').delete().lt('last_active', expiredTime);
  }

  private static async processScheduledTrips() {
    const now = new Date();
    const scheduledTime = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 min ahead

    const { data: trips } = await supabase.from('trips')
      .select('id, passenger_id, scheduled_for')
      .eq('status', 'scheduled')
      .lte('scheduled_for', scheduledTime);

    for (const trip of trips || []) {
      await supabase.from('trips').update({ status: 'pending' }).eq('id', trip.id);
      await NotificationService.sendTripNotification(trip.id, 'passenger', 'Your scheduled trip is starting soon!');
    }
  }

  private static async generateDailyReports() {
    const today = new Date().toISOString().split('T')[0];
    
    const [trips, revenue, newUsers] = await Promise.all([
      supabase.from('trips').select('id', { count: 'exact' }).gte('created_at', today),
      supabase.from('payments').select('amount').eq('status', 'completed').gte('created_at', today),
      supabase.from('users').select('id', { count: 'exact' }).gte('created_at', today)
    ]);

    const totalRevenue = revenue.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

    await supabase.from('daily_reports').insert({
      date: today,
      total_trips: trips.count || 0,
      total_revenue: totalRevenue,
      new_users: newUsers.count || 0,
      platform_fee: totalRevenue * 0.2
    });
  }

  private static async updateDriverAvailability() {
    const inactiveTime = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min ago
    
    await supabase.from('drivers')
      .update({ status: 'offline' })
      .eq('status', 'available')
      .lt('last_location_update', inactiveTime);
  }

  static async scheduleTrip(tripData: any, scheduledFor: string) {
    const { data: trip } = await supabase.from('trips').insert({
      ...tripData,
      status: 'scheduled',
      scheduled_for: scheduledFor
    }).select().single();

    return { success: true, tripId: trip.id };
  }

  static async cancelScheduledTrip(tripId: string) {
    const { data: trip } = await supabase.from('trips')
      .select('scheduled_for, passenger_id')
      .eq('id', tripId)
      .single();

    if (!trip) throw new Error('Trip not found');

    const hoursUntilTrip = (new Date(trip.scheduled_for).getTime() - Date.now()) / (1000 * 60 * 60);
    const cancellationFee = hoursUntilTrip < 1 ? 5 : 0; // AED 5 fee if less than 1 hour

    await supabase.from('trips').update({ 
      status: 'cancelled',
      cancellation_fee: cancellationFee 
    }).eq('id', tripId);

    return { success: true, cancellationFee };
  }
}