import { supabase } from '../supabase';

export class TrackingService {
  static async updateLocation(userId: string, tripId: string, lat: number, lng: number, heading?: number) {
    await supabase.from('live_locations').upsert({
      user_id: userId,
      trip_id: tripId,
      coordinates: `POINT(${lng} ${lat})`,
      heading,
      updated_at: new Date().toISOString()
    });

    const { data: trip } = await supabase.from('trips')
      .select('status, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng')
      .eq('id', tripId).single();

    if (trip?.status === 'driver_assigned') {
      const distance = this.calculateDistance(lat, lng, trip.pickup_lat, trip.pickup_lng);
      if (distance < 0.1) { // Within 100m
        await supabase.from('trips').update({ status: 'driver_arrived' }).eq('id', tripId);
      }
    }

    return { success: true };
  }

  static async getTripLocations(tripId: string) {
    const { data } = await supabase.from('live_locations')
      .select('user_id, coordinates, heading, updated_at')
      .eq('trip_id', tripId)
      .order('updated_at', { ascending: false });

    return data?.map(loc => ({
      userId: loc.user_id,
      lat: parseFloat(loc.coordinates.split('(')[1].split(' ')[1]),
      lng: parseFloat(loc.coordinates.split('(')[1].split(' ')[0]),
      heading: loc.heading,
      timestamp: loc.updated_at
    })) || [];
  }

  static async startTrip(tripId: string) {
    await supabase.from('trips').update({ 
      status: 'in_progress',
      started_at: new Date().toISOString()
    }).eq('id', tripId);

    return { success: true };
  }

  static async completeTrip(tripId: string, finalLat: number, finalLng: number) {
    const { data: trip } = await supabase.from('trips')
      .select('pickup_lat, pickup_lng, base_fare')
      .eq('id', tripId).single();

    if (!trip) throw new Error('Trip not found');

    const distance = this.calculateDistance(trip.pickup_lat, trip.pickup_lng, finalLat, finalLng);
    const fare = trip.base_fare + (distance * 2); // AED 2 per km

    await supabase.from('trips').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      final_fare: fare,
      distance_km: distance
    }).eq('id', tripId);

    return { success: true, fare, distance };
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
}