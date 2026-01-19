/**
 * Wasel Hero Service - Community Tasking
 * Enabling users to help their community during their journeys
 */

import { supabase } from '../utils/supabase/client';
import { rewardsService } from './rewardsService';

export interface HeroTask {
    id: string;
    sender_id: string;
    from_location: string;
    to_location: string;
    package_size: 'small' | 'medium' | 'large';
    reward_credits: number;
    status: string;
}

class HeroService {
    /**
     * Discover community tasks near a specific location or along a route
     */
    async discoverTasks(lat: number, lng: number, radiusKm: number = 5): Promise<HeroTask[]> {
        // For now, we fetch pending package deliveries that don't have a captain
        const { data, error } = await supabase
            .from('package_deliveries')
            .select('*')
            .eq('status', 'pending')
            .is('captain_id', null);

        if (error) {
            console.error('Error fetching hero tasks:', error);
            return [];
        }

        return (data || []).map(item => ({
            id: item.id,
            sender_id: item.sender_id,
            from_location: item.from_location,
            to_location: item.to_location,
            package_size: item.package_size,
            reward_credits: item.package_size === 'small' ? 50 : item.package_size === 'medium' ? 100 : 200,
            status: item.status
        }));
    }

    /**
     * Accept a community task
     */
    async acceptTask(taskId: string, userId: string): Promise<boolean> {
        const { error } = await supabase
            .from('package_deliveries')
            .update({
                captain_id: userId,
                status: 'assigned',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

        if (error) {
            console.error('Error accepting task:', error);
            return false;
        }

        return true;
    }

    /**
     * Complete a community task and trigger bonus rewards
     */
    async completeTask(taskId: string, userId: string): Promise<{ success: boolean; credits: number }> {
        const { data, error } = await supabase
            .from('package_deliveries')
            .update({
                status: 'delivered',
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) {
            console.error('Error completing task:', error);
            return { success: false, credits: 0 };
        }

        // Trigger community bonus credits
        const baseCredits = data.package_size === 'small' ? 50 : data.package_size === 'medium' ? 100 : 200;
        const heroBonus = 25; // Extra for community help
        const totalCredits = baseCredits + heroBonus;

        // Innovation: Record the hero action in profile
        await rewardsService.processTripRewards(userId, 'social-hero', 0); // Trigger generic reward process

        return { success: true, credits: totalCredits };
    }
}

export const heroService = new HeroService();
export default heroService;
