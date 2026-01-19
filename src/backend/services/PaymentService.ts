import Stripe from 'stripe';
import { supabase } from '../supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export class PaymentService {
  static async processPayment(tripId: string, amount: number, currency = 'aed') {
    try {
      const { data: trip } = await supabase.from('trips').select('passenger_id').eq('id', tripId).single();
      const { data: user } = await supabase.from('users').select('stripe_customer_id').eq('id', trip.passenger_id).single();
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        customer: user.stripe_customer_id,
        metadata: { trip_id: tripId }
      });

      await supabase.from('payments').insert({
        trip_id: tripId,
        amount,
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'pending'
      });

      return { success: true, client_secret: paymentIntent.client_secret };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async handleWebhook(event: Stripe.Event) {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await supabase.from('payments')
        .update({ status: 'completed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }
  }
}