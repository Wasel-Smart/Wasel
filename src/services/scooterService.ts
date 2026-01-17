/**
 * Scooter Service API
 * Handles scooter rentals with real-time location and battery tracking
 */

import { supabase } from '../utils/supabase/client';
import ServiceFactory from './serviceFactory';

export interface Scooter {
  id: string;
  code: string;
  battery: number;
  range: number;
  lat: number;
  lng: number;
  pricePerMin: number;
  status: 'available' | 'in-use' | 'low-battery' | 'maintenance';
}

export interface ScooterRental {
  id: string;
  scooter_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  start_location?: { lat: number; lng: number };
  end_location?: { lat: number; lng: number };
  duration_minutes?: number;
  total_cost?: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

class ScooterService {
  /**
   * Get nearby available scooters
   */
  async getNearbyScooters(lat: number, lng: number, radiusKm: number = 2): Promise<Scooter[]> {
    const response = await ServiceFactory.discover('scooter', {
      lat,
      lng,
      radius: radiusKm,
      minBattery: 20
    });

    if (!response.success || !response.data) {
      // Return mock data for now (until database is populated)
      return this.getMockScooters(lat, lng);
    }

    return response.data;
  }

  /**
   * Unlock a scooter and start rental
   */
  async unlockScooter(scooterId: string): Promise<ScooterRental> {
    // Stage 1: Create rental request
    const requestResponse = await ServiceFactory.request({
      type: 'scooter',
      details: { scooterId }
    });

    if (!requestResponse.success) {
      throw new Error(requestResponse.error || 'Failed to create rental');
    }

    const rental = requestResponse.data;

    // Stage 2: Assign scooter
    await ServiceFactory.assign('scooter', rental.id);

    // Stage 3: Start rental
    await ServiceFactory.start('scooter', rental.id);

    // Update scooter status
    await supabase
      .from('scooters')
      .update({ status: 'in-use' })
      .eq('id', scooterId);

    return rental;
  }

  /**
   * End scooter rental and calculate final cost
   */
  async endRide(rentalId: string, endLocation: { lat: number; lng: number }): Promise<{ rental: ScooterRental; cost: number }> {
    // Get rental details
    const { data: rental, error } = await supabase
      .from('scooter_rentals')
      .select('*, scooter:scooter_id(*)')
      .eq('id', rentalId)
      .single();

    if (error || !rental) {
      throw new Error('Rental not found');
    }

    // Calculate duration
    const startTime = new Date(rental.start_time).getTime();
    const endTime = Date.now();
    const durationMinutes = Math.ceil((endTime - startTime) / (1000 * 60));

    // Calculate cost
    const priceResponse = await ServiceFactory.calculatePrice('scooter', {
      durationMinutes,
      pricePerMin: rental.scooter.price_per_min
    });

    const cost = priceResponse.data?.totalPrice || 0;

    // Complete rental
    const completionResponse = await ServiceFactory.complete('scooter', rentalId, {
      end_time: new Date().toISOString(),
      end_location: `POINT(${endLocation.lng} ${endLocation.lat})`,
      duration_minutes: durationMinutes,
      total_cost: cost
    });

    // Update scooter status and location
    await supabase
      .from('scooters')
      .update({
        status: 'available',
        location: `POINT(${endLocation.lng} ${endLocation.lat})`
      })
      .eq('id', rental.scooter_id);

    return {
      rental: completionResponse.data,
      cost
    };
  }

  /**
   * Get user's rental history
   */
  async getUserRentals(userId: string): Promise<ScooterRental[]> {
    const { data, error } = await supabase
      .from('scooter_rentals')
      .select('*, scooter:scooter_id(*)')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active rental for user
   */
  async getActiveRental(userId: string): Promise<ScooterRental | null> {
    const { data, error } = await supabase
      .from('scooter_rentals')
      .select('*, scooter:scooter_id(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return data || null;
  }

  /**
   * Report scooter issue
   */
  async reportIssue(scooterId: string, issue: string): Promise<void> {
    await supabase
      .from('scooters')
      .update({
        status: 'maintenance',
        notes: issue
      })
      .eq('id', scooterId);
  }

  // Mock data for development
  private getMockScooters(centerLat: number, centerLng: number): Scooter[] {
    return [
      {
        id: '1',
        code: 'WAS-001',
        battery: 85,
        range: 25,
        lat: centerLat + 0.001,
        lng: centerLng + 0.001,
        pricePerMin: 1.0,
        status: 'available'
      },
      {
        id: '2',
        code: 'WAS-002',
        battery: 42,
        range: 12,
        lat: centerLat - 0.0008,
        lng: centerLng + 0.0007,
        pricePerMin: 1.0,
        status: 'available'
      },
      {
        id: '3',
        code: 'WAS-003',
        battery: 15,
        range: 4,
        lat: centerLat + 0.0007,
        lng: centerLng + 0.0012,
        pricePerMin: 1.0,
        status: 'low-battery'
      },
      {
        id: '4',
        code: 'WAS-004',
        battery: 92,
        range: 28,
        lat: centerLat - 0.0013,
        lng: centerLng - 0.0005,
        pricePerMin: 1.0,
        status: 'available'
      }
    ];
  }
}

export const scooterService = new ScooterService();
export default scooterService;
