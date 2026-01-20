/**
 * Enhanced Payment Service with Stripe
 * Handles payments, refunds, and wallet management
 */

import Stripe from 'stripe';
import { supabase } from '../supabase';

interface PaymentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

export class EnhancedPaymentService {
  private static stripe: Stripe;

  private static initialize() {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY;
      if (!secretKey) {
        throw new Error('Stripe secret key not configured');
      }
      this.stripe = new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia'
      });
    }
  }

  /**
   * Create or get Stripe customer for user
   */
  static async getOrCreateCustomer(userId: string): Promise<string> {
    try {
      this.initialize();

      // Check if customer already exists
      const { data: user } = await supabase
        .from('users')
        .select('stripe_customer_id, email, full_name, phone')
        .eq('id', userId)
        .single();

      if (!user) throw new Error('User not found');

      // Return existing customer
      if (user.stripe_customer_id) {
        return user.stripe_customer_id;
      }

      // Create new Stripe customer
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.full_name || undefined,
        phone: user.phone || undefined,
        metadata: { user_id: userId }
      });

      // Save customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('id', userId);

      return customer.id;
    } catch (error: any) {
      console.error('Get or create customer error:', error);
      throw error;
    }
  }

  /**
   * Process trip payment
   */
  static async processTripPayment(
    tripId: string,
    userId: string,
    amount: number,
    currency: string = 'aed',
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    try {
      this.initialize();

      // Validate amount
      if (amount <= 0 || amount > 100000) {
        return { success: false, error: 'Invalid payment amount' };
      }

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId);

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: paymentMethodId ? true : false,
        automatic_payment_methods: paymentMethodId
          ? undefined
          : { enabled: true },
        metadata: {
          trip_id: tripId,
          user_id: userId
        },
        description: `Payment for trip ${tripId}`
      });

      // Save payment record
      await supabase.from('payments').insert({
        trip_id: tripId,
        user_id: userId,
        amount,
        currency,
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret || undefined,
        paymentIntentId: paymentIntent.id
      };
    } catch (error: any) {
      console.error('Process payment error:', error);
      
      // Log failed payment
      await supabase.from('payments').insert({
        trip_id: tripId,
        user_id: userId,
        amount,
        currency,
        status: 'failed',
        error_message: error.message,
        created_at: new Date().toISOString()
      });

      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Add payment method to customer
   */
  static async addPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.initialize();

      const customerId = await this.getOrCreateCustomer(userId);

      // Attach payment method to customer
      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default if first payment method
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      if (paymentMethods.data.length === 1) {
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      // Save to database
      await supabase.from('payment_methods').insert({
        user_id: userId,
        stripe_payment_method_id: paymentMethodId,
        is_default: paymentMethods.data.length === 1,
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Add payment method error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process refund
   */
  static async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<RefundResult> {
    try {
      this.initialize();

      // Get payment details
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single();

      if (!payment) {
        return { success: false, error: 'Payment not found' };
      }

      if (payment.status !== 'completed') {
        return { success: false, error: 'Payment not completed yet' };
      }

      // Create refund
      const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(payment.amount * 100);

      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: refundAmount,
        reason: reason as any || 'requested_by_customer',
        metadata: {
          trip_id: payment.trip_id,
          user_id: payment.user_id
        }
      });

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refund_amount: refundAmount / 100,
          refunded_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      // Create refund record
      await supabase.from('refunds').insert({
        payment_id: payment.id,
        trip_id: payment.trip_id,
        user_id: payment.user_id,
        amount: refundAmount / 100,
        stripe_refund_id: refund.id,
        reason: reason || 'requested_by_customer',
        status: refund.status,
        created_at: new Date().toISOString()
      });

      return {
        success: true,
        refundId: refund.id,
        amount: refundAmount / 100
      };
    } catch (error: any) {
      console.error('Process refund error:', error);
      return {
        success: false,
        error: error.message || 'Refund processing failed'
      };
    }
  }

  /**
   * Handle Stripe webhooks
   */
  static async handleWebhook(
    event: Stripe.Event,
    signature: string,
    webhookSecret: string
  ): Promise<void> {
    try {
      this.initialize();

      // Verify webhook signature
      const verifiedEvent = this.stripe.webhooks.constructEvent(
        JSON.stringify(event),
        signature,
        webhookSecret
      );

      switch (verifiedEvent.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(verifiedEvent.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(verifiedEvent.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleRefund(verifiedEvent.data.object as Stripe.Charge);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Handle subscription events if needed
          break;

        default:
          console.log(`Unhandled event type: ${verifiedEvent.type}`);
      }
    } catch (error: any) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment
   */
  private static async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const tripId = paymentIntent.metadata.trip_id;

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      // Update trip status
      if (tripId) {
        await supabase
          .from('trips')
          .update({ payment_status: 'paid' })
          .eq('id', tripId);
      }

      console.log(`Payment succeeded: ${paymentIntent.id}`);
    } catch (error) {
      console.error('Handle payment success error:', error);
    }
  }

  /**
   * Handle failed payment
   */
  private static async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          error_message: paymentIntent.last_payment_error?.message || 'Payment failed'
        })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      console.log(`Payment failed: ${paymentIntent.id}`);
    } catch (error) {
      console.error('Handle payment failure error:', error);
    }
  }

  /**
   * Handle refund
   */
  private static async handleRefund(charge: Stripe.Charge): Promise<void> {
    try {
      if (!charge.payment_intent) return;

      const paymentIntentId = typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent.id;

      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntentId);

      console.log(`Charge refunded: ${charge.id}`);
    } catch (error) {
      console.error('Handle refund error:', error);
    }
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, trips(pickup_location, dropoff_location, status)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Get payment history error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate platform fee
   */
  static calculatePlatformFee(amount: number, feePercentage: number = 15): number {
    return Math.round(amount * (feePercentage / 100) * 100) / 100;
  }

  /**
   * Transfer to driver (Connect)
   */
  static async transferToDriver(
    driverId: string,
    amount: number,
    tripId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      this.initialize();

      // Get driver's Stripe Connect account
      const { data: driver } = await supabase
        .from('drivers')
        .select('stripe_connect_account_id')
        .eq('id', driverId)
        .single();

      if (!driver?.stripe_connect_account_id) {
        return { success: false, error: 'Driver Connect account not set up' };
      }

      // Calculate amounts
      const platformFee = this.calculatePlatformFee(amount);
      const driverAmount = amount - platformFee;

      // Create transfer
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(driverAmount * 100),
        currency: 'aed',
        destination: driver.stripe_connect_account_id,
        metadata: {
          trip_id: tripId,
          driver_id: driverId
        }
      });

      // Record transfer
      await supabase.from('driver_transfers').insert({
        driver_id: driverId,
        trip_id: tripId,
        amount: driverAmount,
        platform_fee: platformFee,
        stripe_transfer_id: transfer.id,
        status: 'completed',
        created_at: new Date().toISOString()
      });

      return { success: true };
    } catch (error: any) {
      console.error('Transfer to driver error:', error);
      return { success: false, error: error.message };
    }
  }
}
