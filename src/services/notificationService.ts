/**
 * Notification Service
 * Handles push notifications, SMS, email, and in-app notifications
 */

import { supabase } from './api';
import { pushNotificationService, smsService, emailService } from './integrations';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'trip' | 'payment' | 'system' | 'emergency' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('push' | 'sms' | 'email' | 'in_app')[];
  data?: Record<string, any>;
  read: boolean;
  sent_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_enabled: boolean;
  trip_updates: boolean;
  payment_updates: boolean;
  promotions: boolean;
  emergency_alerts: boolean;
}

class NotificationService {
  /**
   * Send notification through multiple channels
   */
  async sendNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      type: Notification['type'];
      priority?: Notification['priority'];
      channels?: Notification['channels'];
      data?: Record<string, any>;
    }
  ): Promise<{ success: boolean; notificationId?: string }> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Determine channels based on preferences and priority
      const channels = this.determineChannels(
        notification.channels || ['push', 'in_app'],
        preferences,
        notification.priority || 'medium'
      );

      // Store notification in database
      const { data: savedNotification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority || 'medium',
          channels,
          data: notification.data,
          read: false,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Send through each channel
      await Promise.all([
        channels.includes('push') && this.sendPushNotification(userId, notification),
        channels.includes('sms') && this.sendSMSNotification(userId, notification),
        channels.includes('email') && this.sendEmailNotification(userId, notification),
      ].filter(Boolean));

      return { success: true, notificationId: savedNotification.id };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false };
    }
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(
    userId: string,
    notification: { title: string; message: string; data?: any }
  ): Promise<void> {
    await pushNotificationService.sendPushNotification(userId, {
      title: notification.title,
      body: notification.message,
      data: notification.data,
    });
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    userId: string,
    notification: { title: string; message: string }
  ): Promise<void> {
    // Get user phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (profile?.phone_number) {
      const message = `${notification.title}\n\n${notification.message}`;
      await smsService.sendSMS(profile.phone_number, message);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: string,
    notification: { title: string; message: string }
  ): Promise<void> {
    // Get user email
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      // This would typically use a proper email template
      await emailService.sendTripReceipt(user.email, 'notification', {
        title: notification.title,
        message: notification.message,
      });
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Return default preferences
      return {
        user_id: userId,
        push_enabled: true,
        sms_enabled: true,
        email_enabled: true,
        trip_updates: true,
        payment_updates: true,
        promotions: false,
        emergency_alerts: true,
      };
    }

    return data;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);

    if (error) throw error;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Determine which channels to use based on preferences and priority
   */
  private determineChannels(
    requestedChannels: Notification['channels'],
    preferences: NotificationPreferences,
    priority: Notification['priority']
  ): Notification['channels'] {
    const channels: Notification['channels'] = [];

    // Always include in-app
    if (requestedChannels.includes('in_app')) {
      channels.push('in_app');
    }

    // Push notifications
    if (requestedChannels.includes('push') && preferences.push_enabled) {
      channels.push('push');
    }

    // SMS for urgent notifications or if enabled
    if (requestedChannels.includes('sms') && 
        (preferences.sms_enabled || priority === 'urgent')) {
      channels.push('sms');
    }

    // Email for important notifications or if enabled
    if (requestedChannels.includes('email') && 
        (preferences.email_enabled || priority === 'high' || priority === 'urgent')) {
      channels.push('email');
    }

    return channels;
  }

  /**
   * Send trip-related notifications
   */
  async sendTripNotification(
    userId: string,
    tripId: string,
    type: 'booking_confirmed' | 'driver_assigned' | 'driver_arriving' | 'trip_started' | 'trip_completed' | 'trip_cancelled',
    additionalData?: Record<string, any>
  ): Promise<void> {
    const notifications = {
      booking_confirmed: {
        title: 'Booking Confirmed',
        message: 'Your trip has been confirmed. Driver details will be shared soon.',
        priority: 'medium' as const,
      },
      driver_assigned: {
        title: 'Driver Assigned',
        message: 'A driver has been assigned to your trip. Check the app for details.',
        priority: 'high' as const,
      },
      driver_arriving: {
        title: 'Driver Arriving',
        message: 'Your driver is arriving at the pickup location.',
        priority: 'high' as const,
      },
      trip_started: {
        title: 'Trip Started',
        message: 'Your trip has started. Enjoy your ride!',
        priority: 'medium' as const,
      },
      trip_completed: {
        title: 'Trip Completed',
        message: 'Your trip has been completed. Please rate your experience.',
        priority: 'medium' as const,
      },
      trip_cancelled: {
        title: 'Trip Cancelled',
        message: 'Your trip has been cancelled. Any charges will be refunded.',
        priority: 'high' as const,
      },
    };

    const notification = notifications[type];
    if (notification) {
      await this.sendNotification(userId, {
        ...notification,
        type: 'trip',
        channels: ['push', 'in_app'],
        data: { tripId, ...additionalData },
      });
    }
  }

  /**
   * Send payment-related notifications
   */
  async sendPaymentNotification(
    userId: string,
    type: 'payment_successful' | 'payment_failed' | 'refund_processed',
    amount: number,
    currency: string = 'AED'
  ): Promise<void> {
    const notifications = {
      payment_successful: {
        title: 'Payment Successful',
        message: `Payment of ${amount} ${currency} has been processed successfully.`,
        priority: 'medium' as const,
      },
      payment_failed: {
        title: 'Payment Failed',
        message: `Payment of ${amount} ${currency} could not be processed. Please try again.`,
        priority: 'high' as const,
      },
      refund_processed: {
        title: 'Refund Processed',
        message: `Refund of ${amount} ${currency} has been processed to your account.`,
        priority: 'medium' as const,
      },
    };

    const notification = notifications[type];
    if (notification) {
      await this.sendNotification(userId, {
        ...notification,
        type: 'payment',
        channels: ['push', 'in_app', 'email'],
        data: { amount, currency },
      });
    }
  }

  /**
   * Send emergency notification
   */
  async sendEmergencyNotification(
    userId: string,
    message: string,
    location?: { lat: number; lng: number }
  ): Promise<void> {
    await this.sendNotification(userId, {
      title: '🚨 Emergency Alert',
      message,
      type: 'emergency',
      priority: 'urgent',
      channels: ['push', 'sms', 'in_app'],
      data: { location },
    });
  }
}

export const notificationService = new NotificationService();