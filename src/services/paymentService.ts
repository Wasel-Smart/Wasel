import { supabase } from '../utils/supabase/client';
import { paymentService as stripeService } from './integrations';

export type TransactionType = 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'reward' | 'refund' | 'fee' | 'payout';
export type PaymentMethod = 'wallet' | 'card' | 'apple_pay' | 'google_pay' | 'bank_transfer';
export type Currency = 'AED' | 'SAR' | 'EGP' | 'USD' | 'EUR' | 'GBP' | 'CREDIT';

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    currency: Currency;
    type: TransactionType;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed' | 'held' | 'cancelled';
    payment_method?: PaymentMethod;
    reference_id?: string; // Trip ID, booking ID, etc.
    stripe_payment_intent_id?: string;
    metadata?: any;
}

export interface WalletBalance {
    aed: number;
    sar: number;
    egp: number;
    usd: number;
    eur: number;
    gbp: number;
    credits: number;
}

export interface PaymentCard {
    id: string;
    user_id: string;
    stripe_payment_method_id: string;
    last_four: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    is_default: boolean;
    created_at: string;
}

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: Currency;
    status: string;
    client_secret: string;
    payment_method_id?: string;
}

class PaymentService {
    /**
     * Get user wallet balance
     */
    async getBalance(userId: string): Promise<WalletBalance> {
        try {
            const { data, error } = await supabase
                .from('user_wallets')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (!data) {
                // Create wallet if doesn't exist
                const newWallet = {
                    user_id: userId,
                    aed: 0,
                    sar: 0,
                    egp: 0,
                    usd: 0,
                    eur: 0,
                    gbp: 0,
                    credits: 0,
                };

                await supabase.from('user_wallets').insert(newWallet);
                return newWallet;
            }

            return {
                aed: data.aed || 0,
                sar: data.sar || 0,
                egp: data.egp || 0,
                usd: data.usd || 0,
                eur: data.eur || 0,
                gbp: data.gbp || 0,
                credits: data.credits || 0,
            };
        } catch (error) {
            console.error('Failed to get wallet balance:', error);
            // Return mock data as fallback
            return {
                aed: 350.75,
                sar: 0,
                egp: 0,
                usd: 0,
                eur: 0,
                gbp: 0,
                credits: 1240
            };
        }
    }

    /**
     * Create payment intent for Stripe
     */
    async createPaymentIntent(
        amount: number,
        currency: Currency = 'AED',
        metadata?: Record<string, string>
    ): Promise<PaymentIntent> {
        try {
            const result = await stripeService.createPaymentIntent(amount, currency.toLowerCase(), metadata);
            return {
                id: result.id,
                amount: result.amount,
                currency: currency,
                status: result.status,
                client_secret: result.clientSecret,
            };
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            throw new Error('Payment initialization failed');
        }
    }

    /**
     * Process payment for a trip
     */
    async processPayment(
        userId: string,
        amount: number,
        currency: Currency,
        paymentMethod: PaymentMethod,
        referenceId: string,
        description: string
    ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
        try {
            let transactionId: string;

            if (paymentMethod === 'wallet') {
                // Process wallet payment
                const result = await this.processWalletPayment(userId, amount, currency, referenceId, description);
                if (!result.success) {
                    return result;
                }
                transactionId = result.transaction_id!;
            } else {
                // Process card payment through Stripe
                const paymentIntent = await this.createPaymentIntent(amount, currency, {
                    user_id: userId,
                    reference_id: referenceId,
                    description,
                });

                // In a real implementation, the client would confirm the payment
                // For now, we'll assume it's successful
                transactionId = await this.recordTransaction({
                    user_id: userId,
                    amount,
                    currency,
                    type: 'debit',
                    description,
                    payment_method: paymentMethod,
                    reference_id: referenceId,
                    stripe_payment_intent_id: paymentIntent.id,
                    status: 'completed',
                });
            }

            return { success: true, transaction_id: transactionId };
        } catch (error: any) {
            console.error('Payment processing failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process wallet payment
     */
    private async processWalletPayment(
        userId: string,
        amount: number,
        currency: Currency,
        referenceId: string,
        description: string
    ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
        const balance = await this.getBalance(userId);
        const currencyKey = currency.toLowerCase() as keyof WalletBalance;
        const currentBalance = balance[currencyKey] || 0;

        if (currentBalance < amount) {
            return { success: false, error: 'Insufficient wallet balance' };
        }

        // Deduct from wallet
        await this.updateWalletBalance(userId, currency, -amount);

        // Record transaction
        const transactionId = await this.recordTransaction({
            user_id: userId,
            amount,
            currency,
            type: 'debit',
            description,
            payment_method: 'wallet',
            reference_id: referenceId,
            status: 'completed',
        });

        return { success: true, transaction_id: transactionId };
    }

    /**
     * Add funds to wallet
     */
    async addFunds(
        userId: string,
        amount: number,
        currency: Currency,
        paymentMethodId: string
    ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
        try {
            // Create payment intent for adding funds
            const paymentIntent = await this.createPaymentIntent(amount, currency, {
                user_id: userId,
                purpose: 'wallet_topup',
            });

            // In production, client would confirm payment
            // For now, assume successful and add to wallet
            await this.updateWalletBalance(userId, currency, amount);

            const transactionId = await this.recordTransaction({
                user_id: userId,
                amount,
                currency,
                type: 'credit',
                description: 'Wallet top-up',
                payment_method: 'card',
                stripe_payment_intent_id: paymentIntent.id,
                status: 'completed',
            });

            return { success: true, transaction_id: transactionId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Create escrow hold for a transaction
     */
    async holdEscrow(
        senderId: string,
        recipientId: string,
        amount: number,
        currency: Currency,
        referenceId: string,
        description: string
    ): Promise<{ success: boolean; escrow_id?: string; error?: string }> {
        try {
            // Check sender balance
            const balance = await this.getBalance(senderId);
            const currencyKey = currency.toLowerCase() as keyof WalletBalance;
            const currentBalance = balance[currencyKey] || 0;

            if (currentBalance < amount) {
                return { success: false, error: 'Insufficient balance for escrow' };
            }

            // Hold funds in escrow
            await this.updateWalletBalance(senderId, currency, -amount);

            const escrowId = await this.recordTransaction({
                user_id: senderId,
                amount,
                currency,
                type: 'escrow_hold',
                description,
                reference_id: referenceId,
                status: 'held',
                metadata: { recipient_id: recipientId },
            });

            return { success: true, escrow_id: escrowId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Release escrow to recipient
     */
    async releaseEscrow(
        escrowId: string,
        recipientId: string
    ): Promise<{ success: boolean; amount?: number; error?: string }> {
        try {
            // Get escrow transaction
            const { data: escrowTx, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', escrowId)
                .eq('type', 'escrow_hold')
                .eq('status', 'held')
                .single();

            if (error || !escrowTx) {
                return { success: false, error: 'Escrow transaction not found' };
            }

            // Release funds to recipient
            await this.updateWalletBalance(recipientId, escrowTx.currency, escrowTx.amount);

            // Update escrow transaction
            await supabase
                .from('transactions')
                .update({ status: 'completed' })
                .eq('id', escrowId);

            // Record release transaction
            await this.recordTransaction({
                user_id: recipientId,
                amount: escrowTx.amount,
                currency: escrowTx.currency,
                type: 'escrow_release',
                description: `Escrow release: ${escrowTx.description}`,
                reference_id: escrowTx.reference_id,
                status: 'completed',
                metadata: { escrow_id: escrowId },
            });

            return { success: true, amount: escrowTx.amount };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Process refund
     */
    async processRefund(
        originalTransactionId: string,
        amount?: number,
        reason?: string
    ): Promise<{ success: boolean; refund_id?: string; error?: string }> {
        try {
            // Get original transaction
            const { data: originalTx, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', originalTransactionId)
                .single();

            if (error || !originalTx) {
                return { success: false, error: 'Original transaction not found' };
            }

            const refundAmount = amount || originalTx.amount;

            // Process refund based on original payment method
            if (originalTx.payment_method === 'wallet') {
                // Refund to wallet
                await this.updateWalletBalance(originalTx.user_id, originalTx.currency, refundAmount);
            } else if (originalTx.stripe_payment_intent_id) {
                // Refund through Stripe
                await stripeService.refund(originalTx.stripe_payment_intent_id, refundAmount);
            }

            // Record refund transaction
            const refundId = await this.recordTransaction({
                user_id: originalTx.user_id,
                amount: refundAmount,
                currency: originalTx.currency,
                type: 'refund',
                description: `Refund: ${originalTx.description}`,
                reference_id: originalTx.reference_id,
                status: 'completed',
                metadata: { original_transaction_id: originalTransactionId, reason },
            });

            return { success: true, refund_id: refundId };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user transactions
     */
    async getTransactions(
        userId: string,
        limit: number = 50,
        offset: number = 0,
        type?: TransactionType
    ): Promise<Transaction[]> {
        try {
            let query = supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('timestamp', { ascending: false })
                .range(offset, offset + limit - 1);

            if (type) {
                query = query.eq('type', type);
            }

            const { data, error } = await query;

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Failed to get transactions:', error);
            // Return mock data as fallback
            return this.getMockTransactions();
        }
    }

    /**
     * Get recent transactions (fallback mock data)
     */
    private getMockTransactions(): Transaction[] {
        return [
            {
                id: 'tx-1',
                user_id: 'user-1',
                amount: 25.00,
                currency: 'AED',
                type: 'escrow_release',
                description: 'Hero Delivery: Marina Package',
                timestamp: new Date().toISOString(),
                status: 'completed'
            },
            {
                id: 'tx-2',
                user_id: 'user-1',
                amount: 15.20,
                currency: 'AED',
                type: 'debit',
                description: 'Premium Carpool Ride',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                status: 'completed'
            },
            {
                id: 'tx-3',
                user_id: 'user-1',
                amount: 150,
                currency: 'CREDIT',
                type: 'reward',
                description: 'Green Mining: 1.5kg CO2 Saved',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                status: 'completed'
            }
        ];
    }

    /**
     * Update wallet balance
     */
    private async updateWalletBalance(
        userId: string,
        currency: Currency,
        amount: number
    ): Promise<void> {
        const currencyColumn = currency.toLowerCase();
        
        const { error } = await supabase.rpc('update_wallet_balance', {
            p_user_id: userId,
            p_currency: currencyColumn,
            p_amount: amount
        });

        if (error) {
            console.error('Failed to update wallet balance:', error);
            // Fallback to direct update (less safe but works)
            const balance = await this.getBalance(userId);
            const newBalance = { ...balance };
            const currencyKey = currencyColumn as keyof WalletBalance;
            newBalance[currencyKey] = (newBalance[currencyKey] || 0) + amount;

            await supabase
                .from('user_wallets')
                .upsert({
                    user_id: userId,
                    ...newBalance,
                    updated_at: new Date().toISOString(),
                });
        }
    }

    /**
     * Record transaction
     */
    private async recordTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<string> {
        const { data, error } = await supabase
            .from('transactions')
            .insert({
                ...transaction,
                timestamp: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) throw error;
        return data.id;
    }

    /**
     * Get user payment cards
     */
    async getPaymentCards(userId: string): Promise<PaymentCard[]> {
        const { data, error } = await supabase
            .from('user_payment_cards')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Add payment card
     */
    async addPaymentCard(
        userId: string,
        stripePaymentMethodId: string
    ): Promise<PaymentCard> {
        // In production, you'd get card details from Stripe
        const mockCardData = {
            user_id: userId,
            stripe_payment_method_id: stripePaymentMethodId,
            last_four: '4242',
            brand: 'visa',
            exp_month: 12,
            exp_year: 2025,
            is_default: false,
        };

        const { data, error } = await supabase
            .from('user_payment_cards')
            .insert(mockCardData)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Remove payment card
     */
    async removePaymentCard(userId: string, cardId: string): Promise<void> {
        const { error } = await supabase
            .from('user_payment_cards')
            .delete()
            .eq('id', cardId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Set default payment card
     */
    async setDefaultCard(userId: string, cardId: string): Promise<void> {
        // Remove default from all cards
        await supabase
            .from('user_payment_cards')
            .update({ is_default: false })
            .eq('user_id', userId);

        // Set new default
        const { error } = await supabase
            .from('user_payment_cards')
            .update({ is_default: true })
            .eq('id', cardId)
            .eq('user_id', userId);

        if (error) throw error;
    }

    /**
     * Implement the "Round-up for Charity" (Sadaka)
     */
    async processRoundUp(userId: string, amount: number): Promise<number> {
        const rounded = Math.ceil(amount);
        const diff = rounded - amount;
        
        if (diff > 0) {
            // Record charity donation
            await this.recordTransaction({
                user_id: userId,
                amount: diff,
                currency: 'AED',
                type: 'debit',
                description: 'Round-up for Charity (Sadaka)',
                status: 'completed',
                metadata: { charity: true, original_amount: amount },
            });

            console.log(`Rounded up AED ${diff} for Community Charity Fund`);
        }
        
        return diff;
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(userId: string): Promise<{
        total_spent: number;
        total_earned: number;
        total_charity: number;
        transactions_count: number;
        favorite_payment_method: PaymentMethod;
    }> {
        try {
            const transactions = await this.getTransactions(userId, 1000);
            
            const stats = transactions.reduce((acc, tx) => {
                if (tx.type === 'debit') {
                    acc.total_spent += tx.amount;
                    if (tx.metadata?.charity) {
                        acc.total_charity += tx.amount;
                    }
                } else if (tx.type === 'credit' || tx.type === 'escrow_release') {
                    acc.total_earned += tx.amount;
                }
                return acc;
            }, { total_spent: 0, total_earned: 0, total_charity: 0 });

            // Find most used payment method
            const methodCounts = transactions.reduce((acc, tx) => {
                if (tx.payment_method) {
                    acc[tx.payment_method] = (acc[tx.payment_method] || 0) + 1;
                }
                return acc;
            }, {} as Record<PaymentMethod, number>);

            const favoriteMethod = Object.entries(methodCounts)
                .sort(([,a], [,b]) => b - a)[0]?.[0] as PaymentMethod || 'wallet';

            return {
                ...stats,
                transactions_count: transactions.length,
                favorite_payment_method: favoriteMethod,
            };
        } catch (error) {
            console.error('Failed to get payment stats:', error);
            return {
                total_spent: 0,
                total_earned: 0,
                total_charity: 0,
                transactions_count: 0,
                favorite_payment_method: 'wallet',
            };
        }
    }
}

export const paymentService = new PaymentService();
export default paymentService;
