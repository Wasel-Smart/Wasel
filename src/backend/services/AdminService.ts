import { supabase } from '../../services/api';

export class AdminService {
  static async getDashboardStats() {
    const [trips, users, drivers, revenue] = await Promise.all([
      supabase.from('trips').select('id', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('drivers').select('id', { count: 'exact' }),
      supabase.from('payments').select('amount').eq('status', 'completed')
    ]);

    const totalRevenue = revenue.data?.reduce((sum, p) => sum + p.amount, 0) || 0;

    return {
      total_trips: trips.count || 0,
      total_users: users.count || 0,
      total_drivers: drivers.count || 0,
      total_revenue: totalRevenue,
      platform_fee: totalRevenue * 0.2
    };
  }

  static async manageUser(userId: string, action: 'ban' | 'suspend' | 'verify', reason?: string) {
    const status = action === 'ban' ? 'banned' : action === 'suspend' ? 'suspended' : 'verified';
    
    await supabase.from('users').update({ status }).eq('id', userId);
    
    await supabase.from('admin_actions').insert({
      user_id: userId,
      action,
      reason,
      admin_id: 'system', // Replace with actual admin ID
      created_at: new Date().toISOString()
    });

    return { success: true, action, userId };
  }

  static async getLiveTrips() {
    const { data } = await supabase.from('trips')
      .select(`
        id, status, created_at, pickup_address, dropoff_address,
        users!trips_passenger_id_fkey(name, phone),
        drivers!trips_driver_id_fkey(name, phone, vehicle_plate)
      `)
      .in('status', ['driver_assigned', 'driver_arrived', 'in_progress'])
      .order('created_at', { ascending: false });

    return data || [];
  }

  static async resolveDispute(disputeId: string, resolution: string, refundAmount?: number) {
    await supabase.from('disputes').update({
      status: 'resolved',
      resolution,
      resolved_at: new Date().toISOString()
    }).eq('id', disputeId);

    if (refundAmount) {
      const { data: dispute } = await supabase.from('disputes')
        .select('trip_id')
        .eq('id', disputeId)
        .single();

      await supabase.from('refunds').insert({
        trip_id: dispute.trip_id,
        amount: refundAmount,
        reason: 'dispute_resolution',
        status: 'pending'
      });
    }

    return { success: true, disputeId, resolution };
  }

  static async getFinancialReport(startDate: string, endDate: string) {
    const { data: payments } = await supabase.from('payments')
      .select('amount, currency, created_at')
      .eq('status', 'completed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const platformFee = totalRevenue * 0.2;
    const driverEarnings = totalRevenue * 0.8;

    return {
      period: { start: startDate, end: endDate },
      total_revenue: totalRevenue,
      platform_fee: platformFee,
      driver_earnings: driverEarnings,
      transaction_count: payments?.length || 0
    };
  }

  static async sendBulkMessage(userIds: string[], title: string, message: string) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: 'admin_message',
      created_at: new Date().toISOString()
    }));

    await supabase.from('notifications').insert(notifications);
    return { success: true, sent_to: userIds.length };
  }
}