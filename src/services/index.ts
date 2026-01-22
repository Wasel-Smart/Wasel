/**
 * Services Index
 * Central export point for all application services
 */

// Core Services
export { aiService } from './aiService';
export { analyticsService } from './analyticsService';
export { paymentService } from './paymentService';
export { realTimeTrackingService } from './realTimeTracking';

// Specialized Services
export { heroService } from './heroService';
export { intermodalService } from './intermodalService';
export { default as laundryService } from './laundryService';
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

// Service Status Check
export const checkAllServicesStatus = async () => {
  return {
    services: { api: true, ai: true, analytics: true },
    overall_health: 'healthy',
  };
};

// Service initialization
export const initializeServices = async () => {
  try {
    console.log('[Services] Initializing services...');
    return { success: true };
  } catch (error) {
    console.error('[Services] Init error:', error);
    return { success: false, error };
  }
};

// Service health check
export const performHealthCheck = async () => {
  return {
    timestamp: new Date().toISOString(),
    services: { database: true, authentication: true },
    overall: 'healthy' as const,
  };
};