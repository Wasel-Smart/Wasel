/**
 * Admin Service
 * Handles all administrative functions including user management, system monitoring, and analytics
 */

import { supabase } from './api';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'support';
  permissions: string[];
  created_at: string;
  last_login: string;
}

export interface UserManagementData {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  status: 'active' | 'suspended' | 'banned' | 'pending_verification';
  user_type: 'passenger' | 'driver' | 'both';
  created_at: string;
  last_active: string;
  total_trips: number;
  total_spent: number;
  total_earned: number;
  rating: number;
  verification_status: 'verified' | 'pending' | 'rejected';
}

export interface SystemMetrics {
  users: {
    total: number;
    active_today: number;
    active_this_week: number;
    active_this_month: number;
    new_this_month: number;
  };
  trips: {
    total: number;
    completed_today: number;
    completed_this_week: number;
    completed_this_month: number;
    cancelled_rate: number;
  };
  revenue: {
    total: number;
    today: number;
    this_week: number;
    this_month: number;
    average_per_trip: number;
  };
  drivers: {
    total: number;
    active: number;
    pending_verification: number;
    average_rating: number;
  };
}

export interface DisputeCase {
  id: string;
  trip_id: string;
  complainant_id: string;
  respondent_id: string;
  type: 'payment' | 'behavior' | 'safety' | 'service_quality' | 'other';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  evidence: string[];
  resolution?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface FraudAlert {
  id: string;
  user_id: string;
  type: 'fake_gps' | 'multiple_accounts' | 'payment_fraud' | 'rating_manipulation' | 'suspicious_behavior';
  risk_score: number;
  details: Record<string, any>;
  status: 'new' | 'investigating' | 'confirmed' | 'false_positive';
  created_at: string;
}

class AdminService {
  /**
   * Check if current user has admin privileges
   */
  async checkAdminAccess(): Promise<{ isAdmin: boolean; role?: string; permissions?: string[] }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { isAdmin: false };

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role, permissions')
      .eq('id', user.id)
      .single();

    if (!adminUser) return { isAdmin: false };

    return {
      isAdmin: true,
      role: adminUser.role,
      permissions: adminUser.permissions,
    };
  }

  /**
   * Get system metrics dashboard
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get user metrics
    const [
      totalUsers,
      activeToday,
      activeThisWeek,
      activeThisMonth,
      newThisMonth
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', today),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', weekAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('last_active', monthAgo),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthAgo),
    ]);

    // Get trip metrics
    const [
      totalTrips,
      completedToday,
      completedThisWeek,
      completedThisMonth,
      cancelledTrips
    ] = await Promise.all([
      supabase.from('trips').select('*', { count: 'exact', head: true }),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', today),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', weekAgo),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('created_at', monthAgo),
      supabase.from('trips').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
    ]);

    // Get revenue metrics (mock data for now)
    const revenue = {
      total: 1250000,
      today: 15000,
      this_week: 85000,
      this_month: 320000,
      average_per_trip: 45,
    };

    // Get driver metrics
    const [
      totalDrivers,
      activeDrivers,
      pendingVerification,
      driverRatings
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'driver'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'driver').eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
      supabase.from('user_rating_stats').select('average_rating').not('average_rating', 'is', null),
    ]);

    const averageDriverRating = driverRatings.data?.length 
      ? driverRatings.data.reduce((sum, r) => sum + r.average_rating, 0) / driverRatings.data.length
      : 0;

    const cancelledRate = totalTrips.count && cancelledTrips.count
      ? (cancelledTrips.count / totalTrips.count) * 100
      : 0;

    return {
      users: {
        total: totalUsers.count || 0,
        active_today: activeToday.count || 0,
        active_this_week: activeThisWeek.count || 0,
        active_this_month: activeThisMonth.count || 0,
        new_this_month: newThisMonth.count || 0,
      },
      trips: {
        total: totalTrips.count || 0,
        completed_today: completedToday.count || 0,
        completed_this_week: completedThisWeek.count || 0,
        completed_this_month: completedThisMonth.count || 0,
        cancelled_rate: Math.round(cancelledRate * 100) / 100,
      },
      revenue,
      drivers: {
        total: totalDrivers.count || 0,
        active: activeDrivers.count || 0,
        pending_verification: pendingVerification.count || 0,
        average_rating: Math.round(averageDriverRating * 100) / 100,
      },
    };
  }

  /**
   * Get users for management
   */
  async getUsers(
    page: number = 1,
    limit: number = 50,
    filters?: {
      status?: string;
      user_type?: string;
      search?: string;
    }
  ): Promise<{ users: UserManagementData[]; total: number }> {
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        status,
        user_type,
        created_at,
        last_active,
        verification_status,
        user_rating_stats(average_rating)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.user_type) {
      query = query.eq('user_type', filters.user_type);
    }
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    // Enrich with trip and financial data (mock for now)
    const enrichedUsers: UserManagementData[] = (data || []).map(user => ({
      ...user,
      total_trips: Math.floor(Math.random() * 100),
      total_spent: Math.floor(Math.random() * 5000),
      total_earned: Math.floor(Math.random() * 10000),
      rating: user.user_rating_stats?.average_rating || 0,
    }));

    return {
      users: enrichedUsers,
      total: count || 0,
    };
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    // Log the action
    await this.logAdminAction('user_status_update', {
      user_id: userId,
      new_status: status,
      reason,
    });
  }

  /**
   * Verify driver
   */
  async verifyDriver(
    userId: string,
    verification_status: 'verified' | 'rejected',
    notes?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        verification_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    await this.logAdminAction('driver_verification', {
      user_id: userId,
      verification_status,
      notes,
    });
  }

  /**
   * Get disputes
   */
  async getDisputes(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      type?: string;
      priority?: string;
    }
  ): Promise<{ disputes: DisputeCase[]; total: number }> {
    let query = supabase
      .from('disputes')
      .select(`
        *,
        complainant:complainant_id(full_name),
        respondent:respondent_id(full_name),
        trip:trip_id(from_location, to_location)
      `, { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.priority) query = query.eq('priority', filters.priority);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      disputes: data || [],
      total: count || 0,
    };
  }

  /**
   * Update dispute status
   */
  async updateDispute(
    disputeId: string,
    updates: {
      status?: string;
      resolution?: string;
      assigned_to?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('disputes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', disputeId);

    if (error) throw error;

    await this.logAdminAction('dispute_update', {
      dispute_id: disputeId,
      updates,
    });
  }

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string;
      type?: string;
      min_risk_score?: number;
    }
  ): Promise<{ alerts: FraudAlert[]; total: number }> {
    let query = supabase
      .from('fraud_alerts')
      .select(`
        *,
        user:user_id(full_name, email)
      `, { count: 'exact' });

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.min_risk_score) query = query.gte('risk_score', filters.min_risk_score);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      alerts: data || [],
      total: count || 0,
    };
  }

  /**
   * Update fraud alert status
   */
  async updateFraudAlert(
    alertId: string,
    status: 'investigating' | 'confirmed' | 'false_positive'
  ): Promise<void> {
    const { error } = await supabase
      .from('fraud_alerts')
      .update({ status })
      .eq('id', alertId);

    if (error) throw error;

    await this.logAdminAction('fraud_alert_update', {
      alert_id: alertId,
      new_status: status,
    });
  }

  /**
   * Get platform analytics
   */
  async getPlatformAnalytics(
    startDate: string,
    endDate: string
  ): Promise<{
    daily_stats: Array<{
      date: string;
      new_users: number;
      active_users: number;
      trips_completed: number;
      revenue: number;
    }>;
    top_routes: Array<{
      route: string;
      trip_count: number;
      revenue: number;
    }>;
    user_retention: {
      d1: number;
      d7: number;
      d30: number;
    };
  }> {
    // Mock data for now - in production, this would query actual analytics tables
    const mockDailyStats = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      mockDailyStats.push({
        date: d.toISOString().split('T')[0],
        new_users: Math.floor(Math.random() * 100) + 50,
        active_users: Math.floor(Math.random() * 1000) + 500,
        trips_completed: Math.floor(Math.random() * 500) + 200,
        revenue: Math.floor(Math.random() * 10000) + 5000,
      });
    }

    return {
      daily_stats: mockDailyStats,
      top_routes: [
        { route: 'Dubai Marina → Downtown Dubai', trip_count: 1250, revenue: 56250 },
        { route: 'Dubai Airport → Dubai Mall', trip_count: 980, revenue: 44100 },
        { route: 'Abu Dhabi → Dubai', trip_count: 750, revenue: 90000 },
      ],
      user_retention: {
        d1: 65,
        d7: 35,
        d30: 20,
      },
    };
  }

  /**
   * Send system-wide notification
   */
  async sendSystemNotification(
    notification: {
      title: string;
      message: string;
      type: 'info' | 'warning' | 'maintenance' | 'promotion';
      target_users?: 'all' | 'drivers' | 'passengers' | 'active_users';
      scheduled_for?: string;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('system_notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString(),
        status: notification.scheduled_for ? 'scheduled' : 'sent',
      });

    if (error) throw error;

    await this.logAdminAction('system_notification_sent', notification);
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'up' | 'down' | 'degraded';
      response_time?: number;
      last_check: string;
    }>;
    alerts: string[];
  }> {
    // Mock system health data
    return {
      status: 'healthy',
      services: [
        { name: 'Database', status: 'up', response_time: 45, last_check: new Date().toISOString() },
        { name: 'Payment Gateway', status: 'up', response_time: 120, last_check: new Date().toISOString() },
        { name: 'SMS Service', status: 'up', response_time: 200, last_check: new Date().toISOString() },
        { name: 'Maps API', status: 'up', response_time: 80, last_check: new Date().toISOString() },
        { name: 'Push Notifications', status: 'up', response_time: 60, last_check: new Date().toISOString() },
      ],
      alerts: [],
    };
  }

  /**
   * Export data for compliance
   */
  async exportUserData(
    userId: string,
    dataTypes: string[]
  ): Promise<{ download_url: string; expires_at: string }> {
    // In production, this would generate a secure download link
    await this.logAdminAction('data_export_requested', {
      user_id: userId,
      data_types: dataTypes,
    });

    return {
      download_url: `/api/admin/export/${userId}?token=${Math.random().toString(36)}`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };
  }

  /**
   * Log admin action for audit trail
   */
  private async logAdminAction(
    action: string,
    details: Record<string, any>
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: user.id,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip_address: 'unknown', // Would be captured from request in production
      });
  }

  /**
   * Get admin audit log
   */
  async getAuditLog(
    page: number = 1,
    limit: number = 50,
    filters?: {
      admin_id?: string;
      action?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<{
    logs: Array<{
      id: string;
      admin_id: string;
      admin_name: string;
      action: string;
      details: Record<string, any>;
      timestamp: string;
      ip_address: string;
    }>;
    total: number;
  }> {
    let query = supabase
      .from('admin_audit_log')
      .select(`
        *,
        admin:admin_id(full_name)
      `, { count: 'exact' });

    if (filters?.admin_id) query = query.eq('admin_id', filters.admin_id);
    if (filters?.action) query = query.eq('action', filters.action);
    if (filters?.start_date) query = query.gte('timestamp', filters.start_date);
    if (filters?.end_date) query = query.lte('timestamp', filters.end_date);

    const { data, error, count } = await query
      .order('timestamp', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const logs = (data || []).map(log => ({
      ...log,
      admin_name: log.admin?.full_name || 'Unknown Admin',
    }));

    return { logs, total: count || 0 };
  }
}

export const adminService = new AdminService();