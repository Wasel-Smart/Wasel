/**
 * Google Maps Integration Service
 * Handles geocoding, routing, distance calculations, and places
 */

import axios from 'axios';

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteResult {
  success: boolean;
  distance?: number; // in kilometers
  duration?: number; // in minutes
  polyline?: string;
  steps?: Array<{
    instruction: string;
    distance: number;
    duration: number;
  }>;
  error?: string;
}

interface GeocodeResult {
  success: boolean;
  location?: Coordinates;
  formattedAddress?: string;
  error?: string;
}

interface PlacesResult {
  success: boolean;
  places?: Array<{
    placeId: string;
    name: string;
    address: string;
    location: Coordinates;
    rating?: number;
    types?: string[];
  }>;
  error?: string;
}

export class GoogleMapsService {
  private static apiKey: string;
  private static baseUrl = 'https://maps.googleapis.com/maps/api';

  private static initialize() {
    if (!this.apiKey) {
      this.apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
      if (!this.apiKey) {
        throw new Error('Google Maps API key not configured');
      }
    }
  }

  /**
   * Get route between two points
   */
  static async getRoute(
    origin: Coordinates | string,
    destination: Coordinates | string,
    waypoints?: Array<Coordinates | string>,
    optimize: boolean = false
  ): Promise<RouteResult> {
    try {
      this.initialize();

      const originStr = this.formatLocation(origin);
      const destinationStr = this.formatLocation(destination);
      
      let waypointsStr = '';
      if (waypoints && waypoints.length > 0) {
        const optimizePrefix = optimize ? 'optimize:true|' : '';
        waypointsStr = `&waypoints=${optimizePrefix}${waypoints.map(this.formatLocation).join('|')}`;
      }

      const url = `${this.baseUrl}/directions/json?` +
        `origin=${encodeURIComponent(originStr)}` +
        `&destination=${encodeURIComponent(destinationStr)}` +
        `${waypointsStr}` +
        `&key=${this.apiKey}` +
        `&alternatives=true` +
        `&mode=driving`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Directions API error: ${response.data.status}`
        };
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];

      // Parse steps
      const steps = leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        distance: Math.round(step.distance.value / 1000 * 100) / 100,
        duration: Math.round(step.duration.value / 60)
      }));

      return {
        success: true,
        distance: Math.round(leg.distance.value / 1000 * 100) / 100,
        duration: Math.round(leg.duration.value / 60),
        polyline: route.overview_polyline.points,
        steps
      };
    } catch (error: any) {
      console.error('Get route error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get route'
      };
    }
  }

  /**
   * Get multiple route alternatives
   */
  static async getRouteAlternatives(
    origin: Coordinates | string,
    destination: Coordinates | string
  ): Promise<{ success: boolean; routes?: RouteResult[]; error?: string }> {
    try {
      this.initialize();

      const originStr = this.formatLocation(origin);
      const destinationStr = this.formatLocation(destination);

      const url = `${this.baseUrl}/directions/json?` +
        `origin=${encodeURIComponent(originStr)}` +
        `&destination=${encodeURIComponent(destinationStr)}` +
        `&key=${this.apiKey}` +
        `&alternatives=true` +
        `&mode=driving`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Directions API error: ${response.data.status}`
        };
      }

      const routes = response.data.routes.map((route: any) => {
        const leg = route.legs[0];
        return {
          success: true,
          distance: Math.round(leg.distance.value / 1000 * 100) / 100,
          duration: Math.round(leg.duration.value / 60),
          polyline: route.overview_polyline.points
        };
      });

      return { success: true, routes };
    } catch (error: any) {
      console.error('Get route alternatives error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Geocode address to coordinates
   */
  static async geocodeAddress(address: string): Promise<GeocodeResult> {
    try {
      this.initialize();

      const url = `${this.baseUrl}/geocode/json?` +
        `address=${encodeURIComponent(address)}` +
        `&key=${this.apiKey}`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Geocoding error: ${response.data.status}`
        };
      }

      const result = response.data.results[0];

      return {
        success: true,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formattedAddress: result.formatted_address
      };
    } catch (error: any) {
      console.error('Geocode address error:', error);
      return {
        success: false,
        error: error.message || 'Failed to geocode address'
      };
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(location: Coordinates): Promise<GeocodeResult> {
    try {
      this.initialize();

      const url = `${this.baseUrl}/geocode/json?` +
        `latlng=${location.lat},${location.lng}` +
        `&key=${this.apiKey}`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Reverse geocoding error: ${response.data.status}`
        };
      }

      const result = response.data.results[0];

      return {
        success: true,
        location,
        formattedAddress: result.formatted_address
      };
    } catch (error: any) {
      console.error('Reverse geocode error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reverse geocode'
      };
    }
  }

  /**
   * Search for places nearby
   */
  static async searchPlaces(
    query: string,
    location?: Coordinates,
    radius: number = 5000
  ): Promise<PlacesResult> {
    try {
      this.initialize();

      let url = `${this.baseUrl}/place/textsearch/json?` +
        `query=${encodeURIComponent(query)}` +
        `&key=${this.apiKey}`;

      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`;
      }

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        return {
          success: false,
          error: `Places API error: ${response.data.status}`
        };
      }

      const places = response.data.results.map((place: any) => ({
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating,
        types: place.types
      }));

      return { success: true, places };
    } catch (error: any) {
      console.error('Search places error:', error);
      return {
        success: false,
        error: error.message || 'Failed to search places'
      };
    }
  }

  /**
   * Get place details by place ID
   */
  static async getPlaceDetails(placeId: string): Promise<PlacesResult> {
    try {
      this.initialize();

      const url = `${this.baseUrl}/place/details/json?` +
        `place_id=${placeId}` +
        `&key=${this.apiKey}` +
        `&fields=name,formatted_address,geometry,rating,opening_hours,formatted_phone_number,website`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Place Details error: ${response.data.status}`
        };
      }

      const place = response.data.result;

      return {
        success: true,
        places: [{
          placeId,
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          rating: place.rating
        }]
      };
    } catch (error: any) {
      console.error('Get place details error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get place details'
      };
    }
  }

  /**
   * Calculate distance matrix between multiple points
   */
  static async calculateDistanceMatrix(
    origins: Array<Coordinates | string>,
    destinations: Array<Coordinates | string>
  ): Promise<{
    success: boolean;
    matrix?: number[][];
    error?: string;
  }> {
    try {
      this.initialize();

      const originsStr = origins.map(this.formatLocation).join('|');
      const destinationsStr = destinations.map(this.formatLocation).join('|');

      const url = `${this.baseUrl}/distancematrix/json?` +
        `origins=${encodeURIComponent(originsStr)}` +
        `&destinations=${encodeURIComponent(destinationsStr)}` +
        `&key=${this.apiKey}`;

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK') {
        return {
          success: false,
          error: `Distance Matrix error: ${response.data.status}`
        };
      }

      const matrix = response.data.rows.map((row: any) =>
        row.elements.map((element: any) =>
          element.status === 'OK'
            ? Math.round(element.distance.value / 1000 * 100) / 100
            : -1
        )
      );

      return { success: true, matrix };
    } catch (error: any) {
      console.error('Calculate distance matrix error:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate distance matrix'
      };
    }
  }

  /**
   * Autocomplete place search
   */
  static async autocomplete(
    input: string,
    location?: Coordinates,
    radius: number = 50000
  ): Promise<PlacesResult> {
    try {
      this.initialize();

      let url = `${this.baseUrl}/place/autocomplete/json?` +
        `input=${encodeURIComponent(input)}` +
        `&key=${this.apiKey}`;

      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=${radius}`;
      }

      const response = await axios.get(url, { timeout: 10000 });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        return {
          success: false,
          error: `Autocomplete error: ${response.data.status}`
        };
      }

      const places = response.data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        name: prediction.structured_formatting.main_text,
        address: prediction.description,
        location: { lat: 0, lng: 0 } // Will need to geocode for exact coords
      }));

      return { success: true, places };
    } catch (error: any) {
      console.error('Autocomplete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to autocomplete'
      };
    }
  }

  /**
   * Calculate ETA (Estimated Time of Arrival)
   */
  static async calculateETA(
    origin: Coordinates,
    destination: Coordinates,
    departureTime?: Date
  ): Promise<{
    success: boolean;
    eta?: Date;
    duration?: number;
    error?: string;
  }> {
    try {
      const route = await this.getRoute(origin, destination);

      if (!route.success || !route.duration) {
        return { success: false, error: route.error };
      }

      const now = departureTime || new Date();
      const eta = new Date(now.getTime() + route.duration * 60 * 1000);

      return {
        success: true,
        eta,
        duration: route.duration
      };
    } catch (error: any) {
      console.error('Calculate ETA error:', error);
      return {
        success: false,
        error: error.message || 'Failed to calculate ETA'
      };
    }
  }

  /**
   * Helper: Format location for API
   */
  private static formatLocation(location: Coordinates | string): string {
    if (typeof location === 'string') {
      return location;
    }
    return `${location.lat},${location.lng}`;
  }

  /**
   * Validate coordinates
   */
  static validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  static calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLng = this.toRad(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
