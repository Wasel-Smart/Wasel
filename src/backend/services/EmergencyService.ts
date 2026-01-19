import { supabase } from '../supabase';
import { NotificationService } from './NotificationService';

export class EmergencyService {
  static async triggerSOS(userId: string, tripId: string, location: { lat: number; lng: number }, type: 'panic' | 'medical' | 'accident' = 'panic') {
    const alertId = await this.createEmergencyAlert(userId, tripId, location, type);
    
    // Notify emergency contacts
    await this.notifyEmergencyContacts(userId, alertId, location);
    
    // Notify admin/support
    await this.notifySupport(alertId, userId, tripId, location, type);
    
    // If in trip, notify driver/passenger
    if (tripId) {
      await this.notifyTripParticipants(tripId, userId, type);
    }

    return { success: true, alertId, emergency_number: '+971-4-999-9999' };
  }

  private static async createEmergencyAlert(userId: string, tripId: string, location: any, type: string) {
    const { data: alert } = await supabase.from('emergency_alerts').insert({
      user_id: userId,
      trip_id: tripId,
      alert_type: type,
      location: `POINT(${location.lng} ${location.lat})`,
      status: 'active',
      created_at: new Date().toISOString()
    }).select().single();

    return alert.id;
  }

  private static async notifyEmergencyContacts(userId: string, alertId: string, location: any) {
    const { data: contacts } = await supabase.from('emergency_contacts')
      .select('name, phone')
      .eq('user_id', userId);

    for (const contact of contacts || []) {
      await NotificationService.sendSMS(
        contact.phone,
        `EMERGENCY: Your contact has triggered an SOS alert. Location: ${location.lat}, ${location.lng}. Alert ID: ${alertId}`
      );
    }
  }

  private static async notifySupport(alertId: string, userId: string, tripId: string, location: any, type: string) {
    await supabase.from('support_tickets').insert({
      user_id: userId,
      trip_id: tripId,
      type: 'emergency',
      priority: 'critical',
      subject: `Emergency Alert: ${type}`,
      description: `SOS triggered. Alert ID: ${alertId}. Location: ${location.lat}, ${location.lng}`,
      status: 'open'
    });
  }

  private static async notifyTripParticipants(tripId: string, alertUserId: string, type: string) {
    const { data: trip } = await supabase.from('trips')
      .select('passenger_id, driver_id')
      .eq('id', tripId)
      .single();

    if (!trip) return;

    const otherUserId = trip.passenger_id === alertUserId ? trip.driver_id : trip.passenger_id;
    
    await NotificationService.sendTripNotification(
      tripId,
      trip.passenger_id === alertUserId ? 'driver' : 'passenger',
      `Emergency alert triggered in your trip. Please ensure safety and contact authorities if needed.`
    );
  }

  static async resolveEmergencyAlert(alertId: string, resolution: string, resolvedBy: string) {
    await supabase.from('emergency_alerts').update({
      status: 'resolved',
      resolution,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString()
    }).eq('id', alertId);

    return { success: true };
  }

  static async addEmergencyContact(userId: string, name: string, phone: string, relationship: string) {
    await supabase.from('emergency_contacts').insert({
      user_id: userId,
      name,
      phone,
      relationship
    });

    return { success: true };
  }

  static async shareTrip(tripId: string, shareWithPhone: string) {
    const { data: trip } = await supabase.from('trips')
      .select(`
        id, status, pickup_address, dropoff_address, estimated_arrival,
        users!trips_passenger_id_fkey(name),
        drivers!trips_driver_id_fkey(name, phone, vehicle_plate)
      `)
      .eq('id', tripId)
      .single();

    if (!trip) throw new Error('Trip not found');

    const shareLink = `https://wasel.com/track/${tripId}`;
    const message = `${trip.users[0]?.name} is sharing their trip with you. Track here: ${shareLink}. Driver: ${trip.drivers?.[0]?.name}, Plate: ${trip.drivers?.[0]?.vehicle_plate}`;

    await NotificationService.sendSMS(shareWithPhone, message);
    
    await supabase.from('trip_shares').insert({
      trip_id: tripId,
      shared_with_phone: shareWithPhone,
      share_link: shareLink
    });

    return { success: true, shareLink };
  }

  static async getActiveAlerts() {
    const { data: alerts } = await supabase.from('emergency_alerts')
      .select(`
        id, alert_type, location, created_at,
        users!emergency_alerts_user_id_fkey(name, phone),
        trips!emergency_alerts_trip_id_fkey(pickup_address, dropoff_address)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return alerts || [];
  }
}