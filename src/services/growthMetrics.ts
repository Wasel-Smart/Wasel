/**
 * Growth Metrics Service
 * Calculates key performance indicators for ride-sharing growth:
 * DAU/MAU, MoM growth, retention curves, LTV:CAC, K-factor, etc.
 * 
 * Based on:
 * - Sequoia/Y Combinator growth metrics frameworks
 * - Jordan/MENA-specific 2026 benchmarks
 * - Uber/Careem growth patterns
 */

export interface DailyMetrics {
  date: Date;
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users (30-day rolling)
  newUsers: number;
  churnedUsers: number;
  revenue: number;
  gmv: number; // Gross Merchandise Value
  trips: number;
  averageRating: number;
}

export interface RetentionMetrics {
  d1: number; // Day 1 retention (%)
  d7: number; // Day 7 retention (%)
  d30: number; // Day 30 retention (%)
  d60: number; // Day 60 retention (%)
  d90: number; // Day 90 retention (%)
}

export interface AcquisitionMetrics {
  cac: number; // Customer Acquisition Cost
  ltv: number; // Lifetime Value
  ltvCacRatio: number; // Payback period indicator
  paybackMonths: number;
  kFactor: number; // Viral coefficient (0-3, >1 is viral)
  organicPercentage: number; // % of users from organic/referral
}

export interface GrowthMetrics {
  // Core growth
  dauMauRatio: number; // Stickiness (>40% = strong, >60% = viral)
  momUserGrowth: number; // Month-over-month user growth (%)
  momRevenueGrowth: number; // Month-over-month revenue growth (%)
  
  // Retention
  retention: RetentionMetrics;
  
  // Acquisition
  acquisition: AcquisitionMetrics;
  
  // Efficiency
  magicNumber: number; // (Q_Revenue - Q-1_Revenue) * 4 / S&M spend
  burnMultiple: number; // Net burn / Net new ARR
  nrr: number; // Net Revenue Retention (>120% = amazing)
  
  // Market size
  marketPenetration: number; // % of addressable market
  addressableMarket: number; // Total TAM
}

export interface MonthlyCohort {
  cohortMonth: string;
  cohortSize: number;
  d0: number;
  d1: number;
  d7: number;
  d30: number;
  d60: number;
  d90: number;
}

/**
 * GrowthMetricsService
 * Calculates all critical SaaS/marketplace growth metrics
 */
class GrowthMetricsService {
  private isDevelopment = import.meta.env.DEV;
  
  // Jordan/MENA 2026 Benchmarks
  private benchmarks = {
    targetDauMauRatio: 0.45, // 45% = strong
    targetMomUserGrowth: 0.35, // 35% MoM = healthy
    targetMomRevenueGrowth: 0.50, // 50% MoM = excellent
    targetD1Retention: 0.55, // 55%
    targetD7Retention: 0.35, // 35%
    targetD30Retention: 0.25, // 25% = world-class
    targetLtvCacRatio: 3.5, // 3.5x
    targetKFactor: 0.75, // With paid marketing
    targetMagicNumber: 0.75, // Good efficiency
    targetNrr: 1.20, // 120% = amazing
    targetPaybackMonths: 6, // <6 months ideal
  };

  /**
   * Calculate DAU/MAU ratio (stickiness indicator)
   * >40% = very strong, >60% = viral/addictive
   */
  calculateDauMauRatio(dau: number, mau: number): number {
    if (mau === 0) return 0;
    return (dau / mau) * 100;
  }

  /**
   * Calculate Month-over-Month growth
   * >20% = healthy, >50% = hyper-growth
   */
  calculateMomGrowth(currentMonth: number, previousMonth: number): number {
    if (previousMonth === 0) return 0;
    return ((currentMonth - previousMonth) / previousMonth) * 100;
  }

  /**
   * Calculate retention metrics from cohort data
   * Measures what % of cohort is still active after N days
   */
  calculateRetention(
    cohortSize: number,
    activeAtDay: { d1: number; d7: number; d30: number; d60: number; d90: number }
  ): RetentionMetrics {
    return {
      d1: (activeAtDay.d1 / cohortSize) * 100,
      d7: (activeAtDay.d7 / cohortSize) * 100,
      d30: (activeAtDay.d30 / cohortSize) * 100,
      d60: (activeAtDay.d60 / cohortSize) * 100,
      d90: (activeAtDay.d90 / cohortSize) * 100,
    };
  }

  /**
   * Calculate Customer Acquisition Cost (CAC)
   * CAC = (Sales & Marketing Spend) / (New Customers Acquired)
   */
  calculateCAC(marketingSpend: number, newCustomers: number): number {
    if (newCustomers === 0) return 0;
    return marketingSpend / newCustomers;
  }

  /**
   * Calculate Lifetime Value (LTV)
   * Simplified: LTV = ARPU * Gross Margin * (1 / Monthly Churn Rate)
   */
  calculateLTV(
    arpu: number, // Average Revenue Per User (monthly)
    grossMargin: number, // % (0.60 = 60%)
    monthlyChurnRate: number // % (0.05 = 5%)
  ): number {
    if (monthlyChurnRate === 0) return arpu * grossMargin * 100; // Assume 100 months if no churn
    const lifespan = 1 / monthlyChurnRate;
    return arpu * grossMargin * lifespan;
  }

  /**
   * Calculate LTV:CAC Ratio
   * Ideal: >3x (break-even ~10 months)
   * >5x = excellent
   */
  calculateLtvCacRatio(ltv: number, cac: number): number {
    if (cac === 0) return 0;
    return ltv / cac;
  }

  /**
   * Calculate payback period in months
   * Payback = CAC / (ARPU * Gross Margin)
   */
  calculatePaybackMonths(cac: number, arpu: number, grossMargin: number): number {
    const monthlyProfit = arpu * grossMargin;
    if (monthlyProfit === 0) return Infinity;
    return cac / monthlyProfit;
  }

  /**
   * Calculate K-factor (viral coefficient)
   * K = (Invitations Sent per User) × (Conversion Rate)
   * K > 1.0 = truly viral
   * K = 0.7-0.9 + paid marketing = excellent
   */
  calculateKFactor(
    invitationsSentPerUser: number,
    conversionRate: number // % (0.15 = 15%)
  ): number {
    return invitationsSentPerUser * (conversionRate / 100);
  }

  /**
   * Calculate Magic Number (sales efficiency)
   * Magic = (Q Revenue - Q-1 Revenue) × 4 / Previous Quarter S&M Spend
   * 1.0 = excellent, 0.75 = good, >1.5 = elite
   */
  calculateMagicNumber(
    currentQuarterRevenue: number,
    previousQuarterRevenue: number,
    previousQuarterSmSpend: number
  ): number {
    if (previousQuarterSmSpend === 0) return 0;
    const quarterlyGrowth = currentQuarterRevenue - previousQuarterRevenue;
    return (quarterlyGrowth * 4) / previousQuarterSmSpend;
  }

  /**
   * Calculate Net Revenue Retention (NRR)
   * For subscription apps: (Revenue from existing customers / Previous month revenue)
   * >120% = amazing (growth from expansion, not just new customers)
   */
  calculateNRR(
    startingMRR: number,
    endingMRR: number,
    newCustomerMRR: number
  ): number {
    if (startingMRR === 0) return 0;
    // NRR = (Ending MRR + Churn) / Starting MRR
    // Simplified: NRR = Ending MRR / Starting MRR
    return (endingMRR / startingMRR) * 100;
  }

  /**
   * Calculate Burn Multiple (efficiency of burn vs revenue)
   * Burn Multiple = Net Burn / Net New ARR
   * <1.5x = elite tier
   * <2x = good
   * >3x = unsustainable
   */
  calculateBurnMultiple(netBurn: number, netNewArr: number): number {
    if (netNewArr === 0) return Infinity;
    return netBurn / netNewArr;
  }

  /**
   * Comprehensive growth metrics calculation
   */
  calculateAllMetrics(data: {
    dau: number;
    mau: number;
    currentMonthUsers: number;
    previousMonthUsers: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    cohortRetention: RetentionMetrics;
    marketingSpend: number;
    newCustomers: number;
    arpu: number;
    grossMargin: number;
    monthlyChurnRate: number;
    invitationsSentPerUser: number;
    referralConversionRate: number;
    quarterRevenue: number;
    previousQuarterRevenue: number;
    previousQuarterSmSpend: number;
    startingMrr: number;
    endingMrr: number;
    netBurn: number;
    netNewArr: number;
    addressableMarket: number;
  }): GrowthMetrics {
    const cac = this.calculateCAC(data.marketingSpend, data.newCustomers);
    const ltv = this.calculateLTV(data.arpu, data.grossMargin, data.monthlyChurnRate);
    const ltvCacRatio = this.calculateLtvCacRatio(ltv, cac);
    const paybackMonths = this.calculatePaybackMonths(cac, data.arpu, data.grossMargin);

    return {
      dauMauRatio: this.calculateDauMauRatio(data.dau, data.mau),
      momUserGrowth: this.calculateMomGrowth(data.currentMonthUsers, data.previousMonthUsers),
      momRevenueGrowth: this.calculateMomGrowth(data.currentMonthRevenue, data.previousMonthRevenue),
      
      retention: data.cohortRetention,
      
      acquisition: {
        cac,
        ltv,
        ltvCacRatio,
        paybackMonths,
        kFactor: this.calculateKFactor(data.invitationsSentPerUser, data.referralConversionRate),
        organicPercentage: (data.newCustomers - (data.marketingSpend / cac)) / data.newCustomers * 100,
      },
      
      magicNumber: this.calculateMagicNumber(
        data.quarterRevenue,
        data.previousQuarterRevenue,
        data.previousQuarterSmSpend
      ),
      
      burnMultiple: this.calculateBurnMultiple(data.netBurn, data.netNewArr),
      
      nrr: this.calculateNRR(data.startingMrr, data.endingMrr, data.newCustomers * data.arpu),
      
      marketPenetration: (data.mau / data.addressableMarket) * 100,
      addressableMarket: data.addressableMarket,
    };
  }

  /**
   * Get benchmarks for Jordan/MENA 2026
   */
  getBenchmarks() {
    return this.benchmarks;
  }

  /**
   * Health check: Are you in growth phase?
   * Returns true if meeting at least 5 critical metrics
   */
  isInGrowthPhase(metrics: GrowthMetrics): {
    isInGrowthPhase: boolean;
    score: number;
    issues: string[];
  } {
    const checks = [];
    const issues: string[] = [];

    // Check 1: MoM user growth >25% for 3+ months (need historical data for full check)
    if (metrics.momUserGrowth > 25) {
      checks.push(true);
    } else {
      issues.push(`MoM user growth ${metrics.momUserGrowth.toFixed(1)}% < 25% target`);
    }

    // Check 2: D30 retention >20%
    if (metrics.retention.d30 > 20) {
      checks.push(true);
    } else {
      issues.push(`D30 retention ${metrics.retention.d30.toFixed(1)}% < 20% target`);
    }

    // Check 3: LTV/CAC >3x
    if (metrics.acquisition.ltvCacRatio > 3) {
      checks.push(true);
    } else {
      issues.push(`LTV:CAC ratio ${metrics.acquisition.ltvCacRatio.toFixed(2)}x < 3x target`);
    }

    // Check 4: CAC is stable or decreasing (need historical for full check)
    checks.push(true); // Placeholder

    // Check 5: K-factor >0.6
    if (metrics.acquisition.kFactor > 0.6) {
      checks.push(true);
    } else {
      issues.push(`K-factor ${metrics.acquisition.kFactor.toFixed(2)} < 0.6 target`);
    }

    // Check 6: Revenue growing faster than users
    if (metrics.momRevenueGrowth > metrics.momUserGrowth) {
      checks.push(true);
    } else {
      issues.push(`Revenue growth ${metrics.momRevenueGrowth.toFixed(1)}% <= user growth ${metrics.momUserGrowth.toFixed(1)}%`);
    }

    // Check 7: DAU/MAU >40% (stickiness)
    if (metrics.dauMauRatio > 40) {
      checks.push(true);
    } else {
      issues.push(`DAU/MAU ${metrics.dauMauRatio.toFixed(1)}% < 40% target`);
    }

    const score = (checks.length / 7) * 100;
    const isInGrowthPhase = checks.length >= 5;

    if (this.isDevelopment) {
      console.log('[GrowthMetrics] Health Check:', { isInGrowthPhase, score, issues });
    }

    return { isInGrowthPhase, score, issues };
  }

  /**
   * Get recommendations based on metrics
   */
  getRecommendations(metrics: GrowthMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.dauMauRatio < 40) {
      recommendations.push('🔴 CRITICAL: Improve app stickiness. Current DAU/MAU too low. Implement daily habit-forming features.');
    }

    if (metrics.retention.d30 < 15) {
      recommendations.push('🔴 CRITICAL: D30 retention alarmingly low. Redesign onboarding or core product.');
    }

    if (metrics.acquisition.ltvCacRatio < 2.5) {
      recommendations.push('🟡 HIGH: LTV:CAC ratio below 2.5x. Either increase prices/ARPU or reduce CAC.');
    }

    if (metrics.acquisition.paybackMonths > 12) {
      recommendations.push('🟡 HIGH: Payback period >12 months is unsustainable. Optimize CAC or increase ARPU.');
    }

    if (metrics.acquisition.kFactor < 0.5) {
      recommendations.push('🟡 MEDIUM: Viral coefficient weak. Strengthen referral program or word-of-mouth loop.');
    }

    if (metrics.magicNumber < 0.5) {
      recommendations.push('🟡 MEDIUM: Magic number low (<0.5). Reduce S&M spend or focus on revenue expansion.');
    }

    if (metrics.nrr < 100) {
      recommendations.push('🔵 LOW: NRR <100%. Losing customers faster than acquiring. Focus on retention.');
    }

    return recommendations.length > 0 ? recommendations : ['✅ All metrics strong. Continue current strategy.'];
  }
}

export const growthMetricsService = new GrowthMetricsService();
