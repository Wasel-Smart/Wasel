/**
 * Enhanced Trips Hook - Production Ready
 * Uses ServiceFactory for unified service access
 * NO MOCK DATA - Direct Supabase integration
 */

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import ServiceFactory from '../services/serviceFactory';

export interface Trip {
  id: string;
  driver_id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  departure_time: string;
  available_seats: number;
  total_seats: number;
  price_per_seat: number;
  status: string;
  trip_type?: string;
  vehicle?: any;
  preferences?: any;
  driver?: {
    id: string;
    full_name: string;
    phone_number: string;
    rating: number;
  };
}

export function useTrips(filters?: {
  status?: string[];
  driverId?: string;
  fromDate?: string;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, [JSON.stringify(filters)]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('trips')
        .select(`
          *,
          driver:driver_id(id, full_name, phone_number, rating)
        `);

      // Apply filters
      if (filters?.driverId) {
        query = query.eq('driver_id', filters.driverId);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.fromDate) {
        query = query.gte('departure_date', filters.fromDate);
      }

      // Execute query
      const { data, error: fetchError } = await query.order('departure_date', { ascending: true });

      if (fetchError) throw fetchError;

      setTrips(data || []);
    } catch (err: any) {
      console.error('Error fetching trips:', err);
      setError(err.message);
      setTrips([]); // Clear trips on error
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async (tripData: any) => {
    try {
      const response = await ServiceFactory.request({
        type: 'carpool',
        from: tripData.from_coords,
        to: tripData.to_coords,
        date: tripData.departure_date,
        time: tripData.departure_time,
        details: {
          from_location: tripData.from,
          to_location: tripData.to,
          total_seats: tripData.total_seats,
          available_seats: tripData.available_seats || tripData.total_seats,
          price_per_seat: tripData.price_per_seat,
          trip_type: tripData.trip_type || 'wasel',
          vehicle: tripData.vehicle,
          preferences: tripData.preferences,
          status: 'active'
        }
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to create trip');
      }

      await fetchTrips();
      return { data: response.data, error: null };
    } catch (err: any) {
      console.error('Error creating trip:', err);
      return { data: null, error: err.message };
    }
  };

  const updateTrip = async (tripId: string, updates: any) => {
    try {
      const { data, error: updateError } = await supabase
        .from('trips')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchTrips();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating trip:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (deleteError) throw deleteError;

      await fetchTrips();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting trip:', err);
      return { error: err.message };
    }
  };

  const publishTrip = async (tripId: string) => {
    return updateTrip(tripId, { status: 'active' });
  };

  return {
    trips,
    loading,
    error,
    refresh: fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    publishTrip,
  };
}

// Hook for searching trips
export function useSearchTrips(searchParams: {
  from?: string;
  to?: string;
  departureDate?: string;
  seats?: number;
}) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrips = async () => {
    try {
      console.log('🔍 DEBUG: useSearchTrips called with params:', searchParams);
      setLoading(true);
      setError(null);

      const response = await ServiceFactory.discover('carpool', {
        from: searchParams.from,
        to: searchParams.to,
        date: searchParams.departureDate,
        seats: searchParams.seats || 1
      });

      console.log('🔍 DEBUG: ServiceFactory.discover response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }

      console.log('🔍 DEBUG: Found trips:', response.data?.length || 0);
      setTrips(response.data || []);
    } catch (err: any) {
      console.error('❌ ERROR searching trips:', err);
      setError(err.message);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    trips,
    loading,
    error,
    searchTrips,
  };
}

// Hook for a single trip
export function useTrip(tripId: string | null) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    if (!tripId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('trips')
        .select(`
          *,
          driver:driver_id(id, full_name, phone_number, rating)
        `)
        .eq('id', tripId)
        .single();

      if (fetchError) throw fetchError;

      setTrip(data);
    } catch (err: any) {
      console.error('Error fetching trip:', err);
      setError(err.message);
      setTrip(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    trip,
    loading,
    error,
    refresh: fetchTrip,
  };
}
