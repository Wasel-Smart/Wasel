import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  driverId: string;
  amount: number; // Amount in cents
  currency?: string;
  description?: string;
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { driverId, amount, currency = 'aed', description }: PayoutRequest = await req.json();

    if (!driverId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Driver ID and valid amount are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get driver's Stripe Connect account ID from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_connect_account_id')
      .eq('id', driverId)
      .single();

    if (profileError || !profile?.stripe_connect_account_id) {
      return new Response(
        JSON.stringify({ error: 'Driver does not have a connected Stripe account' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create payout using Stripe Connect
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: currency,
      destination: profile.stripe_connect_account_id,
      description: description || `Payout to driver ${driverId}`,
    });

    // Record payout in database
    const { error: insertError } = await supabaseClient
      .from('payouts')
      .insert({
        driver_id: driverId,
        amount: amount,
        currency: currency,
        stripe_transfer_id: transfer.id,
        status: 'completed',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Failed to record payout in database:', insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        payout: {
          id: transfer.id,
          amount: transfer.amount,
          currency: transfer.currency,
          destination: transfer.destination,
          status: 'completed',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payout error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payout',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
