import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Target, Users, DollarSign, Zap } from 'lucide-react';
import { growthMetricsService, GrowthMetrics, RetentionMetrics } from '../../services/growthMetrics';

interface GrowthMetricsDashboardProps {
  metrics: GrowthMetrics;
  historicalData?: Array<{ month: string; dau: number; mau: number; revenue: number; users: number }>;
}

export function GrowthMetricsDashboard({ metrics, historicalData = [] }: GrowthMetricsDashboardProps) {
  const benchmarks = growthMetricsService.getBenchmarks();
  const healthCheck = growthMetricsService.isInGrowthPhase(metrics);
  const recommendations = growthMetricsService.getRecommendations(metrics);

  const getMetricColor = (value: number, target: number, isHigherBetter: boolean = true): string => {
    if (isHigherBetter) {
      if (value >= target) return 'text-green-600';
      if (value >= target * 0.8) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value <= target) return 'text-green-600';
      if (value <= target * 1.2) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getMetricBg = (value: number, target: number, isHigherBetter: boolean = true): string => {
    if (isHigherBetter) {
      if (value >= target) return 'bg-green-50';
      if (value >= target * 0.8) return 'bg-yellow-50';
      return 'bg-red-50';
    } else {
      if (value <= target) return 'bg-green-50';
      if (value <= target * 1.2) return 'bg-yellow-50';
      return 'bg-red-50';
    }
  };

  const retentionData = [
    { day: 'D1', retention: metrics.retention.d1 },
    { day: 'D7', retention: metrics.retention.d7 },
    { day: 'D30', retention: metrics.retention.d30 },
    { day: 'D60', retention: metrics.retention.d60 },
    { day: 'D90', retention: metrics.retention.d90 },
  ];

  const acquisitionData = [
    { metric: 'CAC', value: metrics.acquisition.cac },
    { metric: 'LTV', value: metrics.acquisition.ltv },
    { metric: 'K-Factor', value: metrics.acquisition.kFactor * 100 }, // Scale up for visibility
  ];

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <Card className={`border-2 ${healthCheck.score >= 70 ? 'border-green-300' : healthCheck.score >= 40 ? 'border-yellow-300' : 'border-red-300'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Growth Phase Health Check
              </CardTitle>
              <CardDescription>
                {healthCheck.isInGrowthPhase ? '✅ In Growth Phase' : '⚠️ Not yet in growth phase'}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getMetricColor(healthCheck.score, 70)}`}>
                {healthCheck.score.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">{healthCheck.score >= 5 ? '5+' : healthCheck.score.toFixed(0)} metrics met</p>
            </div>
          </div>
        </CardHeader>
        {healthCheck.issues.length > 0 && (
          <CardContent>
            <div className="space-y-2">
              {healthCheck.issues.map((issue, idx) => (
                <div key={idx} className="flex gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{issue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Core Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {/* DAU/MAU Ratio */}
        <Card className={getMetricBg(metrics.dauMauRatio, benchmarks.targetDauMauRatio)}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">DAU/MAU Ratio</span>
                <Badge variant="outline">Stickiness</Badge>
              </div>
              <div className={`text-3xl font-bold ${getMetricColor(metrics.dauMauRatio, benchmarks.targetDauMauRatio)}`}>
                {metrics.dauMauRatio.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Target: {benchmarks.targetDauMauRatio.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* MoM User Growth */}
        <Card className={getMetricBg(metrics.momUserGrowth, benchmarks.targetMomUserGrowth)}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">MoM User Growth</span>
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className={`text-3xl font-bold ${getMetricColor(metrics.momUserGrowth, benchmarks.targetMomUserGrowth)}`}>
                {metrics.momUserGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Target: {benchmarks.targetMomUserGrowth.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* LTV:CAC Ratio */}
        <Card className={getMetricBg(metrics.acquisition.ltvCacRatio, benchmarks.targetLtvCacRatio)}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">LTV:CAC</span>
                <DollarSign className="h-4 w-4" />
              </div>
              <div className={`text-3xl font-bold ${getMetricColor(metrics.acquisition.ltvCacRatio, benchmarks.targetLtvCacRatio)}`}>
                {metrics.acquisition.ltvCacRatio.toFixed(1)}x
              </div>
              <p className="text-xs text-muted-foreground">Target: &gt;{benchmarks.targetLtvCacRatio.toFixed(1)}x</p>
            </div>
          </CardContent>
        </Card>

        {/* K-Factor */}
        <Card className={getMetricBg(metrics.acquisition.kFactor, benchmarks.targetKFactor)}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">K-Factor (Viral)</span>
                <Users className="h-4 w-4" />
              </div>
              <div className={`text-3xl font-bold ${getMetricColor(metrics.acquisition.kFactor, benchmarks.targetKFactor)}`}>
                {metrics.acquisition.kFactor.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Target: &gt;{benchmarks.targetKFactor.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Retention Curve */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Curve (Cohort Analysis)</CardTitle>
          <CardDescription>What % of users stay active after N days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="retention" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Retention %"
                dot={{ r: 4 }}
              />
              {/* Benchmark line */}
              <Line 
                type="monotone" 
                dataKey={() => benchmarks.targetD30Retention * 100}
                stroke="#ef4444"
                strokeDasharray="5 5"
                name="D30 Target (25%)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Acquisition Metrics */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">CAC (Customer Acquisition Cost)</p>
                <p className="text-2xl font-bold">${metrics.acquisition.cac.toFixed(0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">LTV (Lifetime Value)</p>
                <p className="text-2xl font-bold">${metrics.acquisition.ltv.toFixed(0)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Payback Period</p>
                <p className="text-2xl font-bold">{metrics.acquisition.paybackMonths.toFixed(1)} months</p>
                <p className="text-xs text-muted-foreground">Target: &lt;6 months</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Organic Acquisition</p>
                <p className="text-2xl font-bold">{Math.max(0, metrics.acquisition.organicPercentage).toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Magic Number</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.magicNumber, 1)}`}>
                  {metrics.magicNumber.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;0.75</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Burn Multiple</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.burnMultiple, 1.5, false)}`}>
                  {metrics.burnMultiple.toFixed(2)}x
                </p>
                <p className="text-xs text-muted-foreground">Target: &lt;1.5x</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">NRR</p>
                <p className={`text-2xl font-bold ${getMetricColor(metrics.nrr, 120)}`}>
                  {metrics.nrr.toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Target: &gt;120%</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Market Penetration</p>
                <p className="text-2xl font-bold">{metrics.marketPenetration.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="flex-shrink-0">{rec.split(':')[0]}</span>
                <span className="text-muted-foreground">{rec.split(':')[1]}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Historical Trends */}
      {historicalData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Growth Trajectory</CardTitle>
            <CardDescription>Historical user & revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" label={{ value: 'Users', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($K)', angle: 90, position: 'insideRight' }} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="users" fill="#3b82f6" name="Users" />
                <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue ($K)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
