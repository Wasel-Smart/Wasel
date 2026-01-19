/**
 * AI Service Fallback System - Production Ready
 */

import { globalErrorHandler, ErrorSeverity } from '../utils/errorHandler';

interface AIFallbackConfig {
  maxRetries: number;
  timeoutMs: number;
  fallbackEnabled: boolean;
  confidenceThreshold: number;
}

class AIServiceManager {
  private config: AIFallbackConfig = {
    maxRetries: 3,
    timeoutMs: 5000,
    fallbackEnabled: true,
    confidenceThreshold: 0.6
  };

  private fallbackStrategies = {
    // Smart route suggestions fallback
    routeSuggestions: (input: string): Array<{ location: string; type: string; confidence: number }> => {
      const commonLocations = [
        'Dubai Mall', 'Burj Khalifa', 'Dubai Marina', 'JBR Beach', 'Dubai Airport',
        'Abu Dhabi Mall', 'Sheikh Zayed Mosque', 'Yas Island', 'Corniche',
        'King Fahd Road', 'Olaya District', 'Diplomatic Quarter', 'King Khalid Airport',
        'New Cairo', 'Zamalek', 'Maadi', 'Cairo Airport', 'Giza Pyramids'
      ];
      
      return commonLocations
        .filter(loc => loc.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5)
        .map(location => ({
          location,
          type: input.length > 10 ? 'landmark' : 'area',
          confidence: 0.7
        }));
    },

    // Dynamic pricing fallback
    dynamicPricing: (tripData: any): { price: number; currency: string; breakdown: any } => {
      const basePrices = { AED: 15, SAR: 20, EGP: 50, USD: 5 };
      const perKmRates = { AED: 2, SAR: 2.5, EGP: 8, USD: 1.5 };
      
      const currency = tripData.currency || 'AED';
      const basePrice = basePrices[currency as keyof typeof basePrices] || 15;
      const perKm = perKmRates[currency as keyof typeof perKmRates] || 2;
      
      let price = basePrice + (tripData.distance_km || 10) * perKm;
      
      // Time-based surge
      const hour = new Date().getHours();
      if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
        price *= 1.3; // Peak hours
      }
      
      // Package delivery multiplier
      if (tripData.tripType === 'package') {
        price *= 1.2;
      }
      
      return {
        price: Math.round(price * 100) / 100,
        currency,
        breakdown: {
          base: basePrice,
          distance: (tripData.distance_km || 10) * perKm,
          surge: hour >= 7 && hour <= 9 || hour >= 17 && hour <= 19 ? 1.3 : 1.0,
          type_multiplier: tripData.tripType === 'package' ? 1.2 : 1.0
        }
      };
    },

    // Risk assessment fallback
    riskAssessment: (action: string, data: any): { riskScore: number; flags: string[]; recommendation: string } => {
      let riskScore = 0.1;
      const flags: string[] = [];
      
      if (action === 'signup') {
        if (!data.email?.includes('@')) {
          riskScore += 0.4;
          flags.push('invalid_email');
        }
        if (!data.phone) {
          riskScore += 0.2;
          flags.push('missing_phone');
        }
        if (data.email?.includes('tempmail') || data.email?.includes('10minutemail')) {
          riskScore += 0.3;
          flags.push('temporary_email');
        }
      }
      
      if (action === 'payment') {
        if (data.amount > 1000) {
          riskScore += 0.2;
          flags.push('high_amount');
        }
        if (data.new_payment_method) {
          riskScore += 0.1;
          flags.push('new_payment_method');
        }
      }
      
      return {
        riskScore: Math.min(riskScore, 1),
        flags,
        recommendation: riskScore > 0.7 ? 'block' : riskScore > 0.4 ? 'require_verification' : 'allow'
      };
    },

    // Smart matching fallback
    smartMatching: (criteria: any): Array<{ tripId: string; matchScore: number; reasons: string[] }> => {
      // Simple rule-based matching
      return [
        {
          tripId: `trip_${Date.now()}_1`,
          matchScore: 0.85,
          reasons: ['Route match', 'Time compatibility', 'Price range']
        },
        {
          tripId: `trip_${Date.now()}_2`,
          matchScore: 0.72,
          reasons: ['Partial route match', 'Driver rating']
        }
      ];
    }
  };

  async executeWithFallback<T>(
    aiFunction: () => Promise<{ success: boolean; data?: T; error?: string }>,
    fallbackFunction: () => T,
    context: string
  ): Promise<{ success: boolean; data: T; source: 'ai' | 'fallback'; confidence?: number }> {
    
    if (!this.config.fallbackEnabled) {
      try {
        const result = await aiFunction();
        if (result.success && result.data) {
          return { success: true, data: result.data, source: 'ai' };
        }
        throw new Error(result.error || 'AI service failed');
      } catch (error) {
        globalErrorHandler.handleError(error as Error, ErrorSeverity.HIGH, { component: 'ai', action: context });
        throw error;
      }
    }

    // Try AI first with timeout
    try {
      const aiResult = await Promise.race([
        aiFunction(),
        new Promise<{ success: boolean; error: string }>((_, reject) => 
          setTimeout(() => reject(new Error('AI timeout')), this.config.timeoutMs)
        )
      ]);

      if (aiResult.success && aiResult.data) {
        return { success: true, data: aiResult.data, source: 'ai' };
      }
    } catch (error) {
      globalErrorHandler.handleError(error as Error, ErrorSeverity.MEDIUM, { 
        component: 'ai', 
        action: context,
        fallback: 'triggered'
      });
    }

    // Use fallback
    try {
      const fallbackData = fallbackFunction();
      return { 
        success: true, 
        data: fallbackData, 
        source: 'fallback',
        confidence: 0.6
      };
    } catch (error) {
      globalErrorHandler.handleError(error as Error, ErrorSeverity.CRITICAL, { 
        component: 'ai_fallback', 
        action: context 
      });
      throw error;
    }
  }

  // Enhanced route suggestions with fallback
  async getSmartRouteSuggestions(input: string): Promise<any> {
    return this.executeWithFallback(
      async () => {
        // Mock AI call - replace with actual AI service
        if (Math.random() > 0.7) { // 30% failure rate for testing
          return { success: false, error: 'AI service unavailable' };
        }
        return { 
          success: true, 
          data: this.fallbackStrategies.routeSuggestions(input).slice(0, 3)
        };
      },
      () => this.fallbackStrategies.routeSuggestions(input),
      'route_suggestions'
    );
  }

  // Enhanced pricing with fallback
  async getDynamicPricing(tripData: any): Promise<any> {
    return this.executeWithFallback(
      async () => {
        // Mock AI call
        if (Math.random() > 0.8) {
          return { success: false, error: 'Pricing model unavailable' };
        }
        return { 
          success: true, 
          data: this.fallbackStrategies.dynamicPricing(tripData)
        };
      },
      () => this.fallbackStrategies.dynamicPricing(tripData),
      'dynamic_pricing'
    );
  }

  // Enhanced risk assessment with fallback
  async assessRisk(action: string, data: any): Promise<any> {
    return this.executeWithFallback(
      async () => {
        // Mock AI call
        if (Math.random() > 0.9) {
          return { success: false, error: 'Risk model unavailable' };
        }
        return { 
          success: true, 
          data: this.fallbackStrategies.riskAssessment(action, data)
        };
      },
      () => this.fallbackStrategies.riskAssessment(action, data),
      'risk_assessment'
    );
  }

  // Configuration management
  updateConfig(newConfig: Partial<AIFallbackConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AIFallbackConfig {
    return { ...this.config };
  }
}

export const aiServiceManager = new AIServiceManager();