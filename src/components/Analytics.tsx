import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GrowthMetricsDashboard } from './analytics/GrowthMetricsDashboard';
import { EconomicLifecycleDashboard } from './analytics/EconomicLifecycleDashboard';
import { growthMetricsService } from '../services/growthMetrics';
import { economicLifecycleService } from '../services/economicLifecycle';
import { BarChart3, TrendingUp, PieChart, LineChart as LineChartIcon } from 'lucide-react';

/**
 * Analytics Page - Complete Growth Metrics & Economic Lifecycle
 * 
 * Features:
 * - Real-time growth metrics (DAU/MAU, MoM growth, retention, LTV:CAC)
 * - Economic lifecycle simulation (Bass Diffusion Model)
 * - MENA/Jordan market benchmarks
 * - Actionable recommendations
 */
export function Analytics() {
  const [activeTab, setActiveTab] = useState('growth-metrics');

  // Mock current metrics (replace with real data)
  const currentMetrics = useMemo(() => {
    return growthMetricsService.calculateAllMetrics({
      dau: 50000,
      mau: 120000,
      currentMonthUsers: 120000,
      previousMonthUsers: 100000,
      currentMonthRevenue: 500000,
      previousMonthRevenue: 350000,
      cohortRetention: {
        d1: 55,
        d7: 35,
        d30: 22,
        d60: 15,
        d90: 10,
      },
      marketingSpend: 80000,
      newCustomers: 20000,
      arpu: 5,
      grossMargin: 0.60,
      monthlyChurnRate: 0.05,
      invitationsSentPerUser: 2,
      referralConversionRate: 15,
      quarterRevenue: 1500000,
      previousQuarterRevenue: 1000000,
      previousQuarterSmSpend: 200000,
      startingMrr: 400000,
      endingMrr: 500000,
      netBurn: -50000, // Negative = profitable
      netNewArr: 1200000,
      addressableMarket: 50000000, // 50M for MENA
    });
  }, []);

  // Simulate lifecycle
  const lifecycleData = useMemo(() => {
    return economicLifecycleService.simulateLifecycle({
      initialUsers: 100000, // Assume we're starting this month
      marketPotential: 50000000,
      months: 120,
    });
  }, []);

  // Historical data (mock)
  const historicalData = useMemo(() => {
    const last6Months = [
      { month: 'Jun 2025', dau: 30000, mau: 80000, revenue: 250000, users: 80000 },
      { month: 'Jul 2025', dau: 35000, mau: 90000, revenue: 300000, users: 90000 },
      { month: 'Aug 2025', dau: 40000, mau: 100000, revenue: 350000, users: 100000 },
      { month: 'Sep 2025', dau: 45000, mau: 110000, revenue: 400000, users: 110000 },
      { month: 'Oct 2025', dau: 48000, mau: 115000, revenue: 450000, users: 115000 },
      { month: 'Nov 2025', dau: 50000, mau: 120000, revenue: 500000, users: 120000 },
    ];
    return last6Months;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Growth Analytics & Economic Forecasting
        </h1>
        <p className="text-muted-foreground mt-2">
          Real-time growth metrics with 10-year economic lifecycle projections using Bass Diffusion Model
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Current DAU</p>
              <p className="text-3xl font-bold">50K</p>
              <p className="text-xs text-green-600">↑ 8% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-3xl font-bold">$500K</p>
              <p className="text-xs text-green-600">↑ 43% vs last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">D30 Retention</p>
              <p className="text-3xl font-bold">22%</p>
              <p className="text-xs">vs 25% target</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Growth Health</p>
              <p className="text-3xl font-bold">71%</p>
              <p className="text-xs text-yellow-600">5/7 metrics strong</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="growth-metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Growth Metrics
          </TabsTrigger>
          <TabsTrigger value="economic-lifecycle" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Economic Lifecycle
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Benchmarks
          </TabsTrigger>
        </TabsList>

        {/* Growth Metrics Tab */}
        <TabsContent value="growth-metrics" className="space-y-6 mt-6">
          <GrowthMetricsDashboard 
            metrics={currentMetrics}
            historicalData={historicalData}
          />
        </TabsContent>

        {/* Economic Lifecycle Tab */}
        <TabsContent value="economic-lifecycle" className="space-y-6 mt-6">
          <EconomicLifecycleDashboard simulationData={lifecycleData} />
        </TabsContent>

        {/* Benchmarks Tab */}
        <TabsContent value="benchmarks" className="space-y-6 mt-6">
          <BenchmarksView metrics={currentMetrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenchmarksView({ metrics }: any) {
  const benchmarks = growthMetricsService.getBenchmarks();

  const benchmarkRows = [
    {
      metric: 'DAU/MAU Ratio (Stickiness)',
      current: `${metrics.dauMauRatio.toFixed(1)}%`,
      target: `${benchmarks.targetDauMauRatio.toFixed(1)}%`,
      status: metrics.dauMauRatio >= benchmarks.targetDauMauRatio ? '✅' : '⚠️',
      description: '>40% = strong, >60% = viral',
    },
    {
      metric: 'MoM User Growth',
      current: `${metrics.momUserGrowth.toFixed(1)}%`,
      target: `${benchmarks.targetMomUserGrowth.toFixed(1)}%`,
      status: metrics.momUserGrowth >= benchmarks.targetMomUserGrowth ? '✅' : '⚠️',
      description: '20-50% = healthy, >50% = hyper-growth',
    },
    {
      metric: 'MoM Revenue Growth',
      current: `${metrics.momRevenueGrowth.toFixed(1)}%`,
      target: `${benchmarks.targetMomRevenueGrowth.toFixed(1)}%`,
      status: metrics.momRevenueGrowth >= benchmarks.targetMomRevenueGrowth ? '✅' : '⚠️',
      description: '30-100% = rocket ship',
    },
    {
      metric: 'D30 Retention',
      current: `${metrics.retention.d30.toFixed(1)}%`,
      target: `${benchmarks.targetD30Retention.toFixed(1)}%`,
      status: metrics.retention.d30 >= benchmarks.targetD30Retention ? '✅' : '⚠️',
      description: '>25% = world-class',
    },
    {
      metric: 'LTV:CAC Ratio',
      current: `${metrics.acquisition.ltvCacRatio.toFixed(1)}x`,
      target: `${benchmarks.targetLtvCacRatio.toFixed(1)}x`,
      status: metrics.acquisition.ltvCacRatio >= benchmarks.targetLtvCacRatio ? '✅' : '⚠️',
      description: '>3x = break-even ~10 months',
    },
    {
      metric: 'K-Factor (Viral)',
      current: `${metrics.acquisition.kFactor.toFixed(2)}`,
      target: `${benchmarks.targetKFactor.toFixed(2)}`,
      status: metrics.acquisition.kFactor >= benchmarks.targetKFactor ? '✅' : '⚠️',
      description: '>1.0 = truly viral, >0.6 + paid = excellent',
    },
    {
      metric: 'Payback Period',
      current: `${metrics.acquisition.paybackMonths.toFixed(1)} mo`,
      target: `${benchmarks.targetPaybackMonths.toFixed(0)} mo`,
      status: metrics.acquisition.paybackMonths <= benchmarks.targetPaybackMonths ? '✅' : '⚠️',
      description: '<6 months = ideal, <4 = elite',
    },
    {
      metric: 'Magic Number',
      current: `${metrics.magicNumber.toFixed(2)}`,
      target: `${benchmarks.targetMagicNumber.toFixed(2)}`,
      status: metrics.magicNumber >= benchmarks.targetMagicNumber ? '✅' : '⚠️',
      description: '>0.75 = good, >1.0 = excellent',
    },
    {
      metric: 'NRR (Net Revenue Retention)',
      current: `${metrics.nrr.toFixed(0)}%`,
      target: `${benchmarks.targetNrr.toFixed(0)}%`,
      status: metrics.nrr >= benchmarks.targetNrr ? '✅' : '⚠️',
      description: '>120% = amazing expansion growth',
    },
    {
      metric: 'Burn Multiple',
      current: `${metrics.burnMultiple.toFixed(2)}x`,
      target: `<${benchmarks.targetPaybackMonths.toFixed(1)}x`,
      status: metrics.burnMultiple <= 1.5 ? '✅' : '⚠️',
      description: '<1.5x = elite, <2x = good',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Jordan/MENA 2026 Growth Benchmarks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Metric</th>
                  <th className="text-right py-2 px-2">Current</th>
                  <th className="text-right py-2 px-2">Target</th>
                  <th className="text-center py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Context</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkRows.map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{row.metric}</td>
                    <td className="text-right py-3 px-2 font-bold">{row.current}</td>
                    <td className="text-right py-3 px-2">{row.target}</td>
                    <td className="text-center py-3 px-2">{row.status}</td>
                    <td className="py-3 px-2 text-muted-foreground text-xs">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MENA Context */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>MENA Market Context (2025-2026)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm">
            <strong>Typical growth for top Jordanian apps:</strong>
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>40-100% MoM user growth for first 12-18 months</li>
            <li>D30 retention: 22-35% (versus 25% industry baseline)</li>
            <li>LTV:CAC: 3.5-5x (CAC lower but LTV also lower than US)</li>
            <li>30-70% MoM revenue growth typical for YC-level apps</li>
            <li>Break-even achievable by month 12-18 for well-funded apps</li>
          </ul>
          <p className="text-sm mt-4">
            <strong>Market size:</strong> ~50M addressable users across MENA (Egypt, Saudi, UAE, Jordan, etc.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
