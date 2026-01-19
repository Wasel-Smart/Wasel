/**
 * Missing TypeScript Definitions
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        [key: string]: any;
      };
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TripData {
  from_location: string;
  to_location: string;
  from_coordinates?: { lat: number; lng: number };
  to_coordinates?: { lat: number; lng: number };
  departure_date: string;
  departure_time: string;
  total_seats: number;
  available_seats?: number;
  fare: number;
  currency?: string;
  vehicle_type?: string;
  notes?: string;
}

export interface BookingData {
  trip_id: string;
  seats_requested: number;
  pickup_stop?: string;
  dropoff_stop?: string;
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface EmergencyAlert {
  trip_id: string;
  user_id: string;
  location: LocationCoordinates;
  reason?: string;
  status: 'active' | 'resolved' | 'false_alarm';
}

export interface NotificationData {
  user_id: string;
  title: string;
  message: string;
  type: 'push' | 'email' | 'sms' | 'in_app';
  data?: Record<string, any>;
}

export {};