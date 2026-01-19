import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/api';

export interface LocationUpdate {
  id: string;
  trip_id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

/**
 * Real-time live tracking hook
 * Streams driver/passenger location updates in real-time
 */
export function useRealtimeLiveTracking(tripId: string) {
  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [locations, setLocations] = useState<LocationUpdate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Subscribe to live location updates
  useEffect(() => {
    if (!tripId) return;

    const channel = supabase
      .channel(`trip-tracking:${tripId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trip_locations',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const newLocation = payload.new as LocationUpdate;
          setLocation(newLocation);
          setLocations((prev) => [...prev, newLocation]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trip_locations',
          filter: `trip_id=eq.${tripId}`,
        },
        (payload) => {
          const updatedLocation = payload.new as LocationUpdate;
          setLocation(updatedLocation);
          setLocations((prev) =>
            prev.map((l) =>
              l.id === updatedLocation.id ? updatedLocation : l
            )
          );
        }
      )
      .subscribe((status) => {
        console.log(`Live tracking subscription: ${status}`);
        setIsTracking(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [tripId]);

  const updateLocation = useCallback(
    async (latitude: number, longitude: number, accuracy?: number) => {
      try {
        const { error: insertError } = await supabase
          .from('trip_locations')
          .insert({
            trip_id: tripId,
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } catch (err) {
        console.error('Error updating location:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [tripId]
  );

  const startTracking = useCallback(
    async (userId: string) => {
      if (!tripId) return;

      try {
        // Get current location
        if ('geolocation' in navigator) {
          navigator.geolocation.watchPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              updateLocation(latitude, longitude, accuracy);
            },
            (err) => {
              console.error('Geolocation error:', err);
              setError(err as Error);
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 5000,
            }
          );
        }
      } catch (err) {
        console.error('Error starting tracking:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    },
    [tripId, updateLocation]
  );

  const stopTracking = useCallback(() => {
    // Stop geolocation watch
    setIsTracking(false);
  }, []);

  return {
    location,
    locations,
    isTracking,
    error,
    updateLocation,
    startTracking,
    stopTracking,
  };
}
