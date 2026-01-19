/**
 * Rating and Review Service
 * Handles user ratings, reviews, and feedback management
 */

import { supabase } from './api';

export interface Rating {
  id: string;
  trip_id: string;
  rater_id: string;
  rated_id: string;
  rating: number; // 1-5
  review?: string;
  categories?: {
    punctuality?: number;
    cleanliness?: number;
    communication?: number;
    driving?: number;
    vehicle_condition?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UserRatingStats {
  user_id: string;
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  category_averages?: {
    punctuality?: number;
    cleanliness?: number;
    communication?: number;
    driving?: number;
    vehicle_condition?: number;
  };
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  responder_id: string;
  response: string;
  created_at: string;
}

class RatingService {
  /**
   * Submit a rating and review
   */
  async submitRating(ratingData: {
    tripId: string;
    ratedUserId: string;
    rating: number;
    review?: string;
    categories?: Rating['categories'];
  }): Promise<Rating> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Validate rating
    if (ratingData.rating < 1 || ratingData.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if rating already exists for this trip
    const { data: existingRating } = await supabase
      .from('ratings')
      .select('id')
      .eq('trip_id', ratingData.tripId)
      .eq('rater_id', user.id)
      .single();

    if (existingRating) {
      throw new Error('Rating already submitted for this trip');
    }

    // Insert rating
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        trip_id: ratingData.tripId,
        rater_id: user.id,
        rated_id: ratingData.ratedUserId,
        rating: ratingData.rating,
        review: ratingData.review,
        categories: ratingData.categories,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update user's rating statistics
    await this.updateUserRatingStats(ratingData.ratedUserId);

    return data;
  }

  /**
   * Get ratings for a user
   */
  async getUserRatings(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<Rating[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:rater_id(id, full_name, avatar_url),
        trip:trip_id(from_location, to_location, departure_date)
      `)
      .eq('rated_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user rating statistics
   */
  async getUserRatingStats(userId: string): Promise<UserRatingStats> {
    // Try to get cached stats first
    const { data: cachedStats } = await supabase
      .from('user_rating_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (cachedStats) {
      return cachedStats;
    }

    // Calculate stats if not cached
    return await this.calculateUserRatingStats(userId);
  }

  /**
   * Calculate user rating statistics
   */
  private async calculateUserRatingStats(userId: string): Promise<UserRatingStats> {
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('rating, categories')
      .eq('rated_id', userId);

    if (error) throw error;

    if (!ratings || ratings.length === 0) {
      return {
        user_id: userId,
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    // Calculate average rating
    const totalRating = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / ratings.length;

    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });

    // Calculate category averages
    const categoryAverages: UserRatingStats['category_averages'] = {};
    const categoryTotals = {
      punctuality: { sum: 0, count: 0 },
      cleanliness: { sum: 0, count: 0 },
      communication: { sum: 0, count: 0 },
      driving: { sum: 0, count: 0 },
      vehicle_condition: { sum: 0, count: 0 },
    };

    ratings.forEach(r => {
      if (r.categories) {
        Object.entries(r.categories).forEach(([category, value]) => {
          if (value && categoryTotals[category as keyof typeof categoryTotals]) {
            categoryTotals[category as keyof typeof categoryTotals].sum += value;
            categoryTotals[category as keyof typeof categoryTotals].count++;
          }
        });
      }
    });

    Object.entries(categoryTotals).forEach(([category, { sum, count }]) => {
      if (count > 0) {
        categoryAverages[category as keyof typeof categoryAverages] = sum / count;
      }
    });

    const stats: UserRatingStats = {
      user_id: userId,
      average_rating: Math.round(averageRating * 100) / 100,
      total_ratings: ratings.length,
      rating_distribution: distribution,
      category_averages: Object.keys(categoryAverages).length > 0 ? categoryAverages : undefined,
    };

    // Cache the stats
    await supabase
      .from('user_rating_stats')
      .upsert({
        ...stats,
        updated_at: new Date().toISOString(),
      });

    return stats;
  }

  /**
   * Update user rating statistics
   */
  private async updateUserRatingStats(userId: string): Promise<void> {
    await this.calculateUserRatingStats(userId);
  }

  /**
   * Get trip rating
   */
  async getTripRating(tripId: string, raterId: string): Promise<Rating | null> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('trip_id', tripId)
      .eq('rater_id', raterId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Check if user can rate another user for a trip
   */
  async canRateUser(tripId: string, raterId: string, ratedId: string): Promise<boolean> {
    // Check if trip exists and user was part of it
    const { data: trip } = await supabase
      .from('trips')
      .select(`
        id,
        driver_id,
        bookings!inner(passenger_id)
      `)
      .eq('id', tripId)
      .single();

    if (!trip) return false;

    // Check if rater was part of the trip
    const wasDriver = trip.driver_id === raterId;
    const wasPassenger = trip.bookings.some((b: any) => b.passenger_id === raterId);

    if (!wasDriver && !wasPassenger) return false;

    // Check if rated user was part of the trip
    const ratedWasDriver = trip.driver_id === ratedId;
    const ratedWasPassenger = trip.bookings.some((b: any) => b.passenger_id === ratedId);

    if (!ratedWasDriver && !ratedWasPassenger) return false;

    // Check if rating already exists
    const existingRating = await this.getTripRating(tripId, raterId);
    return !existingRating;
  }

  /**
   * Get recent reviews for a user
   */
  async getRecentReviews(
    userId: string,
    limit: number = 5
  ): Promise<(Rating & { rater_name: string; trip_route: string })[]> {
    const { data, error } = await supabase
      .from('ratings')
      .select(`
        *,
        rater:rater_id(full_name),
        trip:trip_id(from_location, to_location)
      `)
      .eq('rated_id', userId)
      .not('review', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(rating => ({
      ...rating,
      rater_name: rating.rater?.full_name || 'Anonymous',
      trip_route: rating.trip ? `${rating.trip.from_location} → ${rating.trip.to_location}` : 'Unknown route',
    }));
  }

  /**
   * Report inappropriate review
   */
  async reportReview(
    reviewId: string,
    reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'other',
    details?: string
  ): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('review_reports')
      .insert({
        review_id: reviewId,
        reporter_id: user.id,
        reason,
        details,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;
  }

  /**
   * Respond to a review (for drivers)
   */
  async respondToReview(
    reviewId: string,
    response: string
  ): Promise<ReviewResponse> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Check if user is the rated person for this review
    const { data: rating } = await supabase
      .from('ratings')
      .select('rated_id')
      .eq('id', reviewId)
      .single();

    if (!rating || rating.rated_id !== user.id) {
      throw new Error('You can only respond to reviews about you');
    }

    // Check if response already exists
    const { data: existingResponse } = await supabase
      .from('review_responses')
      .select('id')
      .eq('review_id', reviewId)
      .single();

    if (existingResponse) {
      throw new Error('Response already exists for this review');
    }

    const { data, error } = await supabase
      .from('review_responses')
      .insert({
        review_id: reviewId,
        responder_id: user.id,
        response,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get rating summary for display
   */
  getRatingSummary(stats: UserRatingStats): {
    displayRating: string;
    ratingText: string;
    totalReviews: string;
  } {
    if (stats.total_ratings === 0) {
      return {
        displayRating: 'N/A',
        ratingText: 'No ratings yet',
        totalReviews: '0 reviews',
      };
    }

    const rating = stats.average_rating;
    let ratingText = 'Good';
    
    if (rating >= 4.8) ratingText = 'Excellent';
    else if (rating >= 4.5) ratingText = 'Very Good';
    else if (rating >= 4.0) ratingText = 'Good';
    else if (rating >= 3.5) ratingText = 'Fair';
    else ratingText = 'Poor';

    return {
      displayRating: rating.toFixed(1),
      ratingText,
      totalReviews: `${stats.total_ratings} review${stats.total_ratings === 1 ? '' : 's'}`,
    };
  }

  /**
   * Get top-rated drivers
   */
  async getTopRatedDrivers(limit: number = 10): Promise<UserRatingStats[]> {
    const { data, error } = await supabase
      .from('user_rating_stats')
      .select('*')
      .gte('total_ratings', 5) // At least 5 ratings
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get rating trends for a user
   */
  async getRatingTrends(
    userId: string,
    months: number = 6
  ): Promise<{ month: string; average_rating: number; total_ratings: number }[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data, error } = await supabase
      .from('ratings')
      .select('rating, created_at')
      .eq('rated_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by month
    const monthlyData: Record<string, { sum: number; count: number }> = {};
    
    (data || []).forEach(rating => {
      const date = new Date(rating.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { sum: 0, count: 0 };
      }
      
      monthlyData[monthKey].sum += rating.rating;
      monthlyData[monthKey].count++;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      average_rating: Math.round((data.sum / data.count) * 100) / 100,
      total_ratings: data.count,
    }));
  }
}

export const ratingService = new RatingService();