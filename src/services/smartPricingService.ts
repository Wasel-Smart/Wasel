import { supabase } from '../utils/supabase/client';

interface SmartPricingFactors {
  demandPrediction: number;
  weatherImpact: number;
  eventPricing: number;
  carbonOffset: number;
  loyaltyDiscount: number;
  timeOfDay: number;
  trafficDensity: number;
  userBehavior: number;
}

interface DynamicPriceResult {
  baseFare: number;
  dynamicMultiplier: number;
  finalPrice: number;
  factors: SmartPricingFactors;
  explanation: string;
}

class SmartPricingService {
  async calculateDynamicPrice(
    fromLat: number,
    fromLng: number,
    toLat: number,
    toLng: number,
    userId: string,
    vehicleType: string = 'standard'
  ): Promise<DynamicPriceResult> {
    const baseFare = this.calculateBaseFare(fromLat, fromLng, toLat, toLng, vehicleType);
    
    const factors: SmartPricingFactors = {
      demandPrediction: await this.predictDemand(fromLat, fromLng),
      weatherImpact: await this.getWeatherImpact(fromLat, fromLng),
      eventPricing: await this.getEventPricing(fromLat, fromLng, toLat, toLng),
      carbonOffset: this.calculateCarbonOffset(fromLat, fromLng, toLat, toLng),
      loyaltyDiscount: await this.getLoyaltyDiscount(userId),
      timeOfDay: this.getTimeOfDayMultiplier(),
      trafficDensity: await this.getTrafficDensity(fromLat, fromLng, toLat, toLng),
      userBehavior: await this.getUserBehaviorMultiplier(userId)
    };

    const dynamicMultiplier = this.calculateMultiplier(factors);
    const finalPrice = baseFare * dynamicMultiplier;

    return {
      baseFare,
      dynamicMultiplier,
      finalPrice: Math.round(finalPrice * 100) / 100,
      factors,
      explanation: this.generateExplanation(factors)
    };
  }

  private calculateBaseFare(fromLat: number, fromLng: number, toLat: number, toLng: number, vehicleType: string): number {
    const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
    const baseRates = { standard: 2.5, premium: 4.0, luxury: 6.0 };
    return 10 + (distance * (baseRates[vehicleType] || 2.5));
  }

  private async predictDemand(lat: number, lng: number): Promise<number> {
    // AI demand prediction based on historical data
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Mock AI prediction (in production, use ML model)
    if (hour >= 7 && hour <= 9) return 1.4; // Morning rush
    if (hour >= 17 && hour <= 19) return 1.6; // Evening rush
    if (dayOfWeek === 5 || dayOfWeek === 6) return 1.2; // Weekend
    return 1.0;
  }

  private async getWeatherImpact(lat: number, lng: number): Promise<number> {
    // Weather-based pricing (rain = higher demand)
    try {
      // Mock weather API call
      const weather = { condition: 'clear', temperature: 25 };
      if (weather.condition === 'rain') return 1.3;
      if (weather.condition === 'storm') return 1.5;
      if (weather.temperature > 40) return 1.2; // Hot weather
      return 1.0;
    } catch {
      return 1.0;
    }
  }

  private async getEventPricing(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<number> {
    // Event-driven surge pricing
    const events = [
      { lat: 25.2048, lng: 55.2708, name: 'Dubai Mall', multiplier: 1.3 },
      { lat: 24.4539, lng: 54.3773, name: 'Abu Dhabi Airport', multiplier: 1.4 }
    ];

    for (const event of events) {
      const distanceFrom = this.calculateDistance(fromLat, fromLng, event.lat, event.lng);
      const distanceTo = this.calculateDistance(toLat, toLng, event.lat, event.lng);
      if (distanceFrom < 2 || distanceTo < 2) return event.multiplier;
    }
    return 1.0;
  }

  private calculateCarbonOffset(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
    const distance = this.calculateDistance(fromLat, fromLng, toLat, toLng);
    const co2Saved = distance * 0.2; // kg CO2 saved vs private car
    return Math.max(0.95, 1.0 - (co2Saved * 0.01)); // Small discount for green rides
  }

  private async getLoyaltyDiscount(userId: string): Promise<number> {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('loyalty_tier, total_trips')
        .eq('id', userId)
        .single();

      if (!data) return 1.0;

      const discounts = {
        bronze: 0.98,   // 2% discount
        silver: 0.95,   // 5% discount
        gold: 0.92,     // 8% discount
        platinum: 0.90  // 10% discount
      };

      return discounts[data.loyalty_tier] || 1.0;
    } catch {
      return 1.0;
    }
  }

  private getTimeOfDayMultiplier(): number {
    const hour = new Date().getHours();
    if (hour >= 2 && hour <= 5) return 0.8;  // Late night discount
    if (hour >= 7 && hour <= 9) return 1.3;  // Morning rush
    if (hour >= 17 && hour <= 19) return 1.4; // Evening rush
    return 1.0;
  }

  private async getTrafficDensity(fromLat: number, fromLng: number, toLat: number, toLng: number): Promise<number> {
    // Mock traffic API (use Google Maps Traffic API in production)
    const hour = new Date().getHours();
    if (hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19) return 1.2;
    return 1.0;
  }

  private async getUserBehaviorMultiplier(userId: string): Promise<number> {
    try {
      const { data } = await supabase
        .from('trips')
        .select('status')
        .eq('passenger_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!data) return 1.0;

      const cancelRate = data.filter(t => t.status === 'cancelled').length / data.length;
      if (cancelRate > 0.3) return 1.1; // Higher price for frequent cancellers
      if (cancelRate < 0.1) return 0.98; // Discount for reliable users
      return 1.0;
    } catch {
      return 1.0;
    }
  }

  private calculateMultiplier(factors: SmartPricingFactors): number {
    return factors.demandPrediction * 
           factors.weatherImpact * 
           factors.eventPricing * 
           factors.carbonOffset * 
           factors.loyaltyDiscount * 
           factors.timeOfDay * 
           factors.trafficDensity * 
           factors.userBehavior;
  }

  private generateExplanation(factors: SmartPricingFactors): string {
    const explanations = [];
    
    if (factors.demandPrediction > 1.2) explanations.push('High demand in area');
    if (factors.weatherImpact > 1.1) explanations.push('Weather conditions');
    if (factors.eventPricing > 1.1) explanations.push('Special event nearby');
    if (factors.loyaltyDiscount < 1.0) explanations.push('Loyalty discount applied');
    if (factors.carbonOffset < 1.0) explanations.push('Green ride discount');
    
    return explanations.join(', ') || 'Standard pricing';
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

export const smartPricingService = new SmartPricingService();