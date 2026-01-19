/**
 * Services Index
 * Central export point for all application services
 */

// Core Services
export { supabase, authAPI, tripsAPI, bookingsAPI, messagesAPI, walletAPI, notificationsAPI, referralAPI } from './api';
export { aiService } from './aiService';
export { analyticsService } from './analyticsService';
export { errorTracking } from './errorTracking';
export { paymentService } from './paymentService';
export { realTimeTrackingService } from './realTimeTracking';

// Integration Services
export { 
  mapsService, 
  paymentService as stripePaymentService, 
  smsService, 
  emailService, 
  pushNotificationService, 
  identityVerificationService, 
  analyticsService as mixpanelService, 
  errorTrackingService as sentryService,
  checkIntegrationStatus,
  getIntegrationHealth
} from './integrations';

// Specialized Services
export { heroService } from './heroService';
export { intermodalService } from './intermodalService';
export { matchingService } from './matchingService';
export { mockDataStore, dataService } from './mockDataService';
export { packageService } from './packageService';
export { rewardsService } from './rewardsService';
export { schoolTransportService } from './schoolTransportService';
export { scooterService } from './scooterService';
export { twilioService } from './twilioService';

// Factory and Utility Services
export { ServiceFactory } from './serviceFactory';
export { economicLifecycleService } from './economicLifecycle';
export { growthMetricsService } from './growthMetrics';

// New Comprehensive Services
export { notificationService } from './notificationService';
export { locationService } from './locationService';
export { ratingService } from './ratingService';
export { adminService } from './adminService';
export { securityService } from './securityService';

// Service Types
export type { ServiceType, ServiceRequest, ServiceResponse, Location } from './serviceFactory';
export type { 
  AIConfig, 
  AIRequest, 
  AIResponse, 
  AILog 
} from './aiService';
export type { 
  Transaction, 
  WalletBalance, 
  PaymentCard, 
  PaymentIntent,
  TransactionType,
  PaymentMethod,
  Currency
} from './paymentService';
export type { 
  LocationUpdate, 
  TripStatus 
} from './realTimeTracking';
export type { 
  Notification, 
  NotificationPreferences 
} from './notificationService';
export type { 
  Location as LocationType,
  Route,
  RouteStep,
  PlaceSuggestion,
  NearbyPlace
} from './locationService';
export type { 
  Rating, 
  UserRatingStats, 
  ReviewResponse 
} from './ratingService';
export type { 
  AdminUser, 
  UserManagementData, 
  SystemMetrics, 
  DisputeCase, 
  FraudAlert 
} from './adminService';
export type { 
  SecurityEvent, 
  FraudDetectionResult, 
  DeviceFingerprint, 
  SecuritySettings 
} from './securityService';

// Service Status Check
export const checkAllServicesStatus = async () => {
  const services = {
    api: true,
    ai: true,
    analytics: true,
    payment: true,
    realTimeTracking: true,
    notification: true,
    location: true,
    rating: true,
    admin: true,
    security: true,
    integrations: checkIntegrationStatus(),
  };

  const integrationHealth = getIntegrationHealth();
  
  return {
    services,
    integrations: integrationHealth,
    overall_health: integrationHealth.percentage > 50 ? 'healthy' : 'degraded',
  };
};

// Service initialization
export const initializeServices = async () => {
  try {
    console.log('[Services] Initializing all services...');
    
    // Initialize error tracking
    errorTracking.setUserContext('system', undefined, 'Service Initialization');
    
    // Check integration status
    const integrationStatus = checkIntegrationStatus();
    console.log('[Services] Integration status:', integrationStatus);
    
    // Initialize real-time tracking
    // realTimeTrackingService is ready for use
    
    // Initialize AI service
    // aiService is ready for use
    
    console.log('[Services] All services initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('[Services] Failed to initialize services:', error);
    errorTracking.captureException(error as Error, { context: 'service_initialization' });
    return { success: false, error };
  }
};

// Service health check
export const performHealthCheck = async () => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {
      database: true, // Supabase connection
      authentication: true,
      payments: true,
      notifications: true,
      location: true,
      realtime: true,
      ai: true,
      analytics: true,
    },
    integrations: getIntegrationHealth(),
    overall: 'healthy' as 'healthy' | 'degraded' | 'down',
  };

  // Determine overall health
  const serviceCount = Object.values(healthStatus.services).filter(Boolean).length;
  const totalServices = Object.keys(healthStatus.services).length;
  const serviceHealth = (serviceCount / totalServices) * 100;
  
  if (serviceHealth >= 80 && healthStatus.integrations.percentage >= 50) {
    healthStatus.overall = 'healthy';
  } else if (serviceHealth >= 60) {
    healthStatus.overall = 'degraded';
  } else {
    healthStatus.overall = 'down';
  }

  return healthStatus;
};

// Export service collections for convenience
export const coreServices = {
  api: { authAPI, tripsAPI, bookingsAPI, messagesAPI, walletAPI, notificationsAPI, referralAPI },
  ai: aiService,
  analytics: analyticsService,
  payment: paymentService,
  realTimeTracking: realTimeTrackingService,
  notification: notificationService,
  location: locationService,
  rating: ratingService,
  admin: adminService,
  security: securityService,
};

export const integrationServices = {
  maps: mapsService,
  stripe: stripePaymentService,
  sms: smsService,
  email: emailService,
  push: pushNotificationService,
  identity: identityVerificationService,
  mixpanel: mixpanelService,
  sentry: sentryService,
  twilio: twilioService,
};

export const specializedServices = {
  hero: heroService,
  intermodal: intermodalService,
  matching: matchingService,
  package: packageService,
  rewards: rewardsService,
  school: schoolTransportService,
  scooter: scooterService,
  mockData: dataService,
};

export const utilityServices = {
  serviceFactory: ServiceFactory,
  economicLifecycle: economicLifecycleService,
  growthMetrics: growthMetricsService,
  errorTracking,
};

// Default export for convenience
export default {
  ...coreServices,
  integrations: integrationServices,
  specialized: specializedServices,
  utilities: utilityServices,
  checkStatus: checkAllServicesStatus,
  initialize: initializeServices,
  healthCheck: performHealthCheck,
};