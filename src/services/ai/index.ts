/**
 * AI Optimizer for Wasel Auto-Assignment
 * Rule-based + AI scoring (Explainable & production-safe)
 */

import { supabase } from '../../utils/supabase/client';

type ServiceType = 'wasel' | 'raje3';

interface Order {
  id: string;
  service_type: ServiceType;
  pickup_location: string;
  laundry_partner_id: string;
  preferred_pickup_time: string;
  load_details: {
    weight_kg: number;
  };
}

interface Captain {
  id: string;
  distance_to_pickup: number;
  availability: 'available' | 'busy';
  vehicle_type: string;
  rating: number;
  completion_rate: number;
  avg_delay_minutes: number;
}

interface Partner {
  id: string;
  current_load_kg: number;
  max_capacity_kg: number;
}

const BASE_WEIGHTS = {
  distance: 0.3,
  performance: 0.2,
  sla: 0.2,
  partnerLoad: 0.1,
  availability: 0.2
};

class AIOptimizer {
  /** RULE FILTER (Hard Constraints) */
  private ruleFilter(captains: Captain[]): Captain[] {
    return captains.filter(c =>
      c.availability === 'available' &&
      c.vehicle_type === 'van' &&
      c.rating >= 4.0
    );
  }

  /** SCORE FUNCTION (Explainable AI) */
  private scoreCaptain(
    captain: Captain,
    order: Order,
    partner: Partner
  ): number {
    const weights = { ...BASE_WEIGHTS };

    // Raje3 prefers reliability over distance
    if (order.service_type === 'raje3') {
      weights.performance += 0.1;
      weights.distance -= 0.1;
    }

    const distanceScore = 1 / (1 + captain.distance_to_pickup);
    const performanceScore = captain.completion_rate * captain.rating;
    const slaScore = captain.avg_delay_minutes < 10 ? 1 : 0.5;
    const partnerLoadScore =
      1 - (partner.current_load_kg / partner.max_capacity_kg);

    return (
      weights.distance * distanceScore +
      weights.performance * performanceScore +
      weights.sla * slaScore +
      weights.partnerLoad * partnerLoadScore +
      weights.availability
    );
  }

  /** SELECT BEST CAPTAIN */
  async selectCaptain(order: Order): Promise<string | null> {
    const { data: captains } = await supabase
      .from('captains_view')
      .select('*');

    const { data: partner } = await supabase
      .from('laundry_partners')
      .select('id, current_load_kg, max_capacity_kg')
      .eq('id', order.laundry_partner_id)
      .single();

    if (!captains || !partner) return null;

    const eligible = this.ruleFilter(captains);
    if (!eligible.length) return null;

    const ranked = eligible
      .map(c => ({
        captainId: c.id,
        score: this.scoreCaptain(c, order, partner)
      }))
      .sort((a, b) => b.score - a.score);

    return ranked[0]?.captainId || null;
  }
}

export default new AIOptimizer();
