/**
 * Economic Lifecycle Service
 * Implements Bass Diffusion Model for ride-sharing apps
 * 
 * Bass Model: dN/dt = p(M - N(t)) + q * (N(t)/M) * (M - N(t))
 * 
 * Where:
 * - N(t): Cumulative adopters at time t
 * - M: Market potential (addressable market)
 * - p: Coefficient of innovation (~0.02 for ride-sharing, innovation-driven)
 * - q: Coefficient of imitation (~0.40, network effects)
 * - t: Time in months
 * 
 * Simulates 4 product lifecycle phases:
 * 1. Introduction (months 1-12): Launch & early traction
 * 2. Growth (months 13-36): Hyper-scaling with network effects
 * 3. Maturity (months 37-72): Market saturation, profitability
 * 4. Decline (months 73+): Potential disruption
 */

export interface LifecycleMetrics {
  month: number;
  users: number;
  dau: number;
  revenue: number;
  profit: number;
  gmv: number; // Gross Merchandise Value
  costs: number;
  marketingSpend: number;
  arpu: number; // Average Revenue Per User
  churnRate: number;
  phase: 'introduction' | 'growth' | 'maturity' | 'decline';
  growthRate: number; // % month-over-month
  keyMetrics: {
    cac: number;
    ltv: number;
    ltvCacRatio: number;
    nrr: number;
    magicNumber: number;
  };
}

export interface BassModelConfig {
  initialUsers: number; // N0 (starting users)
  marketPotential: number; // M (addressable market)
  innovationCoefficient: number; // p (0.01-0.03 typical)
  imitationCoefficient: number; // q (0.3-0.5 typical)
  months: number; // Simulation length
  aiOptimizationMonth: number; // When AI cost reduction kicks in (default: month 13)
}

export interface LifecyclePhase {
  name: 'introduction' | 'growth' | 'maturity' | 'decline';
  monthRange: [number, number];
  characteristics: string[];
  avgGrowthRate: number;
  profitMargin: number;
}

/**
 * EconomicLifecycleService
 * Simulates ride-sharing app economic trajectory using Bass Diffusion Model
 */
class EconomicLifecycleService {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Default Bass Model configuration for ride-sharing in MENA
   */
  private defaultConfig: BassModelConfig = {
    initialUsers: 10000, // 10k initial users
    marketPotential: 50000000, // 50M addressable market (MENA region)
    innovationCoefficient: 0.02, // Marketing-driven adoption
    imitationCoefficient: 0.40, // Word-of-mouth / network effects
    months: 120, // 10 years
    aiOptimizationMonth: 13, // When AI cost reduction starts
  };

  /**
   * Lifecycle phases
   */
  private phases: LifecyclePhase[] = [
    {
      name: 'introduction',
      monthRange: [1, 12],
      characteristics: [
        'High burn rate',
        'User acquisition focus',
        'Minimal profitability',
        'Seed funding round',
      ],
      avgGrowthRate: 15,
      profitMargin: -0.8,
    },
    {
      name: 'growth',
      monthRange: [13, 36],
      characteristics: [
        'Explosive revenue growth',
        'Network effects amplify value',
        'Driver incentives to reduce churn',
        'Expansion to intercity routes',
        'Series A/B funding',
      ],
      avgGrowthRate: 25,
      profitMargin: 0.15,
    },
    {
      name: 'maturity',
      monthRange: [37, 72],
      characteristics: [
        'Market saturation',
        'Steady profits',
        'Focus on retention & diversification',
        'Subscription models & loyalty programs',
      ],
      avgGrowthRate: 10,
      profitMargin: 0.40,
    },
    {
      name: 'decline',
      monthRange: [73, 120],
      characteristics: [
        'Potential disruption by competitors',
        'Revenue decline if not innovating',
        'Harvest profits or pivot',
        'Acquisition/merger candidates',
      ],
      avgGrowthRate: 2,
      profitMargin: 0.25,
    },
  ];

  /**
   * Bass Diffusion Model ODE solver
   * Uses Euler method for numerical integration
   * dN/dt = p(M - N) + q*(N/M)*(M - N)
   */
  private bassModel(t: number, N: number, config: BassModelConfig): number {
    const { innovationCoefficient: p, imitationCoefficient: q, marketPotential: M } = config;
    const innovation = p * (M - N);
    const imitation = q * (N / M) * (M - N);
    return innovation + imitation;
  }

  /**
   * Calculate costs (fixed + variable + marketing)
   * Includes AI optimization (20% cost reduction from month 13)
   */
  private calculateCosts(
    users: number,
    month: number,
    config: BassModelConfig,
    marketingSpend: number
  ): number {
    const fixedCosts = 500000; // $500k/month (ops, salaries, infrastructure)
    const variableCostPerUser = 2; // $2 per active user per month (drivers, support)
    const variableCosts = users * variableCostPerUser;

    // AI optimization reduces costs by 20% from month 13 onwards
    const aiReductionFactor = month >= config.aiOptimizationMonth ? 0.8 : 1.0;

    return (fixedCosts + variableCosts) * aiReductionFactor + marketingSpend;
  }

  /**
   * Calculate revenue with network effects
   * ARPU increases with scale due to network effects (more drivers = better prices = higher demand)
   */
  private calculateRevenue(users: number, arpu: number): number {
    // Network effect: ARPU scales with log of user base
    const networkEffectMultiplier = 1 + Math.log10(Math.max(users, 100)) / 10;
    return users * arpu * networkEffectMultiplier;
  }

  /**
   * Calculate GMV (Gross Merchandise Value)
   * GMV = number of trips * average trip price
   */
  private calculateGMV(users: number, tripsPerUserPerMonth: number, avgTripPrice: number): number {
    return users * tripsPerUserPerMonth * avgTripPrice;
  }

  /**
   * Simulate economic lifecycle
   */
  simulateLifecycle(customConfig?: Partial<BassModelConfig>): LifecycleMetrics[] {
    const config = { ...this.defaultConfig, ...customConfig };
    const results: LifecycleMetrics[] = [];

    let N = config.initialUsers; // Current users
    let marketingSpend = 100000; // Initial marketing spend ($100k)
    let previousMonthUsers = config.initialUsers;
    let previousMonthRevenue = 0;

    // Base ARPU for ride-sharing
    let baseArpu = 30; // $30 average monthly ARPU (assumes 5 trips @ $6 avg per trip)

    for (let month = 1; month <= config.months; month++) {
      // Solve Bass ODE for this month
      const dt = 1; // 1 month timestep
      const dN = this.bassModel(month, N, config);
      N = Math.max(0, N + dN * dt); // Ensure non-negative

      // DAU estimation (30-40% of MAU)
      const dau = Math.floor(N * 0.35);

      // Churn rate (decreases with scale due to network effects)
      const churnRate = 5 / Math.sqrt(Math.max(month, 1));

      // ARPU growth (increases with platform maturity)
      const arpu = baseArpu * (1 + (month / 12) * 0.1); // +10% ARPU per year

      // Marketing spend strategy:
      // - Introduction: Heavy spend (20% of revenue)
      // - Growth: 15% of revenue
      // - Maturity: 10% of revenue
      // - Decline: 5% of revenue
      const phase = this.getPhase(month);
      let marketingPercentage = 0.20;
      if (phase === 'growth') marketingPercentage = 0.15;
      else if (phase === 'maturity') marketingPercentage = 0.10;
      else if (phase === 'decline') marketingPercentage = 0.05;

      // Revenue calculation
      const revenue = this.calculateRevenue(N, arpu);
      marketingSpend = revenue * marketingPercentage;

      // GMV
      const tripsPerUserPerMonth = 8;
      const avgTripPrice = arpu / tripsPerUserPerMonth;
      const gmv = this.calculateGMV(N, tripsPerUserPerMonth, avgTripPrice);

      // Costs
      const costs = this.calculateCosts(N, month, config, marketingSpend);

      // Profit
      const profit = revenue - costs;

      // Growth rate
      const growthRate = previousMonthUsers > 0 
        ? ((N - previousMonthUsers) / previousMonthUsers) * 100 
        : 0;

      // Key metrics
      const cac = marketingSpend > 0 ? marketingSpend / Math.max(N - previousMonthUsers, 1) : 0;
      const ltv = arpu * 12 * (1 / Math.max(churnRate, 0.01));
      const ltvCacRatio = cac > 0 ? ltv / cac : 0;
      const nrr = month > 1 ? (revenue / previousMonthRevenue) * 100 : 100;
      const magicNumber = month > 1 
        ? ((revenue - previousMonthRevenue) * 4) / (marketingSpend || 1)
        : 0;

      results.push({
        month,
        users: Math.floor(N),
        dau,
        revenue: Math.round(revenue),
        profit: Math.round(profit),
        gmv: Math.round(gmv),
        costs: Math.round(costs),
        marketingSpend: Math.round(marketingSpend),
        arpu: Math.round(arpu * 100) / 100,
        churnRate: Math.round(churnRate * 100) / 100,
        phase,
        growthRate: Math.round(growthRate * 100) / 100,
        keyMetrics: {
          cac: Math.round(cac * 100) / 100,
          ltv: Math.round(ltv * 100) / 100,
          ltvCacRatio: Math.round(ltvCacRatio * 100) / 100,
          nrr: Math.round(nrr * 100) / 100,
          magicNumber: Math.round(magicNumber * 100) / 100,
        },
      });

      previousMonthUsers = N;
      previousMonthRevenue = revenue;
    }

    if (this.isDevelopment) {
      console.log('[EconomicLifecycle] Simulation complete:', {
        months: config.months,
        finalUsers: Math.floor(N),
        totalProfit: results.reduce((sum, m) => sum + m.profit, 0),
      });
    }

    return results;
  }

  /**
   * Get lifecycle phase for a given month
   */
  private getPhase(month: number): 'introduction' | 'growth' | 'maturity' | 'decline' {
    if (month <= 12) return 'introduction';
    if (month <= 36) return 'growth';
    if (month <= 72) return 'maturity';
    return 'decline';
  }

  /**
   * Get phase characteristics
   */
  getPhaseCharacteristics(phase: 'introduction' | 'growth' | 'maturity' | 'decline'): LifecyclePhase {
    return this.phases.find(p => p.name === phase) || this.phases[0];
  }

  /**
   * Extract summary for each phase
   */
  getSummaryByPhase(lifecycle: LifecycleMetrics[]): Record<string, {
    avgUsers: number;
    avgRevenue: number;
    avgProfit: number;
    avgGrowthRate: number;
    totalMonths: number;
    totalProfit: number;
  }> {
    const summary: any = {};

    this.phases.forEach(phase => {
      const phaseData = lifecycle.filter(
        m => m.month >= phase.monthRange[0] && m.month <= phase.monthRange[1]
      );

      if (phaseData.length > 0) {
        const totalProfit = phaseData.reduce((sum, m) => sum + m.profit, 0);
        const avgUsers = phaseData.reduce((sum, m) => sum + m.users, 0) / phaseData.length;
        const avgRevenue = phaseData.reduce((sum, m) => sum + m.revenue, 0) / phaseData.length;
        const avgProfit = totalProfit / phaseData.length;
        const avgGrowthRate = phaseData.reduce((sum, m) => sum + m.growthRate, 0) / phaseData.length;

        summary[phase.name] = {
          avgUsers: Math.round(avgUsers),
          avgRevenue: Math.round(avgRevenue),
          avgProfit: Math.round(avgProfit),
          avgGrowthRate: Math.round(avgGrowthRate * 100) / 100,
          totalMonths: phaseData.length,
          totalProfit: Math.round(totalProfit),
        };
      }
    });

    return summary;
  }

  /**
   * Get recommendations for each phase
   */
  getPhaseRecommendations(phase: 'introduction' | 'growth' | 'maturity' | 'decline'): string[] {
    const recommendations: Record<string, string[]> = {
      introduction: [
        '🎯 Focus: User acquisition at any cost ratio',
        '💰 Seek seed funding ($1-3M)',
        '🤝 Build partnerships with local taxi operators',
        '🔒 Implement biometrics and blockchain for trust',
        '♻️ Multi-modal integration (bikes/scooters) for user base',
        '📱 Optimize for mobile (70% of users on 3G/4G)',
      ],
      growth: [
        '📊 Leverage data analytics for demand forecasting',
        '🚗 Implement driver incentive programs to reduce churn',
        '🌍 Expand to intercity routes (Amman ↔ Aqaba)',
        '🤖 Deploy AI/ML for 60-70% destination prediction accuracy',
        '🛣️ Route optimization: reduce idle time by 20%',
        '🚙 Begin AV integration pilots (autonomous vehicles)',
      ],
      maturity: [
        '👥 Focus on retention via loyalty programs',
        '💳 Introduce subscription models',
        '📦 Add delivery services as add-ons',
        '🌐 Monitor NRR (>120% = expansion revenue)',
        '🔄 Diversify service offerings (insurance, financing)',
        '🎁 Implement advanced referral mechanics',
      ],
      decline: [
        '💡 Innovate or pivot to adjacent markets',
        '🤝 Explore M&A (acquisition targets)',
        '💰 Harvest profits and reduce costs',
        '🔒 Invest in fraud prevention & analytics',
        '🌱 Test new markets or customer segments',
        '🚀 Consider quantum tech for complex optimizations',
      ],
    };

    return recommendations[phase] || [];
  }

  /**
   * Calculate break-even point
   */
  findBreakEvenMonth(lifecycle: LifecycleMetrics[]): number | null {
    for (let i = 0; i < lifecycle.length; i++) {
      if (lifecycle[i].profit >= 0) {
        return lifecycle[i].month;
      }
    }
    return null;
  }

  /**
   * Compare to benchmarks
   */
  compareToMENABenchmarks(lifecycle: LifecycleMetrics[], month: number) {
    const monthData = lifecycle.find(m => m.month === month);
    if (!monthData) return null;

    const benchmarks = {
      // Month 12 (end of introduction)
      month12: {
        users: 100000,
        revenue: 1000000,
      },
      // Month 24 (growth phase)
      month24: {
        users: 500000,
        revenue: 5000000,
        momUserGrowth: 35, // 35% MoM
      },
      // Month 36 (end of growth)
      month36: {
        users: 2000000,
        revenue: 20000000,
        momUserGrowth: 20,
      },
    };

    return {
      actual: monthData,
      benchmarks,
      comparison: {
        usersVsBenchmark: monthData.users / (benchmarks[`month${month}` as keyof typeof benchmarks]?.users || 1),
        revenueVsBenchmark: monthData.revenue / (benchmarks[`month${month}` as keyof typeof benchmarks]?.revenue || 1),
      },
    };
  }
}

export const economicLifecycleService = new EconomicLifecycleService();
