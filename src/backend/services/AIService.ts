import { supabase } from '../../services/api';

export class AIService {
  static async optimizeRoute(pickup: [number, number], dropoff: [number, number]) {
    // Simple route optimization - in production, integrate with Google Routes API
    const distance = this.calculateDistance(pickup[0], pickup[1], dropoff[0], dropoff[1]);
    const duration = Math.round(distance * 3); // 3 minutes per km average
    
    return {
      distance_km: distance,
      duration_minutes: duration,
      optimized_waypoints: [pickup, dropoff],
      traffic_factor: 1.2
    };
  }

  static async calculateDynamicPricing(distance: number, demand: number = 1) {
    const baseFare = 10;
    const perKm = 2;
    const surgeMultiplier = Math.min(demand * 0.5 + 1, 3); // Max 3x surge
    
    const price = (baseFare + (distance * perKm)) * surgeMultiplier;
    
    await supabase.from('pricing_events').insert({
      distance_km: distance,
      base_price: baseFare + (distance * perKm),
      surge_multiplier: surgeMultiplier,
      final_price: price,
      demand_level: demand
    });

    return {
      price: Math.round(price),
      surge_multiplier: surgeMultiplier,
      breakdown: {
        base_fare: baseFare,
        distance_fare: distance * perKm,
        surge_amount: price - (baseFare + (distance * perKm))
      }
    };
  }

  static async detectFraud(userId: string, tripData: any) {
    const { data: userTrips } = await supabase.from('trips')
      .select('created_at, final_fare')
      .eq('passenger_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const riskScore = this.calculateRiskScore(tripData, userTrips || []);
    
    if (riskScore > 0.7) {
      await supabase.from('fraud_alerts').insert({
        user_id: userId,
        trip_id: tripData.id,
        risk_score: riskScore,
        flags: ['unusual_pattern', 'high_frequency'],
        status: 'pending_review'
      });
    }

    return { risk_score: riskScore, is_suspicious: riskScore > 0.7 };
  }

  static async suggestLocations(query: string, userLat: number, userLng: number) {
    // Simple location suggestions - integrate with Google Places API
    const suggestions = [
      { name: `${query} Mall`, type: 'shopping', distance: 2.5 },
      { name: `${query} Airport`, type: 'transport', distance: 15.2 },
      { name: `${query} Hospital`, type: 'medical', distance: 3.1 }
    ].map(s => ({
      ...s,
      lat: userLat + (Math.random() - 0.5) * 0.1,
      lng: userLng + (Math.random() - 0.5) * 0.1
    }));

    return suggestions;
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  private static calculateRiskScore(tripData: any, userHistory: any[]) {
    let score = 0;
    if (userHistory.length > 5 && Date.now() - new Date(userHistory[0].created_at).getTime() < 3600000) score += 0.3;
    if (tripData.final_fare > 500) score += 0.2;
    if (userHistory.length === 0) score += 0.1;
    return Math.min(score, 1);
  }
}