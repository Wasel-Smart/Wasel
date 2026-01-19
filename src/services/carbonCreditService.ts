import { supabase } from '../utils/supabase/client';

interface CarbonCredit {
  id: string;
  user_id: string;
  trip_id?: string;
  co2_saved: number; // kg CO2
  credits_earned: number;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  expires_at: string;
}

interface CarbonMarketListing {
  id: string;
  seller_id: string;
  credits_amount: number;
  price_per_credit: number;
  total_price: number;
  status: 'active' | 'sold' | 'cancelled';
  buyer_id?: string;
  created_at: string;
}

interface CarbonOffset {
  transportation: number;
  carpooling: number;
  electric_vehicle: number;
  public_transport: number;
  walking_cycling: number;
}

class CarbonCreditService {
  private readonly CO2_FACTORS: CarbonOffset = {
    transportation: 0.21,    // kg CO2 per km (average car)
    carpooling: 0.105,      // 50% reduction
    electric_vehicle: 0.05,  // 75% reduction
    public_transport: 0.08,  // 60% reduction
    walking_cycling: 0       // Zero emissions
  };

  async calculateTripCarbonSavings(
    distance: number,
    tripType: 'carpool' | 'electric' | 'public' | 'walk_cycle',
    passengers: number = 1
  ): Promise<{ co2_saved: number; credits_earned: number }> {
    const baseEmissions = distance * this.CO2_FACTORS.transportation;
    let actualEmissions = 0;

    switch (tripType) {
      case 'carpool':
        actualEmissions = (distance * this.CO2_FACTORS.carpooling) / passengers;
        break;
      case 'electric':
        actualEmissions = distance * this.CO2_FACTORS.electric_vehicle;
        break;
      case 'public':
        actualEmissions = distance * this.CO2_FACTORS.public_transport;
        break;
      case 'walk_cycle':
        actualEmissions = 0;
        break;
    }

    const co2_saved = Math.max(0, baseEmissions - actualEmissions);
    const credits_earned = Math.floor(co2_saved * 10); // 10 credits per kg CO2

    return { co2_saved, credits_earned };
  }

  async recordTripCarbonCredits(
    userId: string,
    tripId: string,
    distance: number,
    tripType: 'carpool' | 'electric' | 'public' | 'walk_cycle',
    passengers: number = 1
  ): Promise<CarbonCredit> {
    const { co2_saved, credits_earned } = await this.calculateTripCarbonSavings(
      distance, tripType, passengers
    );

    const carbonCredit = {
      user_id: userId,
      trip_id: tripId,
      co2_saved,
      credits_earned,
      verification_status: 'verified' as const,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };

    const { data, error } = await supabase
      .from('carbon_credits')
      .insert(carbonCredit)
      .select()
      .single();

    if (error) throw error;

    // Update user's carbon credit balance
    await this.updateUserCarbonBalance(userId, credits_earned);

    return data;
  }

  async getUserCarbonCredits(userId: string): Promise<{
    total_credits: number;
    total_co2_saved: number;
    credits_this_month: number;
    environmental_impact: string;
  }> {
    const { data, error } = await supabase
      .from('carbon_credits')
      .select('*')
      .eq('user_id', userId)
      .eq('verification_status', 'verified');

    if (error) throw error;

    const total_credits = data?.reduce((sum, credit) => sum + credit.credits_earned, 0) || 0;
    const total_co2_saved = data?.reduce((sum, credit) => sum + credit.co2_saved, 0) || 0;
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const credits_this_month = data?.filter(credit => 
      new Date(credit.created_at) >= thisMonth
    ).reduce((sum, credit) => sum + credit.credits_earned, 0) || 0;

    const environmental_impact = this.calculateEnvironmentalImpact(total_co2_saved);

    return {
      total_credits,
      total_co2_saved,
      credits_this_month,
      environmental_impact
    };
  }

  async listCreditsForSale(
    userId: string,
    creditsAmount: number,
    pricePerCredit: number
  ): Promise<CarbonMarketListing> {
    const userCredits = await this.getUserCarbonCredits(userId);
    
    if (userCredits.total_credits < creditsAmount) {
      throw new Error('Insufficient carbon credits');
    }

    const listing = {
      seller_id: userId,
      credits_amount: creditsAmount,
      price_per_credit: pricePerCredit,
      total_price: creditsAmount * pricePerCredit,
      status: 'active' as const
    };

    const { data, error } = await supabase
      .from('carbon_market_listings')
      .insert(listing)
      .select()
      .single();

    if (error) throw error;

    // Lock user's credits
    await this.lockUserCredits(userId, creditsAmount);

    return data;
  }

  async buyCredits(
    buyerId: string,
    listingId: string
  ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
    try {
      const { data: listing, error } = await supabase
        .from('carbon_market_listings')
        .select('*')
        .eq('id', listingId)
        .eq('status', 'active')
        .single();

      if (error || !listing) {
        return { success: false, error: 'Listing not found' };
      }

      // Process payment
      const paymentResult = await this.processMarketplacePayment(
        buyerId,
        listing.seller_id,
        listing.total_price,
        listing.credits_amount
      );

      if (!paymentResult.success) {
        return paymentResult;
      }

      // Transfer credits
      await this.transferCredits(listing.seller_id, buyerId, listing.credits_amount);

      // Update listing status
      await supabase
        .from('carbon_market_listings')
        .update({ status: 'sold', buyer_id: buyerId })
        .eq('id', listingId);

      return { success: true, transaction_id: paymentResult.transaction_id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getMarketplaceListings(limit: number = 20): Promise<CarbonMarketListing[]> {
    const { data, error } = await supabase
      .from('carbon_market_listings')
      .select(`
        *,
        seller:profiles!seller_id(full_name, rating)
      `)
      .eq('status', 'active')
      .order('price_per_credit', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async offsetCarbonFootprint(
    userId: string,
    co2Amount: number,
    source: string
  ): Promise<{ success: boolean; credits_used: number; cost: number }> {
    const creditsNeeded = Math.ceil(co2Amount * 10); // 10 credits per kg CO2
    const userCredits = await this.getUserCarbonCredits(userId);

    if (userCredits.total_credits >= creditsNeeded) {
      // Use user's own credits
      await this.updateUserCarbonBalance(userId, -creditsNeeded);
      
      await supabase.from('carbon_offsets').insert({
        user_id: userId,
        co2_amount: co2Amount,
        credits_used: creditsNeeded,
        source,
        method: 'own_credits'
      });

      return { success: true, credits_used: creditsNeeded, cost: 0 };
    } else {
      // Buy credits from marketplace
      const marketPrice = await this.getAverageMarketPrice();
      const cost = creditsNeeded * marketPrice;

      // Auto-purchase from marketplace
      const purchaseResult = await this.autoPurchaseCredits(userId, creditsNeeded);
      
      if (purchaseResult.success) {
        await supabase.from('carbon_offsets').insert({
          user_id: userId,
          co2_amount: co2Amount,
          credits_used: creditsNeeded,
          source,
          method: 'marketplace_purchase',
          cost
        });

        return { success: true, credits_used: creditsNeeded, cost };
      }

      return { success: false, credits_used: 0, cost: 0 };
    }
  }

  private async updateUserCarbonBalance(userId: string, creditChange: number): Promise<void> {
    const { error } = await supabase.rpc('update_carbon_balance', {
      p_user_id: userId,
      p_credit_change: creditChange
    });

    if (error) throw error;
  }

  private async lockUserCredits(userId: string, amount: number): Promise<void> {
    // Implementation for locking credits during sale
    await supabase.rpc('lock_carbon_credits', {
      p_user_id: userId,
      p_amount: amount
    });
  }

  private async transferCredits(fromUserId: string, toUserId: string, amount: number): Promise<void> {
    await this.updateUserCarbonBalance(fromUserId, -amount);
    await this.updateUserCarbonBalance(toUserId, amount);
  }

  private async processMarketplacePayment(
    buyerId: string,
    sellerId: string,
    amount: number,
    credits: number
  ): Promise<{ success: boolean; transaction_id?: string; error?: string }> {
    // Integration with existing payment service
    // Mock implementation
    return { success: true, transaction_id: 'tx_' + Date.now() };
  }

  private async getAverageMarketPrice(): Promise<number> {
    const { data } = await supabase
      .from('carbon_market_listings')
      .select('price_per_credit')
      .eq('status', 'active')
      .limit(10);

    if (!data || data.length === 0) return 0.05; // Default price

    const average = data.reduce((sum, listing) => sum + listing.price_per_credit, 0) / data.length;
    return average;
  }

  private async autoPurchaseCredits(userId: string, creditsNeeded: number): Promise<{ success: boolean }> {
    // Auto-purchase logic from cheapest listings
    const listings = await this.getMarketplaceListings(10);
    let creditsRemaining = creditsNeeded;

    for (const listing of listings) {
      if (creditsRemaining <= 0) break;

      const creditsToBuy = Math.min(creditsRemaining, listing.credits_amount);
      const result = await this.buyCredits(userId, listing.id);

      if (result.success) {
        creditsRemaining -= creditsToBuy;
      }
    }

    return { success: creditsRemaining === 0 };
  }

  private calculateEnvironmentalImpact(co2Saved: number): string {
    if (co2Saved < 10) return 'Getting started on your green journey! 🌱';
    if (co2Saved < 50) return 'Making a positive impact! 🌿';
    if (co2Saved < 100) return 'Eco warrior in action! 🌳';
    if (co2Saved < 500) return 'Environmental champion! 🏆';
    return 'Planet hero! You\'ve saved the equivalent of planting trees! 🌍';
  }

  // Corporate carbon offset programs
  async createCorporateOffsetProgram(
    companyId: string,
    targetCO2: number,
    budget: number
  ): Promise<{ program_id: string; estimated_credits: number }> {
    const estimatedCredits = Math.ceil(targetCO2 * 10);
    const averagePrice = await this.getAverageMarketPrice();
    const estimatedCost = estimatedCredits * averagePrice;

    if (estimatedCost > budget) {
      throw new Error('Budget insufficient for target CO2 offset');
    }

    const program = {
      company_id: companyId,
      target_co2: targetCO2,
      budget,
      estimated_credits: estimatedCredits,
      status: 'active'
    };

    const { data, error } = await supabase
      .from('corporate_offset_programs')
      .insert(program)
      .select('id')
      .single();

    if (error) throw error;

    return { program_id: data.id, estimated_credits: estimatedCredits };
  }
}

export const carbonCreditService = new CarbonCreditService();