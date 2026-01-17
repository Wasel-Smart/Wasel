/**
 * School Transport Service API
 * Manages safe student transportation with guardian verification
 */

import { supabase } from '../utils/supabase/client';
import ServiceFactory from './serviceFactory';

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
}

export interface Student {
  id?: string;
  route_id?: string;
  name: string;
  age: number;
  grade: string;
  guardians: Guardian[];
}

export interface SchoolRoute {
  id: string;
  created_by: string;
  pickup_location: string;
  school_location: string;
  pickup_time: string;
  return_time?: string;
  active_days: string[]; // ['Monday', 'Tuesday', ...]
  status: 'active' | 'paused' | 'cancelled';
  trip_type: 'one-way' | 'round-trip';
  monthly_price?: number;
}

export interface SchoolTrip {
  id: string;
  route_id: string;
  trip_date: string;
  assigned_driver_id?: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  students_checked_in: string[];
  students_checked_out: string[];
}

class SchoolTransportService {
  /**
   * Create school transport route
   */
  async createRoute(routeData: {
    pickupLocation: string;
    pickupLat: number;
    pickupLng: number;
    schoolLocation: string;
    schoolLat: number;
    schoolLng: number;
    pickupTime: string;
    returnTime?: string;
    activeDays: string[];
    students: Student[];
    tripType: 'one-way' | 'round-trip';
  }): Promise<{ route: SchoolRoute; students: Student[] }> {
    // Calculate monthly price
    const priceResponse = await ServiceFactory.calculatePrice('school', {
      students: routeData.students.length,
      days: routeData.activeDays
    });

    const monthlyPrice = priceResponse.data?.monthlyTotal || 0;

    // Create route
    const routeResponse = await ServiceFactory.request({
      type: 'school',
      from: {
        lat: routeData.pickupLat,
        lng: routeData.pickupLng,
        address: routeData.pickupLocation
      },
      to: {
        lat: routeData.schoolLat,
        lng: routeData.schoolLng,
        address: routeData.schoolLocation
      },
      time: routeData.pickupTime,
      details: {
        pickup_location: routeData.pickupLocation,
        school_location: routeData.schoolLocation,
        pickup_time: routeData.pickupTime,
        return_time: routeData.returnTime,
        active_days: routeData.activeDays,
        trip_type: routeData.tripType,
        monthly_price: monthlyPrice
      }
    });

    if (!routeResponse.success) {
      throw new Error(routeResponse.error || 'Failed to create school route');
    }

    const route = routeResponse.data;

    // Add students to route
    const studentsData = await Promise.all(
      routeData.students.map(student =>
        this.addStudent(route.id, student)
      )
    );

    // Create recurring trips for the month
    await this.createRecurringTrips(route);

    return { route, students: studentsData };
  }

  /**
   * Add student to route
   */
  async addStudent(routeId: string, student: Student): Promise<Student> {
    const { data, error } = await supabase
      .from('school_students')
      .insert({
        route_id: routeId,
        name: student.name,
        age: student.age,
        grade: student.grade,
        guardians: student.guardians
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Remove student from route
   */
  async removeStudent(studentId: string): Promise<void> {
    const { error } = await supabase
      .from('school_students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;
  }

  /**
   * Get route details with students
   */
  async getRoute(routeId: string): Promise<SchoolRoute & { students: Student[] }> {
    const { data: route, error: routeError } = await supabase
      .from('school_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (routeError) throw routeError;

    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('*')
      .eq('route_id', routeId);

    if (studentsError) throw studentsError;

    return { ...route, students: students || [] };
  }

  /**
   * Get user's school routes
   */
  async getUserRoutes(userId: string): Promise<SchoolRoute[]> {
    const { data, error } = await supabase
      .from('school_routes')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get upcoming trips for a route
   */
  async getUpcomingTrips(routeId: string, days: number = 7): Promise<SchoolTrip[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await supabase
      .from('school_trips')
      .select(`
        *,
        driver:assigned_driver_id(full_name, phone_number, rating)
      `)
      .eq('route_id', routeId)
      .gte('trip_date', new Date().toISOString().split('T')[0])
      .lte('trip_date', endDate.toISOString().split('T')[0])
      .order('trip_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Check in student to trip
   */
  async checkInStudent(tripId: string, studentId: string): Promise<SchoolTrip> {
    const { data: trip, error: fetchError } = await supabase
      .from('school_trips')
      .select('students_checked_in')
      .eq('id', tripId)
      .single();

    if (fetchError) throw fetchError;

    const checkedIn = trip.students_checked_in || [];
    if (!checkedIn.includes(studentId)) {
      checkedIn.push(studentId);
    }

    const { data, error } = await supabase
      .from('school_trips')
      .update({
        students_checked_in: checkedIn,
        status: 'active'
      })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Check out student from trip
   */
  async checkOutStudent(tripId: string, studentId: string): Promise<SchoolTrip> {
    const { data: trip, error: fetchError } = await supabase
      .from('school_trips')
      .select('students_checked_out')
      .eq('id', tripId)
      .single();

    if (fetchError) throw fetchError;

    const checkedOut = trip.students_checked_out || [];
    if (!checkedOut.includes(studentId)) {
      checkedOut.push(studentId);
    }

    const { data, error } = await supabase
      .from('school_trips')
      .update({ students_checked_out: checkedOut })
      .eq('id', tripId)
      .select()
      .single();

    if (error) throw error;

    // Check if all students are checked out
    const { data: students } = await supabase
      .from('school_students')
      .select('id')
      .eq('route_id', trip.route_id);

    if (students && checkedOut.length === students.length) {
      // Complete trip
      await ServiceFactory.complete('school', tripId);
    }

    return data;
  }

  /**
   * Pause route
   */
  async pauseRoute(routeId: string): Promise<void> {
    const { error } = await supabase
      .from('school_routes')
      .update({ status: 'paused' })
      .eq('id', routeId);

    if (error) throw error;

    // Cancel future trips
    await supabase
      .from('school_trips')
      .update({ status: 'cancelled' })
      .eq('route_id', routeId)
      .gt('trip_date', new Date().toISOString().split('T')[0])
      .eq('status', 'scheduled');
  }

  /**
   * Resume route
   */
  async resumeRoute(routeId: string): Promise<void> {
    const { error } = await supabase
      .from('school_routes')
      .update({ status: 'active' })
      .eq('id', routeId);

    if (error) throw error;

    // Recreate future trips
    const { data: route } = await supabase
      .from('school_routes')
      .select('*')
      .eq('id', routeId)
      .single();

    if (route) {
      await this.createRecurringTrips(route);
    }
  }

  /**
   * Send guardian notification
   */
  async notifyGuardians(
    routeId: string,
    message: string,
    type: 'pickup' | 'dropoff' | 'alert'
  ): Promise<void> {
    // Get all students and their guardians
    const { data: students } = await supabase
      .from('school_students')
      .select('guardians')
      .eq('route_id', routeId);

    if (!students) return;

    // Send notifications to all guardians
    const guardianPhones = students
      .flatMap(s => s.guardians.map((g: Guardian) => g.phone))
      .filter(Boolean);

    // TODO: Integrate with SMS service (Twilio)
    console.log('Notifying guardians:', guardianPhones, message);
  }

  /**
   * Create recurring trips for the next month
   */
  private async createRecurringTrips(route: SchoolRoute): Promise<void> {
    const trips: any[] = [];
    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

    // Create trips for each active day in the next month
    for (let d = new Date(today); d <= oneMonthLater; d.setDate(d.getDate() + 1)) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
      
      if (route.active_days.includes(dayName)) {
        trips.push({
          route_id: route.id,
          trip_date: d.toISOString().split('T')[0],
          status: 'scheduled',
          students_checked_in: [],
          students_checked_out: []
        });
      }
    }

    if (trips.length > 0) {
      await supabase.from('school_trips').insert(trips);
    }
  }
}

export const schoolTransportService = new SchoolTransportService();
export default schoolTransportService;
