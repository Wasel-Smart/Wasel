import { supabase } from '../utils/supabase/client';

export type TransactionType = 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'reward';
export type PaymentMethod = 'wallet' | 'card' | 'apple_pay' | 'google_pay';

export interface Transaction {
    id: string;
    amount: number;
    currency: 'AED' | 'CREDIT';
    type: TransactionType;
    description: string;
    timestamp: string;
    status: 'completed' | 'pending' | 'failed' | 'held';
    metadata?: any;
}

export interface WalletBalance {
    aed: number;
    credits: number;
}

class PaymentService {
    /**
     * Get user wallet balance
     */
    async getBalance(userId: string): Promise<WalletBalance> {
        // Mocked for innovation demo
        return {
            aed: 350.75,
            credits: 1240
        };
    }

    /**
     * Create an escrow hold for a Hero delivery
     */
    async holdEscrow(senderId: string, taskId: string, amount: number): Promise<boolean> {
        console.log(`Holding AED ${amount} in escrow for task ${taskId} from sender ${senderId}`);
        // Log transaction as 'held'
        return true;
    }

    /**
     * Release escrow to the Hero after successful delivery
     */
    async releaseEscrow(taskId: string, heroId: string): Promise<{ success: boolean; amount: number }> {
        console.log(`Releasing escrow for task ${taskId} to hero ${heroId}`);
        // In a real app, this would update the hero's balance and mark transaction as 'completed'
        return { success: true, amount: 25.00 };
    }

    /**
     * Get a list of recent transactions
     */
    async getRecentTransactions(userId: string): Promise<Transaction[]> {
        return [
            {
                id: 'tx-1',
                amount: 25.00,
                currency: 'AED',
                type: 'escrow_release',
                description: 'Hero Delivery: Marina Package',
                timestamp: new Date().toISOString(),
                status: 'completed'
            },
            {
                id: 'tx-2',
                amount: 15.20,
                currency: 'AED',
                type: 'debit',
                description: 'Premium Carpool Ride',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                status: 'completed'
            },
            {
                id: 'tx-3',
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
     * Implement the "Round-up for Charity" (Sadaka)
     */
    async processRoundUp(amount: number): Promise<number> {
        const rounded = Math.ceil(amount);
        const diff = rounded - amount;
        if (diff > 0) {
            console.log(`Rounding up AED ${diff} for Community Charity Fund`);
            // Here we would trigger a separate micro-transaction to the charity pot
        }
        return diff;
    }
}

export const paymentService = new PaymentService();
