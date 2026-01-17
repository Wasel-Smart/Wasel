import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SuspendUserRequest {
  userId: string;
  reason: string;
  duration?: number; // Days, or null for indefinite
  suspendedBy: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for admin operations
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify admin user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin role
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Access denied. Admin privileges required.' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId, reason, duration, suspendedBy }: SuspendUserRequest = await req.json();

    if (!userId || !reason) {
      return new Response(
        JSON.stringify({ error: 'User ID and reason are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate suspension end date
    const suspendedUntil = duration 
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_until: suspendedUntil,
        suspension_reason: reason,
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error('Failed to suspend user');
    }

    // Log admin action
    await supabaseClient
      .from('admin_actions')
      .insert({
        admin_id: suspendedBy,
        action_type: 'suspend_user',
        target_user_id: userId,
        details: {
          reason,
          duration,
          suspended_until: suspendedUntil,
        },
        created_at: new Date().toISOString(),
      });

    // Cancel all active trips for this user
    await supabaseClient
      .from('trips')
      .update({ status: 'cancelled' })
      .or(`driver_id.eq.${userId},passenger_id.eq.${userId}`)
      .in('status', ['pending', 'accepted', 'active']);

    // Send notification to user (optional)
    const notificationMessage = duration
      ? `Your account has been suspended for ${duration} days. Reason: ${reason}`
      : `Your account has been suspended indefinitely. Reason: ${reason}`;

    await supabaseClient
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'account_suspended',
        title: 'Account Suspended',
        message: notificationMessage,
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User suspended successfully',
        suspendedUntil,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('User suspension error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to suspend user',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
