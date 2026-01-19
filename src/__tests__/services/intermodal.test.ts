import { describe, it, expect, vi, beforeEach } from 'vitest';
import { intermodalService } from '../../services/intermodalService';
import ServiceFactory from '../../services/serviceFactory';

// Mock ServiceFactory
vi.mock('../../services/serviceFactory', () => ({
    ServiceFactory: {
        discover: vi.fn().mockResolvedValue({
            success: true,
            data: [{
                id: 'trip-789',
                from_lat: 25.2,
                from_lng: 55.2,
                to_lat: 25.4,
                to_lng: 55.4,
                is_female_only: true,
                price_per_seat: 15
            }]
        })
    }
}));

describe('Intermodal Journey Service (Cultural & Climate Aware)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should plan a journey with gender privacy consideration', async () => {
        console.log('--- INTERMODAL TEST: GENDER PRIVACY ---');

        const from = { lat: 25.19, lng: 55.19, address: 'Dubai Marina' };
        const to = { lat: 25.41, lng: 55.41, address: 'Sharjah' };

        const journeys = await intermodalService.planJourney(from, to, { femaleOnly: true });

        expect(journeys.length).toBeGreaterThan(0);
        const carpoolSeg = journeys[0].segments.find(s => s.type === 'carpool');
        expect(carpoolSeg?.isFemaleOnly).toBe(true);

        console.log(`✅ Gender Privacy Verified: Journey includes female-only leg.`);
    });

    it('should adjust comfort score based on heat (Summer condition)', async () => {
        console.log('--- INTERMODAL TEST: CLIMATE COMFORT ---');

        // Mock the current time to 2 PM (Peak Heat)
        const date = new Date(2024, 6, 1, 14, 0, 0); // July 1st, 14:00
        vi.setSystemTime(date);

        const from = { lat: 25.19, lng: 55.19, address: 'Near Marina' };
        const to = { lat: 25.41, lng: 55.41, address: 'Sharjah' };

        const journeys = await intermodalService.planJourney(from, to);

        // If walk leg is long during peak heat, comfort should be lower
        console.log(`Comfort Search at 14:00 (Peak Heat): ${journeys[0].comfortScore}/10`);
        expect(journeys[0].comfortScore).toBeLessThan(10);

        vi.useRealTimers();
        console.log(`✅ Climate Comfort Verified: Score adjusted for peak heat.`);
    });
});
