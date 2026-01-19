import React from 'react';
import { ScanSearch, CirclePlus, TrendingUp, MessageSquare, CreditCard, Locate, UsersRound, TrendingUp as TrendingUpIcon, MapPin, Clock, Star, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { WorkflowGuide } from './WorkflowGuide';
import { Logo } from './Logo';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

const workflowSteps = [
  {
    id: 'profile',
    title: 'Complete Your Profile',
    description: 'Add your photo and verify your phone number',
    completed: true,
    current: false
  },
  {
    id: 'search',
    title: 'Find Your First Ride',
    description: 'Search for available trips in your area',
    completed: false,
    current: true
  },
  {
    id: 'book',
    title: 'Book & Connect',
    description: 'Reserve seats and chat with your driver',
    completed: false,
    current: false
  },
  {
    id: 'travel',
    title: 'Enjoy Your Journey',
    description: 'Meet at pickup point and travel safely',
    completed: false,
    current: false
  },
  {
    id: 'rate',
    title: 'Rate Your Experience',
    description: 'Help build trust in the community',
    completed: false,
    current: false
  }
];

const recentActivities = [
  {
    type: 'wasel',
    route: 'Dubai → Abu Dhabi',
    date: 'Oct 3, 2025',
    price: 45,
    status: 'Confirmed'
  },
  {
    type: 'raje3',
    route: 'Riyadh → Jeddah (Return)',
    date: 'Oct 5, 2025',
    price: 120,
    status: 'Pending'
  },
  {
    type: 'wasel',
    route: 'Cairo → Alexandria',
    date: 'Sep 28, 2025',
    price: 35,
    status: 'Completed'
  }
];

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, profile } = useAuth();
  
  // Get first name for welcome message
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section - Enhanced */}
      <div className="relative bg-gradient-to-br from-primary via-primary/95 to-blue-600 rounded-2xl p-8 shadow-2xl text-white overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <Logo className="h-14 w-auto" />
            </div>
            <div>
              <h1 className="text-white text-3xl mb-1">
                Welcome back, {firstName}! <span className="opacity-90 text-2xl">أهلاً وسهلاً</span>
              </h1>
              <p className="text-white/90 text-lg">Ready for your next journey with Wassel?</p>
              <div className="flex items-center gap-4 mt-3">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  <Star className="size-3 mr-1 fill-current" />
                  {profile?.rating_as_driver || 4.8} Rating
                </Badge>
                {profile?.email_verified && (
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    <Award className="size-3 mr-1" />
                    Verified Driver
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 lg:flex lg:gap-6">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <TrendingUp className="size-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold">{profile?.total_trips || 0}</p>
              <p className="text-sm text-white/80">Total Trips</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center">
              <Target className="size-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold">320 kg</p>
              <p className="text-sm text-white/80">CO₂ Saved</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-center lg:hidden xl:block">
              <Zap className="size-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold">95%</p>
              <p className="text-sm text-white/80">On-Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="group hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-primary/40 bg-gradient-to-br from-white via-white to-primary/5 dark:from-gray-900 dark:to-primary/10 overflow-hidden relative" onClick={() => onNavigate('find-ride')}>
          {/* Hover Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Find a Ride
                  <Badge variant="secondary" className="bg-primary/10 text-primary font-semibold">Popular</Badge>
                </CardTitle>
                <CardDescription className="text-base">Search for available rides across cities</CardDescription>
              </div>
              <div className="size-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ScanSearch className="size-8 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Locate className="size-4 text-primary flex-shrink-0" />
                <span>500+ routes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-primary flex-shrink-0" />
                <span>24/7 Available</span>
              </div>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md h-12">
              Search Now
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all cursor-pointer border-2 border-transparent hover:border-secondary/40 bg-gradient-to-br from-white via-white to-secondary/5 dark:from-gray-900 dark:to-secondary/10 overflow-hidden relative" onClick={() => onNavigate('offer-ride')}>
          {/* Hover Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <CardHeader className="relative z-10">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  Offer a Ride
                  <Badge variant="secondary" className="bg-secondary/10 text-secondary font-semibold">Earn</Badge>
                </CardTitle>
                <CardDescription className="text-base">Share your journey and earn money</CardDescription>
              </div>
              <div className="size-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <CirclePlus className="size-8 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UsersRound className="size-4 text-primary flex-shrink-0" />
                <span>Help 3-4 travelers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4 text-primary flex-shrink-0" />
                <span>24/7 Available</span>
              </div>
            </div>
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md h-12">
              Create Trip
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Guide */}
      <WorkflowGuide steps={workflowSteps} />

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Trips</CardTitle>
              <TrendingUpIcon className="w-5 h-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl">2</div>
              <p className="text-sm text-gray-500">Active bookings</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Messages</CardTitle>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl">1</div>
              <p className="text-sm text-gray-500">Unread messages</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Wallet Balance</CardTitle>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-3xl">$250</div>
              <p className="text-sm text-gray-500">Available funds</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest trips and bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'wasel' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {activity.type === 'wasel' ? '→' : '↔'}
                  </div>
                  <div>
                    <p className="text-gray-900">{activity.route}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">${activity.price}</p>
                  <p className="text-sm text-gray-500">{activity.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}