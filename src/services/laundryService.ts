/**
 * Laundry Service API
 * Connects customers with laundry partners and captains for pickup/delivery
 */

import { supabase } from '../utils/supabase/client';
import ServiceFactory from './serviceFactory';

export type LaundryServiceType = 'wasel' | 'raje3'; // wasel = one-way, raje3 = round-trip

export interface LaundryOrder {
  id: string;
  customer_id: string;
  captain_id?: string;
  laundry_partner_id: string;
  service_type: LaundryServiceType;
  pickup_location: string;
  delivery_location?: string; // Optional for wasel (one-way)
  load_details: {
    weight_kg: number;
    items: string[];
    special_instructions?: string;
  };
  preferred_pickup_time: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'at_laundry' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  tracking_code: string;
  total_price?: number;
  created_at: string;
  updated_at: string;
}

export interface LaundryPartner {
  id: string;
  name: string;
  location: string;
  rating: number;
  services_offered: string[];
  pricing_per_kg: number;
  is_available: boolean;
  status: 'active' | 'inactive';
}

class LaundryService {
  /**
   * Calculate laundry service price
   */
  async calculatePrice(
    loadWeight: number,
    serviceType: LaundryServiceType,
    laundryPartnerId: string
  ): Promise<{ basePrice: number; weightPrice: number; captainFee: number; partnerFee: number; waselCommission: number; totalPrice: number }> {
    const response = await ServiceFactory.calculatePrice('laundry', {
      loadWeight,
      serviceType,
      laundryPartnerId
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to calculate price');
    }

    return response.data;
  }

  /**
   * Create a new laundry order
   */
  async createOrder(
    customerId: string,
    serviceType: LaundryServiceType,
    pickupLocation: string,
    deliveryLocation: string | undefined,
    laundryPartnerId: string,
    loadDetails: LaundryOrder['load_details'],
    preferredPickupTime: string
  ): Promise<LaundryOrder> {
    const request = {
      type: 'laundry' as const,
      from: { lat: 0, lng: 0, address: pickupLocation }, // Placeholder coordinates
      to: deliveryLocation ? { lat: 0, lng: 0, address: deliveryLocation } : undefined,
      details: {
        serviceType,
        laundryPartnerId,
        loadDetails,
        preferredPickupTime
      }
    };

    const response = await ServiceFactory.request(request);
    if (!response.success) {
      throw new Error(response.error || 'Failed to create laundry order');
    }

    return response.data;
  }

  /**
   * Get laundry order by ID
   */
  async getOrder(orderId: string): Promise<LaundryOrder | null> {
    const { data, error } = await supabase
      .from('laundry_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching laundry order:', error);
      return null;
    }

    return data;
  }

  /**
   * Get orders for a customer
   */
  async getCustomerOrders(customerId: string): Promise<LaundryOrder[]> {
    const { data, error } = await supabase
      .from('laundry_orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer orders:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: LaundryOrder['status']): Promise<boolean> {
    const { error } = await supabase
      .from('laundry_orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  }

  /**
   * Get available laundry partners
   */
  async getAvailablePartners(): Promise<LaundryPartner[]> {
    const response = await ServiceFactory.discover('laundry');
    if (!response.success) {
      console.error('Error discovering laundry partners:', response.error);
      return [];
    }

    return response.data || [];
  }

  /**
   * Assign captain to order
   */
  async assignCaptain(orderId: string, captainId: string): Promise<boolean> {
    const response = await ServiceFactory.assign('laundry', orderId, captainId);
    return response.success;
  }

  /**
   * Get order tracking information
   */
  async getTrackingInfo(orderId: string): Promise<any> {
    const order = await this.getOrder(orderId);
    if (!order) return null;

    // Get captain location if assigned
    let captainLocation = null;
    if (order.captain_id) {
      const { data: location } = await supabase
        .from('live_locations')
        .select('coordinates, heading, speed')
        .eq('user_id', order.captain_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      captainLocation = location;
    }

    return {
      order,
      captainLocation,
      statusHistory: [] // Could be implemented with a separate table
    };
  }
}

export default new LaundryService();