import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmergencyNotification {
  tripId: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  alertType: 'sos' | 'accident' | 'suspicious_activity' | 'route_deviation';
  message?: string;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { tripId, userId, location, alertType, message }: EmergencyNotification = await req.json();

    if (!tripId || !userId || !location || !alertType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user profile and emergency contacts
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, phone_number, emergency_contacts')
      .eq('id', userId)
      .single();

    // Get trip details
    const { data: trip } = await supabaseClient
      .from('trips')
      .select('*, driver:driver_id(full_name, phone_number)')
      .eq('id', tripId)
      .single();

    // Create emergency alert in database
    const { data: alert, error: alertError } = await supabaseClient
      .from('emergency_alerts')
      .insert({
        trip_id: tripId,
        user_id: userId,
        alert_type: alertType,
        location: `POINT(${location.longitude} ${location.latitude})`,
        message: message || `Emergency alert: ${alertType}`,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (alertError) {
      throw new Error('Failed to create emergency alert');
    }

    // Send SMS to emergency contacts using Twilio
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    const locationUrl = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
    const emergencyMessage = `🚨 EMERGENCY ALERT: ${profile?.full_name} has triggered an ${alertType} alert during their trip. Location: ${locationUrl}. Please contact them immediately.`;

    const notifications = [];

    // Send to emergency contacts
    if (profile?.emergency_contacts && Array.isArray(profile.emergency_contacts)) {
      for (const contact of profile.emergency_contacts) {
        if (contact.phone && twilioSid && twilioToken && twilioPhone) {
          try {
            const response = await fetch(
              `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
              {
                method: 'POST',
                headers: {
                  'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
                  'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                  To: contact.phone,
                  From: twilioPhone,
                  Body: emergencyMessage,
                }),
              }
            );
            notifications.push({ contact: contact.name, status: 'sent' });
          } catch (error) {
            console.error(`Failed to send SMS to ${contact.name}:`, error);
            notifications.push({ contact: contact.name, status: 'failed' });
          }
        }
      }
    }

    // Notify local emergency services (if configured)
    const emergencyServiceUrl = Deno.env.get('EMERGENCY_SERVICE_API_URL');
    if (emergencyServiceUrl) {
      try {
        await fetch(emergencyServiceUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert.id,
            tripId,
            userId,
            location,
            alertType,
            timestamp: new Date().toISOString(),
          }),
        });
        notifications.push({ service: 'Emergency Services', status: 'notified' });
      } catch (error) {
        console.error('Failed to notify emergency services:', error);
      }
    }

    // Send push notifications to driver and passenger
    // (This would integrate with Firebase Cloud Messaging)
    
    return new Response(
      JSON.stringify({
        success: true,
        alert: {
          id: alert.id,
          status: 'active',
          notificationsSent: notifications.length,
          notifications,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Emergency notification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send emergency notification',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
