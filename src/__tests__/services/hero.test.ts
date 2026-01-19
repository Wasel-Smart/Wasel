import { describe, it, expect, vi, beforeEach } from 'vitest';
import { heroService } from '../../services/heroService';
import { supabase } from '../../utils/supabase/client';

// Mock Supabase
vi.mock('../../utils/supabase/client', () => ({
    supabase: {
        from: vi.fn().mockImplementation((tableName) => ({
            select: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { id: 'task-123', package_size: 'medium', status: 'pending' },
                error: null
            }),
            select_single: vi.fn().mockResolvedValue({
                data: { id: 'task-123', package_size: 'medium', status: 'pending' },
                error: null
            })
        }))
    }
}));

describe('Wasel Hero Community Innovation', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should allow a user to discover and accept a community task', async () => {
        console.log('--- HERO INNOVATION TEST START ---');

        // 1. Discover tasks
        const tasks = await heroService.discoverTasks(25.2, 55.2);
        expect(tasks).toBeDefined();
        console.log(`✅ Discovery: Found ${tasks.length} community tasks.`);

        // 2. Accept Task
        const accepted = await heroService.acceptTask('task-123', 'hero-user-id');
        expect(accepted).toBe(true);
        console.log('✅ Accept: User successfully became a Hero for task-123.');

        // 3. Complete Task & Earn Rewards
        const completion = await heroService.completeTask('task-123', 'hero-user-id');
        expect(completion.success).toBe(true);
        expect(completion.credits).toBeGreaterThan(100); // 100 base + 25 bonus
        console.log(`✅ Completion: Hero earned ${completion.credits} credits (including Community Bonus).`);

        console.log('--- HERO INNOVATION TEST COMPLETE ---');
    });
});
