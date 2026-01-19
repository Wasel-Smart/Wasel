import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { economicLifecycleService, LifecycleMetrics } from '../../services/economicLifecycle';

interface EconomicLifecycleDashboardProps {
  simulationData?: LifecycleMetrics[];
}

export function EconomicLifecycleDashboard({ simulationData }: EconomicLifecycleDashboardProps) {
  const lifecycle = useMemo(() => {
    return simulationData || economicLifecycleService.simulateLifecycle();
  }, [simulationData]);

  const summary = useMemo(() => {
    return economicLifecycleService.getSummaryByPhase(lifecycle);
  }, [lifecycle]);

  const breakEven = useMemo(() => {
    return economicLifecycleService.findBreakEvenMonth(lifecycle);
  }, [lifecycle]);

  const phaseColors = {
    introduction: '#f97316',
    growth: '#3b82f6',
    maturity: '#10b981',
    decline: '#ef4444',
  };

  // Prepare data for charts
  const chartData = lifecycle.map(m => ({
    ...m,
    usersM: m.users / 1000000, // In millions
    revenueM: m.revenue / 1000000, // In millions
    profitM: m.profit / 1000000,
  }));

  // Key metrics
  const month12 = lifecycle[11];
  const month24 = lifecycle[23];
  const month36 = lifecycle[35];
  const final = lifecycle[lifecycle.length - 1];

  return (
    <div className="space-y-6">
      {/* Lifecycle Phases Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        {Object.entries(summary).map(([phaseName, metrics]) => (
          <Card key={phaseName} className="border-2" style={{ borderColor: phaseColors[phaseName as keyof typeof phaseColors] + '40' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="capitalize">{phaseName} Phase</CardTitle>
                <Badge style={{ backgroundColor: phaseColors[phaseName as keyof typeof phaseColors] }}>
                  {metrics.totalMonths} months
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Avg Users</p>
                  <p className="text-lg font-bold">{(metrics.avgUsers / 1000000).toFixed(2)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Revenue</p>
                  <p className="text-lg font-bold">${(metrics.avgRevenue / 1000000).toFixed(1)}M</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Avg Profit</p>
                  <p className={`text-lg font-bold ${metrics.avgProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(metrics.avgProfit / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Growth Rate</p>
                  <p className="text-lg font-bold">{metrics.avgGrowthRate.toFixed(1)}%</p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className={`text-xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(metrics.totalProfit / 1000000).toFixed(1)}M
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Break-even Point */}
      {breakEven && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Break-even achieved at</p>
                <p className="text-3xl font-bold text-green-600">Month {breakEven}</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Growth Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth Trajectory (Bass Model)</CardTitle>
          <CardDescription>Cumulative users over 10-year period with S-curve adoption</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Users (Millions)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value) => `${Number(value).toFixed(2)}M users`}
                labelFormatter={(label) => `Month ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="usersM" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorUsers)" 
              />
              {/* Phase markers */}
              <line x1="12" y1="0" x2="12" y2="100%" stroke="#f97316" strokeDasharray="5" opacity={0.3} />
              <line x1="36" y1="0" x2="36" y2="100%" stroke="#10b981" strokeDasharray="5" opacity={0.3} />
              <line x1="72" y1="0" x2="72" y2="100%" stroke="#ef4444" strokeDasharray="5" opacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue & Profit */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Profit Trajectory</CardTitle>
          <CardDescription>Monthly revenue and profit margins</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" label={{ value: 'Revenue & Profit ($M)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `$${Number(value).toFixed(1)}M`} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="revenueM" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Revenue"
                dot={false}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="profitM" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Profit"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth Rate Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Month-over-Month Growth Rate</CardTitle>
          <CardDescription>Showing phase transitions: Introduction &gt; Growth &gt; Maturity &gt; Decline</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: 'Growth %', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              <Line 
                type="monotone" 
                dataKey="growthRate" 
                stroke="#f97316" 
                strokeWidth={2}
                name="MoM Growth"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Key Metrics Milestones */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Month 12 (End of Introduction)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users:</span>
              <span className="font-bold">{(month12.users / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-bold">${(month12.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit:</span>
              <span className={`font-bold ${month12.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(month12.profit / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">CAC:</span>
              <span className="font-bold">${month12.keyMetrics.cac.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Month 24 (Growth Phase)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users:</span>
              <span className="font-bold">{(month24.users / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-bold">${(month24.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit:</span>
              <span className={`font-bold ${month24.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(month24.profit / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">LTV:CAC:</span>
              <span className="font-bold">{month24.keyMetrics.ltvCacRatio.toFixed(1)}x</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Month 36 (End of Growth)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users:</span>
              <span className="font-bold">{(month36.users / 1000000).toFixed(2)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Revenue:</span>
              <span className="font-bold">${(month36.revenue / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Profit:</span>
              <span className={`font-bold ${month36.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(month36.profit / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-muted-foreground">NRR:</span>
              <span className="font-bold">{month36.keyMetrics.nrr.toFixed(0)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 10-Year Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>10-Year Projection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Final Users</p>
              <p className="text-2xl font-bold">{(final.users / 1000000).toFixed(1)}M</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cumulative Revenue</p>
              <p className="text-2xl font-bold">${(lifecycle.reduce((sum, m) => sum + m.revenue, 0) / 1000000000).toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cumulative Profit</p>
              <p className="text-2xl font-bold text-green-600">${(lifecycle.reduce((sum, m) => sum + m.profit, 0) / 1000000000).toFixed(1)}B</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Penetration</p>
              <p className="text-2xl font-bold">{((final.users / 50000000) * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Profit Margin</p>
              <p className="text-2xl font-bold">
                {(lifecycle.reduce((sum, m) => sum + (m.profit / m.revenue), 0) / lifecycle.length * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
