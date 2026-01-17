/**
 * Enhanced Bookings Hook - Production Ready
 * Direct Supabase integration - NO MOCK DATA
 */

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../contexts/AuthContext';

export interface Booking {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  seats_requested: number;
  pickup_stop?: string;
  dropoff_stop?: string;
  total_price?: number;
  created_at: string;
  trip?: any;
  passenger?: any;
}

export function useBookings(filters?: {
  status?: string[];
  tripId?: string;
  passengerId?: string;
}) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, JSON.stringify(filters)]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('bookings')
        .select(`
          *,
          trip:trip_id(
            *,
            driver:driver_id(id, full_name, phone_number, rating)
          ),
          passenger:passenger_id(id, full_name, phone_number)
        `);

      // Apply filters
      if (filters?.tripId) {
        query = query.eq('trip_id', filters.tripId);
      } else if (filters?.passengerId) {
        query = query.eq('passenger_id', filters.passengerId);
      } else {
        // Default: get current user's bookings as passenger
        query = query.eq('passenger_id', user.id);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setBookings(data || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: {
    trip_id: string;
    seats_requested: number;
    pickup_stop?: string;
    dropoff_stop?: string;
  }) => {
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    try {
      // Get trip details for pricing
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('price_per_seat, available_seats')
        .eq('id', bookingData.trip_id)
        .single();

      if (tripError) throw tripError;

      // Check availability
      if (trip.available_seats < bookingData.seats_requested) {
        throw new Error('Not enough available seats');
      }

      // Create booking
      const { data, error: insertError } = await supabase
        .from('bookings')
        .insert({
          trip_id: bookingData.trip_id,
          passenger_id: user.id,
          seats_requested: bookingData.seats_requested,
          pickup_stop: bookingData.pickup_stop,
          dropoff_stop: bookingData.dropoff_stop,
          total_price: trip.price_per_seat * bookingData.seats_requested,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Update trip available seats
      await supabase
        .from('trips')
        .update({
          available_seats: trip.available_seats - bookingData.seats_requested
        })
        .eq('id', bookingData.trip_id);

      await fetchBookings();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error creating booking:', err);
      return { data: null, error: err.message };
    }
  };

  const updateBooking = async (bookingId: string, updates: { status?: string }) => {
    try {
      const { data, error: updateError } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (updateError) throw updateError;

      await fetchBookings();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating booking:', err);
      return { data: null, error: err.message };
    }
  };

  const acceptBooking = async (bookingId: string) => {
    return updateBooking(bookingId, { status: 'accepted' });
  };

  const rejectBooking = async (bookingId: string) => {
    return updateBooking(bookingId, { status: 'rejected' });
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      // Get booking details
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('trip_id, seats_requested')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Update booking status
      const result = await updateBooking(bookingId, { status: 'cancelled' });

      // Return seats to trip
      if (result.error === null) {
        const { data: trip } = await supabase
          .from('trips')
          .select('available_seats')
          .eq('id', booking.trip_id)
          .single();

        if (trip) {
          await supabase
            .from('trips')
            .update({
              available_seats: trip.available_seats + booking.seats_requested
            })
            .eq('id', booking.trip_id);
        }
      }

      return result;
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      return { data: null, error: err.message };
    }
  };

  return {
    bookings,
    loading,
    error,
    refresh: fetchBookings,
    createBooking,
    updateBooking,
    acceptBooking,
    rejectBooking,
    cancelBooking,
  };
}

// Hook for my trips (as passenger)
export function useMyBookings() {
  const { user } = useAuth();
  return useBookings({ passengerId: user?.id });
}
