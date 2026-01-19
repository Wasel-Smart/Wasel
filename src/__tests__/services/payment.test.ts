import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentService } from '../../services/paymentService';

describe('Wasel Pay: Financial Innovation & Settlement', () => {

    it('should calculate the festive Sadaka round-up correctly', async () => {
        const fare = 45.25;
        const roundUp = await paymentService.processRoundUp(fare);

        expect(roundUp).toBe(0.75);
        console.log(`✅ Round-up Test: AED ${fare} rounded up to AED 46.00 (Sadaka: AED 0.75)`);
    });

    it('should manage the escrow lifecycle for Hero community tasks', async () => {
        const senderId = 'sender-123';
        const taskId = 'task-hero-456';
        const heroId = 'hero-789';
        const amount = 25.00;

        // 1. Hold Escrow
        const isHeld = await paymentService.holdEscrow(senderId, taskId, amount);
        expect(isHeld).toBe(true);
        console.log(`✅ Escrow Hold: AED ${amount} secured for the Hero.`);

        // 2. Release Escrow after verification
        const release = await paymentService.releaseEscrow(taskId, heroId);
        expect(release.success).toBe(true);
        expect(release.amount).toBe(amount);
        console.log(`✅ Settlement: AED ${release.amount} instantly transferred to Hero ${heroId}.`);
    });

    it('should retrieve accurate multi-currency balances', async () => {
        const balance = await paymentService.getBalance('user-123');
        expect(balance.aed).toBeGreaterThan(0);
        expect(balance.credits).toBeGreaterThan(0);
        console.log(`✅ Wallet Sync: Found AED ${balance.aed} and ${balance.credits} Eco-Credits.`);
    });
});
