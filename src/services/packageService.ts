/**
 * Package Delivery Service API
 * Connects senders with captains traveling the same route
 */

import { supabase } from '../utils/supabase/client';
import ServiceFactory from './serviceFactory';

export type PackageSize = 'small' | 'medium' | 'large';

export interface PackageDelivery {
  id: string;
  sender_id: string;
  captain_id?: string;
  package_size: PackageSize;
  weight_kg?: number;
  from_location: string;
  to_location: string;
  pickup_date?: string;
  delivery_date?: string;
  status: 'pending' | 'assigned' | 'picked-up' | 'in-transit' | 'delivered' | 'cancelled';
  total_price?: number;
  tracking_code: string;
  description?: string;
}

export interface AvailableCaptain {
  id: string;
  captain_id: string;
  captain_name: string;
  captain_rating: number;
  captain_phone: string;
  departure_time: string;
  estimated_price: number;
  trip_id: string;
  dropoff_type: 'door-to-door' | 'station-to-station';
}

class PackageService {
  /**
   * Calculate package delivery price
   */
  async calculatePrice(
    packageSize: PackageSize,
    fromLocation: string,
    toLocation: string,
    distanceKm: number
  ): Promise<{ basePrice: number; distancePrice: number; totalPrice: number }> {
    const response = await ServiceFactory.calculatePrice('package', {
      packageSize,
      distanceKm
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to calculate price');
    }

    return response.data;
  }

  /**
   * Find available captains traveling the route
   */
  async findAvailableCaptains(
    fromLocation: string,
    toLocation: string,
    packageSize: PackageSize,
    deliveryDate?: string
  ): Promise<AvailableCaptain[]> {
    const response = await ServiceFactory.discover('package', {
      from: fromLocation,
      to: toLocation,
      date: deliveryDate
    });

    if (!response.success || !response.data || response.data.length === 0) {
      // Return mock captains for demo
      return this.getMockCaptains(fromLocation, toLocation);
    }

    // Transform trips into available captains
    return response.data.map((trip: any) => ({
      id: trip.id,
      captain_id: trip.driver_id,
      captain_name: trip.driver?.full_name || 'Captain',
      captain_rating: trip.driver?.rating || 4.5,
      captain_phone: trip.driver?.phone_number || '',
      departure_time: trip.departure_time,
      estimated_price: this.estimatePrice(packageSize, trip),
      trip_id: trip.id,
      dropoff_type: 'door-to-door' as const
    }));
  }

  /**
   * Create package delivery request
   */
  async createDelivery(deliveryData: {
    fromLocation: string;
    fromLat: number;
    fromLng: number;
    toLocation: string;
    toLat: number;
    toLng: number;
    packageSize: PackageSize;
    weight?: number;
    description?: string;
    pickupDate?: string;
  }): Promise<PackageDelivery> {
    const response = await ServiceFactory.request({
      type: 'package',
      from: { lat: deliveryData.fromLat, lng: deliveryData.fromLng, address: deliveryData.fromLocation },
      to: { lat: deliveryData.toLat, lng: deliveryData.toLng, address: deliveryData.toLocation },
      date: deliveryData.pickupDate,
      details: {
        package_size: deliveryData.packageSize,
        weight_kg: deliveryData.weight,
        description: deliveryData.description
      }
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to create delivery');
    }

    return response.data;
  }

  /**
   * Assign captain to delivery
   */
  async assignCaptain(deliveryId: string, captainId: string, price: number): Promise<PackageDelivery> {
    // Update delivery with captain and price
    const { data, error } = await supabase
      .from('package_deliveries')
      .update({
        captain_id: captainId,
        total_price: price,
        status: 'assigned'
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Mark package as picked up
   */
  async pickupPackage(deliveryId: string): Promise<PackageDelivery> {
    const response = await ServiceFactory.start('package', deliveryId);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to update delivery');
    }

    // Add tracking entry
    await this.addTrackingUpdate(deliveryId, 'picked-up', 'Package picked up by captain');
    
    return response.data;
  }

  /**
   * Mark package as delivered
   */
  async deliverPackage(deliveryId: string, location: { lat: number; lng: number }): Promise<PackageDelivery> {
    const response = await ServiceFactory.complete('package', deliveryId, {
      delivery_date: new Date().toISOString()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to complete delivery');
    }

    // Add tracking entry
    await this.addTrackingUpdate(deliveryId, 'delivered', 'Package delivered successfully', location);

    return response.data;
  }

  /**
   * Get delivery by tracking code
   */
  async getDeliveryByTrackingCode(trackingCode: string): Promise<PackageDelivery | null> {
    const { data, error } = await supabase
      .from('package_deliveries')
      .select(`
        *,
        sender:sender_id(full_name, phone_number),
        captain:captain_id(full_name, phone_number, rating)
      `)
      .eq('tracking_code', trackingCode)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Get user's package deliveries
   */
  async getUserDeliveries(userId: string): Promise<PackageDelivery[]> {
    const { data, error } = await supabase
      .from('package_deliveries')
      .select(`
        *,
        captain:captain_id(full_name, phone_number, rating)
      `)
      .eq('sender_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get package tracking history
   */
  async getTrackingHistory(deliveryId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('package_tracking')
      .select('*')
      .eq('delivery_id', deliveryId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Add tracking update
   */
  private async addTrackingUpdate(
    deliveryId: string,
    status: string,
    notes: string,
    location?: { lat: number; lng: number }
  ): Promise<void> {
    await supabase
      .from('package_tracking')
      .insert({
        delivery_id: deliveryId,
        timestamp: new Date().toISOString(),
        status,
        notes,
        location: location ? `POINT(${location.lng} ${location.lat})` : null
      });
  }

  /**
   * Estimate price for package on a trip
   */
  private estimatePrice(packageSize: PackageSize, trip: any): number {
    const basePrices: Record<PackageSize, number> = {
      small: 15,
      medium: 35,
      large: 60
    };
    return basePrices[packageSize] || 35;
  }

  /**
   * Mock captains for demo
   */
  private getMockCaptains(from: string, to: string): AvailableCaptain[] {
    return [
      {
        id: '1',
        captain_id: 'captain-1',
        captain_name: 'Ahmed K.',
        captain_rating: 4.9,
        captain_phone: '+971501234567',
        departure_time: '14:00',
        estimated_price: 35,
        trip_id: 'trip-1',
        dropoff_type: 'door-to-door'
      },
      {
        id: '2',
        captain_id: 'captain-2',
        captain_name: 'Sarah M.',
        captain_rating: 4.8,
        captain_phone: '+971507654321',
        departure_time: '15:30',
        estimated_price: 25,
        trip_id: 'trip-2',
        dropoff_type: 'station-to-station'
      },
      {
        id: '3',
        captain_id: 'captain-3',
        captain_name: 'Faisal R.',
        captain_rating: 5.0,
        captain_phone: '+971509876543',
        departure_time: '16:45',
        estimated_price: 40,
        trip_id: 'trip-3',
        dropoff_type: 'door-to-door'
      }
    ];
  }
}

export const packageService = new PackageService();
export default packageService;
