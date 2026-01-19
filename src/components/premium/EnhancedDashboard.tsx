/**
 * Enhanced Premium Dashboard
 * 
 * Ultra-modern glassmorphic dashboard with animations
 * Updated with Wassel Brand Identity (Teal/Sage/Maroon) and new services
 */

import { motion } from 'motion/react';
import {
  Car,
  Package,
  Calendar,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Zap,
  Award,
  Bike,
  Truck,
  Users,
  PawPrint,
  School,
  Stethoscope,
  Key,
  Bus,
  Crown,
  Heart,
  ArrowRight
} from 'lucide-react';
import { PremiumCard, PremiumCardContent } from './PremiumCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface EnhancedDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnhancedDashboard({ onNavigate }: EnhancedDashboardProps) {
  const stats = [
    { label: 'Total Trips', value: '147', change: '+12%', icon: Car, color: 'from-teal-500 to-teal-700' },
    { label: 'This Month', value: 'AED 1,240', change: '+8%', icon: DollarSign, color: 'from-green-500 to-emerald-600' },
    { label: 'Avg Rating', value: '4.9', change: '+0.2', icon: Star, color: 'from-yellow-500 to-amber-600' },
    { label: 'Saved CO₂', value: '24kg', change: '+15%', icon: Zap, color: 'from-teal-400 to-cyan-500' },
  ];

  const services = [
    { id: 'delivery', name: 'Delivery', icon: Package, color: 'from-blue-500 to-cyan-500' },
    { id: 'scooters', name: 'Scooters', icon: Bike, color: 'from-green-400 to-emerald-600' },
    { id: 'freight', name: 'Freight', icon: Truck, color: 'from-slate-600 to-slate-800' },
    { id: 'carpool', name: 'Carpool', icon: Users, color: 'from-teal-500 to-teal-700' },
    { id: 'pets', name: 'Pets', icon: PawPrint, color: 'from-orange-400 to-red-500' },
    { id: 'school', name: 'School', icon: School, color: 'from-yellow-400 to-amber-600' },
    { id: 'medical', name: 'Medical', icon: Stethoscope, color: 'from-red-500 to-rose-700' },
    { id: 'rentals', name: 'Rentals', icon: Key, color: 'from-indigo-500 to-purple-600' },
    { id: 'shuttles', name: 'Shuttles', icon: Bus, color: 'from-blue-600 to-indigo-700' },
    { id: 'luxury', name: 'Luxury', icon: Crown, color: 'from-amber-500 to-yellow-600' },
    { id: 'hero', name: 'Hero', icon: Heart, color: 'from-rose-500 to-pink-600' }
  ];

  const recentTrips = [
    {
      id: '1',
      from: 'Dubai Marina',
      to: 'Dubai Mall',
      date: '2 hours ago',
      fare: 45.50,
      status: 'completed',
    },
    {
      id: '2',
      from: 'Business Bay',
      to: 'JBR Beach',
      date: 'Yesterday',
      fare: 38.00,
      status: 'completed',
    },
  ];

  const getRouteForService = (serviceId: string) => {
    switch (serviceId) {
      case 'delivery': return 'package-delivery';
      case 'scooters': return 'scooters';
      case 'freight': return 'freight';
      case 'carpool': return 'carpool';
      case 'pets': return 'pets';
      case 'school': return 'school';
      case 'medical': return 'medical';
      case 'rentals': return 'car-rentals';
      case 'shuttles': return 'shuttle';
      case 'luxury': return 'luxury';
      case 'hero': return 'wasel-hero';
      default: return 'find-ride';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#008080] via-teal-700 to-[#607D4B] p-8 md:p-12 text-white shadow-2xl"
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-4 bg-white/20 backdrop-blur-xl border-white/30 text-white">
              <Award className="w-4 h-4 mr-2" />
              Premium Member
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
              Welcome back! 👋
            </h1>
            <p className="text-xl text-white/90 mb-6 font-light">
              Where would you like to go today?
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Button
              size="lg"
              className="bg-white text-[#008080] hover:bg-white/90 font-bold border-0 shadow-lg"
              onClick={() => onNavigate('find-ride')}
            >
              <Car className="w-5 h-5 mr-2" />
              Book Ride
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 font-medium"
              onClick={() => onNavigate('scheduled-trips')}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Innovation: Green Rewards Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 dark:border-emerald-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-400">Green Mining Rewards</h3>
            <p className="text-emerald-700/80 dark:text-emerald-400/60 font-medium">You've earned 450 credits from eco-trips!</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <span className="block text-2xl font-black text-emerald-600">450</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700/60">Credits</span>
          </div>
          <div className="text-center px-4 py-2 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-600/20">
            <span className="block text-2xl font-black text-white">24.5</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/80">kg CO₂ saved</span>
          </div>
          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-xl hover:bg-emerald-500/20 text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-md dark:bg-slate-800/80" hover>
              <PremiumCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold mb-1 text-gray-800 dark:text-white">{stat.value}</h3>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </PremiumCardContent>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Services Grid (Horizontal Scroll on Mobile) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Services</h2>
          <Button variant="ghost" className="text-[#008080]">View All</Button>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-4">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => onNavigate(getRouteForService(service.id))}
            >
              <div className={`
                w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${service.color} 
                flex items-center justify-center text-white shadow-lg 
                group-hover:shadow-xl group-hover:scale-110 transition-all duration-300
              `}>
                <service.icon className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-[#008080] transition-colors">
                {service.name}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Wasel Hero CTA Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all"
        onClick={() => onNavigate('wasel-hero')}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-white/20 text-white border-0 w-fit">Community Hero</Badge>
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Heart className="w-8 h-8 fill-white" />
              Become a Wasel Hero
            </h3>
            <p className="text-rose-50 opacity-90 max-w-lg font-medium">
              Help your community by delivering packages on your existing route. Earn double credits and exclusive status rewards!
            </p>
          </div>
          <Button variant="secondary" className="bg-white text-rose-600 hover:bg-rose-50 font-bold px-8 py-6 h-auto text-lg rounded-2xl">
            Join the Heros
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl" />
      </motion.div>

      {/* Recent Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Trips</h2>
          <Button variant="ghost" onClick={() => onNavigate('my-trips')}>
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {recentTrips.map((trip, index) => (
            <motion.div
              key={trip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <PremiumCard hover onClick={() => onNavigate('my-trips')} className="border-0 shadow-md bg-white/90 backdrop-blur-sm dark:bg-slate-800/90">
                <PremiumCardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#008080] to-[#607D4B] rounded-2xl flex items-center justify-center text-white shadow-md">
                        <MapPin className="w-6 h-6" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800 dark:text-white">{trip.from}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-semibold text-gray-800 dark:text-white">{trip.to}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {trip.date}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-[#008080]">AED {trip.fare.toFixed(2)}</p>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950 text-green-700">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}