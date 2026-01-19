import { supabase } from '../supabase';

export class AnalyticsService {
  static async trackEvent(userId: string, event: string, properties: any = {}) {
    await supabase.from('analytics_events').insert({
      user_id: userId,
      event_name: event,
      properties,
      timestamp: new Date().toISOString()
    });
  }

  static async getDriverPerformance(driverId: string, days = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const [trips, ratings, earnings] = await Promise.all([
      supabase.from('trips')
        .select('id, status, distance_km, created_at')
        .eq('driver_id', driverId)
        .gte('created_at', startDate),
      supabase.from('ratings')
        .select('rating')
        .eq('driver_id', driverId)
        .gte('created_at', startDate),
      supabase.from('payments')
        .select('amount')
        .eq('driver_id', driverId)
        .eq('status', 'completed')
        .gte('created_at', startDate)
    ]);

    const completedTrips = trips.data?.filter(t => t.status === 'completed') || [];
    const totalEarnings = earnings.data?.reduce((sum, p) => sum + (p.amount * 0.8), 0) || 0;
    const avgRating = ratings.data?.reduce((sum, r) => sum + r.rating, 0) / (ratings.data?.length || 1);

    return {
      total_trips: completedTrips.length,
      total_distance: completedTrips.reduce((sum, t) => sum + (t.distance_km || 0), 0),
      total_earnings: totalEarnings,
      average_rating: Math.round(avgRating * 10) / 10,
      completion_rate: completedTrips.length / (trips.data?.length || 1),
      daily_average: totalEarnings / days
    };
  }

  static async getPlatformMetrics(days = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const [trips, users, revenue, activeDrivers] = await Promise.all([
      supabase.from('trips').select('id, status, created_at').gte('created_at', startDate),
      supabase.from('users').select('id', { count: 'exact' }).gte('created_at', startDate),
      supabase.from('payments').select('amount').eq('status', 'completed').gte('created_at', startDate),
      supabase.from('drivers').select('id', { count: 'exact' }).eq('status', 'available')
    ]);

    const completedTrips = trips.data?.filter(t => t.status === 'completed') || [];
    const totalRevenue = revenue.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      period_days: days,
      total_trips: trips.data?.length || 0,
      completed_trips: completedTrips.length,
      new_users: users.count || 0,
      total_revenue: totalRevenue,
      platform_revenue: totalRevenue * 0.2,
      active_drivers: activeDrivers.count || 0,
      completion_rate: completedTrips.length / (trips.data?.length || 1)
    };
  }

  static async getUserInsights(userId: string) {
    const [trips, payments, ratings] = await Promise.all([
      supabase.from('trips').select('*').eq('passenger_id', userId).order('created_at', { ascending: false }),
      supabase.from('payments').select('amount, created_at').eq('user_id', userId).eq('status', 'completed'),
      supabase.from('ratings').select('rating, created_at').eq('passenger_id', userId)
    ]);

    const totalSpent = payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const avgRating = ratings.data?.reduce((sum, r) => sum + r.rating, 0) / (ratings.data?.length || 1);
    const favoritePickup = this.getMostFrequentLocation(trips.data?.map(t => t.pickup_address) || []);

    return {
      total_trips: trips.data?.length || 0,
      total_spent: totalSpent,
      average_rating_given: Math.round(avgRating * 10) / 10,
      favorite_pickup: favoritePickup,
      member_since: trips.data?.[trips.data.length - 1]?.created_at,
      last_trip: trips.data?.[0]?.created_at
    };
  }

  static async generateHeatmapData(city: string) {
    const { data: trips } = await supabase.from('trips')
      .select('pickup_lat, pickup_lng, dropoff_lat, dropoff_lng')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const heatmapPoints = [];
    trips?.forEach(trip => {
      heatmapPoints.push({ lat: trip.pickup_lat, lng: trip.pickup_lng, weight: 1 });
      heatmapPoints.push({ lat: trip.dropoff_lat, lng: trip.dropoff_lng, weight: 1 });
    });

    return heatmapPoints;
  }

  private static getMostFrequentLocation(addresses: string[]) {
    const frequency = addresses.reduce((acc, addr) => {
      acc[addr] = (acc[addr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b, '');
  }
}