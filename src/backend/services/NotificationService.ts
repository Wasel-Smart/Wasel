import { Twilio } from 'twilio';
import { supabase } from '../supabase';

const twilio = new Twilio(process.env.TWILIO_SID!, process.env.TWILIO_TOKEN!);

export class NotificationService {
  static async sendSMS(phone: string, message: string) {
    try {
      await twilio.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE!,
        to: phone
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async sendTripNotification(tripId: string, type: string, message: string) {
    const { data: trip } = await supabase.from('trips')
      .select('passenger_id, driver_id, users!trips_passenger_id_fkey(phone), drivers!trips_driver_id_fkey(phone)')
      .eq('id', tripId).single();

    if (!trip) return;

    if (type === 'passenger' && trip.users?.[0]?.phone) {
      await this.sendSMS(trip.users[0].phone, message);
    }
    if (type === 'driver' && trip.drivers?.[0]?.phone) {
      await this.sendSMS(trip.drivers[0].phone, message);
    }

    await supabase.from('notifications').insert({
      user_id: type === 'passenger' ? trip.passenger_id : trip.driver_id,
      title: 'Trip Update',
      message,
      type: 'sms'
    });
  }

  static async sendBulkNotification(userIds: string[], title: string, message: string) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: 'push'
    }));
    
    await supabase.from('notifications').insert(notifications);
    return { success: true, sent: userIds.length };
  }
}