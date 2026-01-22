/**
 * Unified Service Factory - Service-Agnostic Architecture
 * All Wasel services follow the same 7-stage flow:
 * 1. Discover → 2. Request → 3. Pricing → 4. Assignment → 5. Confirmation → 6. Execution → 7. Completion
 */

import { supabase } from '../utils/supabase/client';

export type ServiceType =
  | 'carpool'
  | 'scooter'
  | 'package'
  | 'school'
  | 'laundry'
  | 'medical'
  | 'pet'
  | 'luxury'
  | 'freight'
  | 'car-rental'
  | 'shuttle'
  | 'hospitality';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface ServiceRequest {
  type: ServiceType;
  from?: Location;
  to?: Location;
  date?: string;
  time?: string;
  details: Record<string, any>;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.access_token;
}

async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

/**
 * Unified Service Factory
 * Provides consistent API for all Wasel services
 */
export class ServiceFactory {

  // ==================== STAGE 1: DISCOVER ====================
  /**
   * Discover available service providers/options
   */
  static async discover(type: ServiceType, filters: any = {}): Promise<ServiceResponse> {
    try {
      const token = await getAuthToken();

      switch (type) {
        case 'scooter':
          return await this.discoverScooters(filters);
        case 'carpool':
          return await this.discoverTrips(filters);
        case 'package':
          return await this.discoverCaptains(filters);
        case 'school':
          return await this.discoverSchoolRoutes(filters);
        default:
          return await this.discoverTrips(filters);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private static async discoverScooters(filters: any) {
    const { data, error } = await supabase.rpc('get_nearby_scooters', {
      user_lat: filters.lat || 25.2048,
      user_lng: filters.lng || 55.2708,
      radius_km: filters.radius || 2
    });

    if (error) {
      console.warn('RPC get_nearby_scooters failed, falling back to basic query:', error);
      // Fallback to basic query if RPC is not available
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('scooters')
        .select('*')
        .eq('status', 'available')
        .gte('battery', filters.minBattery || 20);

      if (fallbackError) throw fallbackError;
      return { success: true, data: fallbackData };
    }

    return { success: true, data };
  }

  private static async discoverTrips(filters: any) {
    let query = supabase
      .from('trips')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number, rating)
      `)
      .eq('status', 'active')
      .gte('available_seats', filters.seats || 1);

    if (filters.from) {
      query = query.ilike('from_location', `%${filters.from}%`);
    }
    if (filters.to) {
      query = query.ilike('to_location', `%${filters.to}%`);
    }
    if (filters.date) {
      query = query.eq('departure_date', filters.date);
    }
    if (filters.isFemaleOnly !== undefined) {
      query = query.eq('is_female_only', filters.isFemaleOnly);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  }

  private static async discoverCaptains(filters: any) {
    // Find captains traveling the same route
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        driver:driver_id(id, full_name, phone_number, rating)
      `)
      .eq('status', 'active')
      .ilike('from_location', `%${filters.from}%`)
      .ilike('to_location', `%${filters.to}%`);

    if (error) throw error;
    return { success: true, data };
  }

  private static async discoverSchoolRoutes(filters: any) {
    const { data, error } = await supabase
      .from('school_routes')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return { success: true, data };
  }

  // ==================== STAGE 2: REQUEST ====================
  /**
   * Create a service request
   */
  static async request(serviceRequest: ServiceRequest): Promise<ServiceResponse> {
    try {
      const userId = await getUserId();

      switch (serviceRequest.type) {
        case 'scooter':
          return await this.requestScooter(userId, serviceRequest.details);
        case 'carpool':
          return await this.requestTrip(userId, serviceRequest);
        case 'package':
          return await this.requestPackageDelivery(userId, serviceRequest);
        case 'school':
          return await this.requestSchoolTransport(userId, serviceRequest);
        default:
          return await this.requestTrip(userId, serviceRequest);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private static async requestScooter(userId: string, details: any) {
    const { data: rental, error } = await supabase
      .from('scooter_rentals')
      .insert({
        user_id: userId,
        scooter_id: details.scooterId,
        start_time: new Date().toISOString(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: rental };
  }

  private static async requestTrip(userId: string, request: ServiceRequest) {
    const { data: trip, error } = await supabase
      .from('trips')
      .insert({
        driver_id: userId,
        from_location: request.from?.address || '',
        to_location: request.to?.address || '',
        departure_date: request.date,
        departure_time: request.time,
        ...request.details
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: trip };
  }

  private static async requestPackageDelivery(userId: string, request: ServiceRequest) {
    const { data: delivery, error } = await supabase
      .from('package_deliveries')
      .insert({
        sender_id: userId,
        from_location: `POINT(${request.from?.lng} ${request.from?.lat})`,
        to_location: `POINT(${request.to?.lng} ${request.to?.lat})`,
        ...request.details,
        tracking_code: this.generateTrackingCode(),
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: delivery };
  }

  private static async requestSchoolTransport(userId: string, request: ServiceRequest) {
    const { data: route, error } = await supabase
      .from('school_routes')
      .insert({
        created_by: userId,
        ...request.details,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: route };
  }

  // ==================== STAGE 3: PRICING ====================
  /**
   * Calculate service pricing
   */
  static async calculatePrice(type: ServiceType, details: any): Promise<ServiceResponse> {
    try {
      switch (type) {
        case 'scooter':
          return this.calculateScooterPrice(details);
        case 'package':
          return this.calculatePackagePrice(details);
        case 'carpool':
          return this.calculateTripPrice(details);
        case 'school':
          return this.calculateSchoolTransportPrice(details);
        default:
          return this.calculateTripPrice(details);
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private static calculateScooterPrice(details: any) {
    const durationMinutes = details.durationMinutes || 30;
    const pricePerMin = details.pricePerMin || 1.0;
    const basePrice = 5; // Unlock fee
    const total = basePrice + (durationMinutes * pricePerMin);

    return {
      success: true,
      data: {
        basePrice,
        perMinutePrice: pricePerMin,
        estimatedDuration: durationMinutes,
        totalPrice: parseFloat(total.toFixed(2))
      }
    };
  }

  private static calculatePackagePrice(details: any) {
    const { packageSize, distanceKm } = details;

    const sizePricing: Record<string, number> = {
      small: 15,
      medium: 35,
      large: 60
    };

    const basePrice = sizePricing[packageSize] || 35;
    const distancePrice = (distanceKm || 10) * 2; // AED 2 per km
    const total = basePrice + distancePrice;

    return {
      success: true,
      data: {
        basePrice,
        distancePrice,
        totalPrice: parseFloat(total.toFixed(2)),
        breakdown: {
          packageSize: sizePricing[packageSize],
          distance: distancePrice
        }
      }
    };
  }

  private static calculateTripPrice(details: any) {
    const { distanceKm, seats } = details;
    const pricePerKm = 2;
    const basePrice = 10;
    const total = basePrice + (distanceKm * pricePerKm);
    const pricePerSeat = total / (seats || 1);

    return {
      success: true,
      data: {
        totalPrice: parseFloat(total.toFixed(2)),
        pricePerSeat: parseFloat(pricePerSeat.toFixed(2)),
        distanceKm,
        seats: seats || 1
      }
    };
  }

  private static calculateSchoolTransportPrice(details: any) {
    const { students, days } = details;
    const pricePerStudentPerDay = 25;
    const monthlyTotal = students * days.length * pricePerStudentPerDay * 4; // 4 weeks

    return {
      success: true,
      data: {
        perStudentPerDay: pricePerStudentPerDay,
        monthlyTotal,
        students,
        activeDays: days.length
      }
    };
  }

  // ==================== STAGE 4: ASSIGNMENT ====================
  /**
   * Match service request with provider
   */
  static async assign(type: ServiceType, requestId: string, providerId?: string): Promise<ServiceResponse> {
    try {
      switch (type) {
        case 'scooter':
          return await this.assignScooter(requestId);
        case 'package':
          return await this.assignCaptain(requestId, providerId);
        case 'carpool':
          return await this.assignDriver(requestId, providerId);
        default:
          return { success: true, data: { assigned: true } };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private static async assignScooter(rentalId: string) {
    const { data, error } = await supabase
      .from('scooter_rentals')
      .update({ status: 'assigned' })
      .eq('id', rentalId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  private static async assignCaptain(deliveryId: string, captainId?: string) {
    const { data, error } = await supabase
      .from('package_deliveries')
      .update({
        captain_id: captainId,
        status: 'assigned'
      })
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  private static async assignDriver(bookingId: string, driverId?: string) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  }

  // ==================== STAGE 5: CONFIRMATION ====================
  static async confirm(type: ServiceType, id: string, paymentDetails?: any): Promise<ServiceResponse> {
    try {
      const tableName = this.getTableName(type);
      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
          payment_status: 'completed'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== STAGE 6: EXECUTION ====================
  static async start(type: ServiceType, id: string): Promise<ServiceResponse> {
    try {
      const tableName = this.getTableName(type);
      const timeColumn = type === 'scooter' ? 'start_time' : 'started_at';

      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: 'active',
          [timeColumn]: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== STAGE 7: COMPLETION ====================
  static async complete(type: ServiceType, id: string, completionDetails?: any): Promise<ServiceResponse> {
    try {
      const tableName = this.getTableName(type);
      const timeColumn = type === 'scooter' ? 'end_time' : 'completed_at';

      const { data, error } = await supabase
        .from(tableName)
        .update({
          status: 'completed',
          [timeColumn]: new Date().toISOString(),
          ...completionDetails
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ==================== HELPER METHODS ====================
  private static getTableName(type: ServiceType): string {
    const tableMap: Record<ServiceType, string> = {
      'carpool': 'trips',
      'scooter': 'scooter_rentals',
      'package': 'package_deliveries',
      'school': 'school_routes',
      'laundry': 'laundry_orders',
      'medical': 'trips',
      'pet': 'trips',
      'luxury': 'trips',
      'freight': 'trips',
      'car-rental': 'car_rentals',
      'shuttle': 'trips',
      'hospitality': 'trips'
    };
    return tableMap[type] || 'trips';
  }

  private static generateTrackingCode(): string {
    return 'WAS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 7).toUpperCase();
  }

  // ==================== USER HISTORY ====================
  static async getUserServices(userId: string, type?: ServiceType): Promise<ServiceResponse> {
    try {
      if (!type) {
        // Get all services for user
        const [trips, scooters, packages, schools] = await Promise.all([
          supabase.from('trips').select('*').or(`driver_id.eq.${userId},passenger_id.eq.${userId}`),
          supabase.from('scooter_rentals').select('*').eq('user_id', userId),
          supabase.from('package_deliveries').select('*').eq('sender_id', userId),
          supabase.from('school_routes').select('*').eq('created_by', userId)
        ]);

        return {
          success: true,
          data: {
            trips: trips.data || [],
            scooters: scooters.data || [],
            packages: packages.data || [],
            schools: schools.data || []
          }
        };
      } else {
        const tableName = this.getTableName(type);
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .or(`created_by.eq.${userId},user_id.eq.${userId},sender_id.eq.${userId},driver_id.eq.${userId}`);

        if (error) throw error;
        return { success: true, data };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export default ServiceFactory;
