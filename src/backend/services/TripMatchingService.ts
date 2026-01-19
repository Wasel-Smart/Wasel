import { supabase } from '../../services/api';

export class TripMatchingService {
  static async findNearbyDrivers(lat: number, lng: number, radius = 5) {
    const { data: drivers } = await supabase.rpc('find_nearby_drivers', {
      user_lat: lat,
      user_lng: lng,
      radius_km: radius
    });
    
    return drivers?.filter(d => d.status === 'available') || [];
  }

  static async matchDriver(tripId: string) {
    const { data: trip } = await supabase.from('trips')
      .select('pickup_lat, pickup_lng, vehicle_type')
      .eq('id', tripId).single();

    const drivers = await this.findNearbyDrivers(trip.pickup_lat, trip.pickup_lng);
    const matchedDriver = drivers.find(d => d.vehicle_type === trip.vehicle_type) || drivers[0];

    if (matchedDriver) {
      await supabase.from('trips')
        .update({ 
          driver_id: matchedDriver.id, 
          status: 'driver_assigned',
          matched_at: new Date().toISOString()
        })
        .eq('id', tripId);

      await supabase.from('drivers')
        .update({ status: 'busy' })
        .eq('id', matchedDriver.id);

      return { success: true, driver: matchedDriver };
    }

    return { success: false, error: 'No drivers available' };
  }

  static async calculateETA(driverLat: number, driverLng: number, pickupLat: number, pickupLng: number) {
    const distance = this.calculateDistance(driverLat, driverLng, pickupLat, pickupLng);
    const eta = Math.round(distance * 2); // 2 minutes per km average
    return { eta_minutes: eta, distance_km: distance };
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}