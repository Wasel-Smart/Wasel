/**
 * Driver Earnings Dashboard
 * 
 * Comprehensive earnings tracking, payout management,
 * and performance metrics for drivers.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download, 
  Clock,
  Star,
  Target,
  Award,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../services/api';
import { toast } from 'sonner';

interface EarningsData {
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  
  fareBreakdown: {
    totalFares: number;
    platformFee: number;
    netEarnings: number;
    tips: number;
    bonuses: number;
    incentives: number;
  };
  
  payout: {
    availableBalance: number;
    pendingBalance: number;
    nextPayoutDate: Date | null;
    payoutMethod: 'bank_transfer' | 'wallet' | 'none';
  };
  
  performance: {
    tripsCompleted: number;
    hoursOnline: number;
    averageRating: number;
    acceptanceRate: number;
    cancellationRate: number;
    earningsPerHour: number;
  };
  
  weeklyComparison: {
    tripsChange: number;
    earningsChange: number;
    ratingChange: number;
  };
}

export function DriverEarnings() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarningsData();
  }, [user]);

  const loadEarningsData = async () => {
    setLoading(true);
    try {
      // In production, fetch from backend
      // For now, use mock data
      const mockData: EarningsData = {
        todayEarnings: 245.50,
        weekEarnings: 1450.75,
        monthEarnings: 5890.25,
        totalEarnings: 28450.80,
        
        fareBreakdown: {
          totalFares: 1650.75,
          platformFee: 330.15,
          netEarnings: 1320.60,
          tips: 95.50,
          bonuses: 34.65,
          incentives: 0,
        },
        
        payout: {
          availableBalance: 1450.75,
          pendingBalance: 245.50,
          nextPayoutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          payoutMethod: 'bank_transfer',
        },
        
        performance: {
          tripsCompleted: 47,
          hoursOnline: 32.5,
          averageRating: 4.8,
          acceptanceRate: 92,
          cancellationRate: 3,
          earningsPerHour: 44.64,
        },
        
        weeklyComparison: {
          tripsChange: +12,
          earningsChange: +8.5,
          ratingChange: +0.2,
        },
      };

      setEarnings(mockData);
    } catch (error) {
      console.error('Failed to load earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!earnings || !user) return;

    try {
      const { paymentService } = await import('../services/integrations');
      
      // Create payout via Stripe
      const response = await fetch('/api/payments/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: earnings.payout.availableBalance,
          currency: 'AED',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Payout of AED ${earnings.payout.availableBalance} initiated. Funds will be transferred within 1-2 business days.`);
        // Refresh earnings data
        loadEarningsData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to initiate payout');
      }
    } catch (error) {
      console.error('Payout failed:', error);
      toast.error('Failed to initiate payout. Please try again later.');
    }
  };

  const downloadStatement = async () => {
    if (!earnings || !user) return;

    try {
      // Generate PDF statement via backend
      const response = await fetch(`/api/earnings/statement?userId=${user.id}&period=${period}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wassel-earnings-statement-${period}-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Statement downloaded successfully');
      } else {
        // Fallback: Generate client-side PDF
        const jsPDF = (await import('jspdf')).default;
        const doc = new jsPDF();
        
        doc.text('Wassel Earnings Statement', 20, 20);
        doc.text(`Period: ${period}`, 20, 30);
        doc.text(`Total Earnings: AED ${earnings.payout.availableBalance.toFixed(2)}`, 20, 40);
        doc.text(`Trips Completed: ${earnings.performance.tripsCompleted}`, 20, 50);
        
        doc.save(`wassel-earnings-${period}-${Date.now()}.pdf`);
        toast.success('Statement generated and downloaded');
      }
    } catch (error) {
      console.error('Statement generation failed:', error);
      toast.error('Failed to generate statement');
    }
  };

  if (loading || !earnings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const currentEarnings = {
    today: earnings.todayEarnings,
    week: earnings.weekEarnings,
    month: earnings.monthEarnings,
  }[period];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your income and performance
          </p>
        </div>
        <Button onClick={downloadStatement} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Statement
        </Button>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="space-y-6 mt-6">
          {/* Main Earnings Card */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">
                {period === 'today' && 'Today\'s Earnings'}
                {period === 'week' && 'This Week\'s Earnings'}
                {period === 'month' && 'This Month\'s Earnings'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">
                  AED {currentEarnings.toFixed(2)}
                </span>
                {period === 'week' && (
                  <Badge 
                    variant={earnings.weeklyComparison.earningsChange >= 0 ? 'default' : 'destructive'}
                    className="ml-2"
                  >
                    {earnings.weeklyComparison.earningsChange >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(earnings.weeklyComparison.earningsChange)}%
                  </Badge>
                )}
              </div>
              <p className="mt-2 opacity-90">
                From {earnings.performance.tripsCompleted} trips
              </p>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  AED {earnings.payout.availableBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready for payout
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  AED {earnings.payout.pendingBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Earnings/Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  AED {earnings.performance.earningsPerHour.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Average rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hours Online</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {earnings.performance.hoursOnline.toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of your income</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Fares</span>
                <span className="font-semibold">
                  AED {earnings.fareBreakdown.totalFares.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-red-600">
                <span>Platform Fee (20%)</span>
                <span>- AED {earnings.fareBreakdown.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Net Earnings</span>
                <span className="font-semibold">
                  AED {earnings.fareBreakdown.netEarnings.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Tips</span>
                <span>+ AED {earnings.fareBreakdown.tips.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Bonuses</span>
                <span>+ AED {earnings.fareBreakdown.bonuses.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold text-lg">Total Earnings</span>
                <span className="font-bold text-xl">
                  AED {currentEarnings.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your driver performance this week</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Acceptance Rate</span>
                  <span className="text-sm font-medium">
                    {earnings.performance.acceptanceRate}%
                  </span>
                </div>
                <Progress value={earnings.performance.acceptanceRate} />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: 90% or higher
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Average Rating</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {earnings.performance.averageRating.toFixed(1)}
                  </span>
                </div>
                <Progress value={earnings.performance.averageRating * 20} />
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {earnings.performance.tripsCompleted} ratings
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Cancellation Rate</span>
                  <span className="text-sm font-medium">
                    {earnings.performance.cancellationRate}%
                  </span>
                </div>
                <Progress 
                  value={earnings.performance.cancellationRate * 20} 
                  className="[&>div]:bg-red-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Target: Below 5%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payout Section */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Information</CardTitle>
              <CardDescription>Manage your payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-semibold">Available for Payout</p>
                  <p className="text-2xl font-bold text-green-600">
                    AED {earnings.payout.availableBalance.toFixed(2)}
                  </p>
                  {earnings.payout.nextPayoutDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Next automatic payout on{' '}
                      {earnings.payout.nextPayoutDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button onClick={handlePayout} size="lg">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Cash Out
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payout Method</span>
                  <span className="font-medium">
                    {earnings.payout.payoutMethod === 'bank_transfer'
                      ? 'Bank Transfer'
                      : 'Wassel Wallet'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Time</span>
                  <span className="font-medium">1-2 business days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum Payout</span>
                  <span className="font-medium">AED 50.00</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                Change Payout Method
              </Button>
            </CardContent>
          </Card>

          {/* Incentives & Bonuses */}
          <Card>
            <CardHeader>
              <CardTitle>Active Incentives</CardTitle>
              <CardDescription>Earn more with these bonuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    <span className="font-semibold">Weekend Warrior</span>
                  </div>
                  <Badge>+20% Earnings</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete 15 trips this weekend
                </p>
                <Progress value={60} />
                <p className="text-xs text-muted-foreground">
                  9/15 trips completed
                </p>
              </div>

              <div className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold">Peak Hours Bonus</span>
                  </div>
                  <Badge>+AED 5/trip</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drive during peak hours (7-9 AM, 5-7 PM)
                </p>
                <p className="text-xs text-muted-foreground">
                  Active until end of month
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
