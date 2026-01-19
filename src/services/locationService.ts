/**
 * Location Service
 * Handles geocoding, reverse geocoding, route calculation, and location-based features
 */

import { mapsService } from './integrations';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  placeId?: string;
}

export interface Route {
  distance: number; // in meters
  duration: number; // in seconds
  polyline: string;
  steps: RouteStep[];
  bounds: {
    northeast: Location;
    southwest: Location;
  };
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  startLocation: Location;
  endLocation: Location;
}

export interface PlaceSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface NearbyPlace {
  placeId: string;
  name: string;
  location: Location;
  rating?: number;
  priceLevel?: number;
  types: string[];
  distance: number; // in meters
}

class LocationService {
  private currentLocation: Location | null = null;
  private watchId: number | null = null;

  /**
   * Get current user location
   */
  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Get address for the location
          const address = await this.reverseGeocode(location.lat, location.lng);
          if (address) {
            location.address = address;
          }

          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          reject(new Error(`Location error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Watch user location changes
   */
  watchLocation(
    onLocationUpdate: (location: Location) => void,
    onError?: (error: GeolocationPositionError) => void
  ): () => void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Get address for the location
        const address = await this.reverseGeocode(location.lat, location.lng);
        if (address) {
          location.address = address;
        }

        this.currentLocation = location;
        onLocationUpdate(location);
      },
      onError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000, // 1 minute
      }
    );

    return () => this.stopWatchingLocation();
  }

  /**
   * Stop watching location
   */
  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Geocode an address to coordinates
   */
  async geocode(address: string): Promise<Location | null> {
    try {
      const result = await mapsService.geocodeAddress(address);
      if (result) {
        return {
          lat: result.coordinates.lat,
          lng: result.coordinates.lng,
          address: result.address,
          placeId: result.placeId,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding failed:', error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      return await mapsService.reverseGeocode(lat, lng);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  }

  /**
   * Calculate route between two points
   */
  async calculateRoute(
    origin: Location,
    destination: Location,
    waypoints?: Location[]
  ): Promise<Route | null> {
    try {
      const result = await mapsService.calculateRoute(origin, destination, waypoints);
      
      return {
        distance: result.distance,
        duration: result.duration,
        polyline: result.polyline,
        steps: result.steps.map(step => ({
          instruction: step.instruction,
          distance: step.distance,
          duration: step.duration,
          startLocation: origin, // Simplified
          endLocation: destination, // Simplified
        })),
        bounds: {
          northeast: { lat: Math.max(origin.lat, destination.lat), lng: Math.max(origin.lng, destination.lng) },
          southwest: { lat: Math.min(origin.lat, destination.lat), lng: Math.min(origin.lng, destination.lng) },
        },
      };
    } catch (error) {
      console.error('Route calculation failed:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (point1.lat * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Get place suggestions for autocomplete
   */
  async getPlaceSuggestions(
    input: string,
    location?: Location,
    radius?: number
  ): Promise<PlaceSuggestion[]> {
    // Mock implementation - in production, this would use Google Places API
    const mockSuggestions: PlaceSuggestion[] = [
      {
        placeId: 'place1',
        description: 'Dubai Marina, Dubai, UAE',
        mainText: 'Dubai Marina',
        secondaryText: 'Dubai, UAE',
        types: ['neighborhood', 'political'],
      },
      {
        placeId: 'place2',
        description: 'Downtown Dubai, Dubai, UAE',
        mainText: 'Downtown Dubai',
        secondaryText: 'Dubai, UAE',
        types: ['neighborhood', 'political'],
      },
      {
        placeId: 'place3',
        description: 'Dubai International Airport, Dubai, UAE',
        mainText: 'Dubai International Airport',
        secondaryText: 'Dubai, UAE',
        types: ['airport', 'establishment'],
      },
    ];

    return mockSuggestions.filter(suggestion =>
      suggestion.description.toLowerCase().includes(input.toLowerCase())
    );
  }

  /**
   * Get nearby places of interest
   */
  async getNearbyPlaces(
    location: Location,
    type: string = 'point_of_interest',
    radius: number = 1000
  ): Promise<NearbyPlace[]> {
    // Mock implementation - in production, this would use Google Places API
    const mockPlaces: NearbyPlace[] = [
      {
        placeId: 'nearby1',
        name: 'Dubai Mall',
        location: { lat: location.lat + 0.01, lng: location.lng + 0.01 },
        rating: 4.5,
        priceLevel: 3,
        types: ['shopping_mall', 'establishment'],
        distance: 500,
      },
      {
        placeId: 'nearby2',
        name: 'Burj Khalifa',
        location: { lat: location.lat + 0.005, lng: location.lng + 0.005 },
        rating: 4.8,
        types: ['tourist_attraction', 'establishment'],
        distance: 300,
      },
      {
        placeId: 'nearby3',
        name: 'Emirates Mall',
        location: { lat: location.lat - 0.01, lng: location.lng - 0.01 },
        rating: 4.3,
        priceLevel: 3,
        types: ['shopping_mall', 'establishment'],
        distance: 800,
      },
    ];

    return mockPlaces.filter(place => place.distance <= radius);
  }

  /**
   * Check if location is within a geofence
   */
  isWithinGeofence(
    location: Location,
    center: Location,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(location, center);
    return distance <= radiusMeters;
  }

  /**
   * Get popular destinations
   */
  getPopularDestinations(): Location[] {
    return [
      {
        lat: 25.0772,
        lng: 55.1398,
        address: 'Dubai Marina, Dubai, UAE',
      },
      {
        lat: 25.2048,
        lng: 55.2708,
        address: 'Downtown Dubai, Dubai, UAE',
      },
      {
        lat: 25.2532,
        lng: 55.3657,
        address: 'Dubai International Airport, Dubai, UAE',
      },
      {
        lat: 25.1972,
        lng: 55.2744,
        address: 'Dubai Mall, Dubai, UAE',
      },
      {
        lat: 25.1124,
        lng: 55.2003,
        address: 'Mall of the Emirates, Dubai, UAE',
      },
    ];
  }

  /**
   * Format location for display
   */
  formatLocationForDisplay(location: Location): string {
    if (location.address) {
      return location.address;
    }
    return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
  }

  /**
   * Get current location (cached)
   */
  getCachedLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Validate coordinates
   */
  isValidCoordinates(lat: number, lng: number): boolean {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !isNaN(lat) &&
      !isNaN(lng)
    );
  }

  /**
   * Convert address to location with fallback
   */
  async addressToLocation(address: string): Promise<Location> {
    const geocoded = await this.geocode(address);
    if (geocoded) {
      return geocoded;
    }

    // Fallback to popular destinations if geocoding fails
    const popular = this.getPopularDestinations();
    const match = popular.find(loc =>
      loc.address?.toLowerCase().includes(address.toLowerCase())
    );

    if (match) {
      return match;
    }

    // Final fallback to Dubai center
    return {
      lat: 25.2048,
      lng: 55.2708,
      address: address,
    };
  }

  /**
   * Get estimated travel time
   */
  getEstimatedTravelTime(
    distance: number,
    mode: 'driving' | 'walking' | 'cycling' = 'driving'
  ): number {
    const speeds = {
      driving: 50, // km/h
      walking: 5, // km/h
      cycling: 15, // km/h
    };

    const distanceKm = distance / 1000;
    const timeHours = distanceKm / speeds[mode];
    return Math.round(timeHours * 60); // minutes
  }
}

export const locationService = new LocationService();