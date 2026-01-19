import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scooterService } from '../../services/scooterService';
import { rewardsService } from '../../services/rewardsService';
import { supabase } from '../../utils/supabase/client';

// Mock state
let rentalStatus = 'pending';
let scooterStatus = 'available';

// Mock Supabase
vi.mock('../../utils/supabase/client', () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({
                data: { session: { user: { id: 'test-user-id' } } }
            })
        },
        rpc: vi.fn().mockResolvedValue({
            data: [{ id: 'scooter-123', code: 'WAS-TEST', status: 'available' }],
            error: null
        }),
        from: vi.fn().mockImplementation((tableName) => ({
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockImplementation((updateData: any) => {
                if (tableName === 'scooter_rentals' && updateData.status) rentalStatus = updateData.status;
                if (tableName === 'scooters' && updateData.status) scooterStatus = updateData.status;
                return {
                    eq: vi.fn().mockReturnThis(),
                    select: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValue({
                        data: { id: 'rental-456', user_id: 'test-user-id', scooter: { price_per_min: 1.0, price_per_min_decimal: 1.0 } },
                        error: null
                    })
                };
            }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { id: 'rental-456', user_id: 'test-user-id', scooter_id: 'scooter-123', scooter: { price_per_min: 1.0, price_per_min_decimal: 1.0 } },
                error: null
            })
        }))
    }
}));

// Mock RewardsService
vi.mock('../../services/rewardsService', () => ({
    rewardsService: {
        processTripRewards: vi.fn().mockResolvedValue({ creditsEarned: 10, co2Saved: 1.2 })
    }
}));

describe('Wasel Innovation: Sequential Lifecycle with Rewards', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        rentalStatus = 'pending';
        scooterStatus = 'available';
    });

    it('should complete the rental flow AND trigger Green Mining rewards', async () => {
        console.log('--- INNOVATION TEST START ---');

        // 1. Discover
        const scooters = await scooterService.getNearbyScooters(25.2, 55.2);
        expect(scooters.length).toBeGreaterThan(0);

        // 2. Unlock (Starts the rental)
        const rental = await scooterService.unlockScooter('scooter-123');
        expect(rentalStatus).toBe('active');

        // 3. End Ride (Triggers Price & Rewards)
        console.log('Finalizing ride and calculating rewards...');
        await scooterService.endRide('rental-456', { lat: 25.21, lng: 55.21 });

        expect(rentalStatus).toBe('completed');
        expect(scooterStatus).toBe('available');

        // VERIFY INNOVATION: Rewards must be processed
        expect(rewardsService.processTripRewards).toHaveBeenCalled();
        const rewardsCall = vi.mocked(rewardsService.processTripRewards).mock.calls[0];
        console.log(`✅ Innovation Verified: Rewards processed for user ${rewardsCall[0]} (${rewardsCall[1]} trip)`);

        console.log('--- INNOVATION TEST COMPLETE ---');
    });
});
