/**
 * Application Constants
 * Centralized configuration to replace hardcoded values
 */

// App Configuration
export const APP_CONFIG = {
  name: 'Wassel',
  nameArabic: 'واصل',
  tagline: 'Next-Generation Ride Sharing',
  description: 'Connect with travelers, save money, and reduce your carbon footprint while exploring the beauty of the Middle East.',
  version: '1.0.0',
  supportEmail: 'support@wassel.app',
  website: 'https://wassel.app'
} as const;

// Business Metrics
export const METRICS = {
  totalUsers: 50000,
  activeUsers: 10000,
  completedRides: 50000,
  averageRating: 4.8,
  co2Saved: 2450, // kg
  activeTrips: 124,
  costSavings: 60, // percentage
  onTimeRate: 95, // percentage
  totalRoutes: 500
} as const;

// Pricing
export const PRICING = {
  currency: 'USD',
  symbol: '$',
  samplePrices: {
    dubaiAbuDhabi: 45,
    riyadhJeddah: 120,
    cairoAlexandria: 35
  },
  walletBalance: 250,
  maxSavings: 70 // percentage
} as const;

// Routes & Locations
export const POPULAR_ROUTES = [
  { from: 'Dubai', to: 'Abu Dhabi', price: PRICING.samplePrices.dubaiAbuDhabi },
  { from: 'Riyadh', to: 'Jeddah', price: PRICING.samplePrices.riyadhJeddah },
  { from: 'Cairo', to: 'Alexandria', price: PRICING.samplePrices.cairoAlexandria }
] as const;

// Sample Data
export const SAMPLE_ACTIVITIES = [
  {
    type: 'wasel',
    route: 'Dubai → Abu Dhabi',
    date: 'Oct 3, 2025',
    price: PRICING.samplePrices.dubaiAbuDhabi,
    status: 'Confirmed'
  },
  {
    type: 'raje3',
    route: 'Riyadh → Jeddah (Return)',
    date: 'Oct 5, 2025',
    price: PRICING.samplePrices.riyadhJeddah,
    status: 'Pending'
  },
  {
    type: 'wasel',
    route: 'Cairo → Alexandria',
    date: 'Sep 28, 2025',
    price: PRICING.samplePrices.cairoAlexandria,
    status: 'Completed'
  }
] as const;

// Testimonials
export const TESTIMONIALS = [
  {
    quote: `Wassel saved me over ${METRICS.costSavings}% on my weekly commute from Dubai to Abu Dhabi. The drivers are professional and friendly!`,
    author: 'Ahmed K.',
    route: 'Dubai → Abu Dhabi',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100'
  },
  {
    quote: 'I love the Raje3 feature! It makes planning return trips so much easier and more affordable.',
    author: 'Sarah M.',
    route: 'Riyadh → Jeddah',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100'
  },
  {
    quote: 'Safe, reliable, and eco-friendly. Wassel is exactly what the Middle East needed for modern travel.',
    author: 'Omar A.',
    route: 'Cairo → Alexandria',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100'
  }
] as const;

// Workflow Steps
export const WORKFLOW_STEPS = [
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
] as const;

// Features
export const FEATURES = [
  {
    title: 'Affordable Travel',
    description: `Share costs and save up to ${PRICING.maxSavings}% on your journey`,
    icon: 'CircleDollarSign',
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  {
    title: 'Smart Matching',
    description: 'AI-powered system finds the perfect ride for you',
    icon: 'UsersRound',
    color: 'text-secondary',
    bg: 'bg-secondary/10'
  },
  {
    title: 'Trust & Safety',
    description: 'Verified users and transparent ratings',
    icon: 'ShieldCheck',
    color: 'text-accent',
    bg: 'bg-accent/10'
  },
  {
    title: 'Eco-Friendly',
    description: 'Reduce emissions and help the environment',
    icon: 'Sprout',
    color: 'text-green-600',
    bg: 'bg-green-100'
  }
] as const;

// Trip Types
export const TRIP_TYPES = {
  wasel: {
    name: 'Wasel',
    nameArabic: 'واصل',
    symbol: '→',
    description: 'One-way trips for single destinations',
    features: [
      'Perfect for one-time travel',
      'Flexible scheduling',
      'Lower commitment'
    ]
  },
  raje3: {
    name: 'Raje3',
    nameArabic: 'راجع',
    symbol: '↔',
    description: 'Smart return trips with better value',
    features: [
      'Round-trip convenience',
      'Cost-effective pricing',
      'Same driver comfort'
    ]
  }
} as const;

// Dashboard Stats
export const DASHBOARD_STATS = {
  upcomingTrips: 2,
  unreadMessages: 1,
  walletBalance: PRICING.walletBalance
} as const;

// Animation Durations (in seconds)
export const ANIMATIONS = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  floating: {
    duration: 4,
    delay: 1
  },
  orb: {
    duration: 20,
    delayVariation: 5
  }
} as const;

// UI Constants
export const UI = {
  maxWidth: '7xl',
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xl: '24px',
    full: '9999px'
  },
  spacing: {
    section: 'py-24',
    container: 'px-6',
    grid: 'gap-8'
  }
} as const;

// External Links
export const LINKS = {
  appStore: '#',
  googlePlay: '#',
  about: '#',
  careers: '#',
  press: '#',
  blog: '#',
  helpCenter: '#',
  safety: '#',
  terms: '#',
  privacy: '#'
} as const;

// Copyright
export const COPYRIGHT = {
  year: new Date().getFullYear(),
  company: `${APP_CONFIG.name} Inc.`,
  text: `© ${new Date().getFullYear()} ${APP_CONFIG.name} Inc. All rights reserved.`
} as const;

// Avatar placeholders
export const AVATARS = {
  placeholder: (id: number) => `https://i.pravatar.cc/100?img=${id + 10}`,
  fallback: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=crop&w=100&h=100'
} as const;

// Performance thresholds
export const PERFORMANCE = {
  loadTimeWarning: 3000, // ms
  chunkSizeWarning: 500, // kb
  imageOptimization: {
    quality: 85,
    format: 'webp'
  }
} as const;

export default {
  APP_CONFIG,
  METRICS,
  PRICING,
  POPULAR_ROUTES,
  SAMPLE_ACTIVITIES,
  TESTIMONIALS,
  WORKFLOW_STEPS,
  FEATURES,
  TRIP_TYPES,
  DASHBOARD_STATS,
  ANIMATIONS,
  UI,
  LINKS,
  COPYRIGHT,
  AVATARS,
  PERFORMANCE
};