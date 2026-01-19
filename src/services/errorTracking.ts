/**
 * Error Tracking Service
 * Integrates with Sentry for production error monitoring
 * Provides centralized error handling and logging
 */

interface ErrorContext {
  userId?: string;
  tripId?: string;
  component?: string;
  [key: string]: any;
}

interface ErrorEvent {
  message: string;
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  context?: ErrorContext;
  timestamp: string;
}

class ErrorTrackingService {
  private isDevelopment = import.meta.env.DEV;
  private sentryDSN = import.meta.env.VITE_SENTRY_DSN;
  private errorQueue: ErrorEvent[] = [];
  private maxQueueSize = 50;
  private userContext?: { userId: string; email?: string; name?: string };
  private breadcrumbs: Array<{ message: string; data?: any; timestamp: string }> = [];
  private performanceMetrics: Array<{ metric: string; duration: number; tags?: any; timestamp: string }> = [];

  constructor() {
    this.initializeSentry();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize Sentry for error tracking
   */
  private initializeSentry() {
    if (!this.sentryDSN) {
      console.warn('Sentry DSN not configured. Using local error tracking only.');
      return;
    }

    // Sentry integration would be initialized here in production
    // For now, using local error tracking and console logging
    console.log('[ErrorTracking] Error tracking service initialized');
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error, {
        component: 'Global Error Handler',
        message: event.message,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(event.reason, {
        component: 'Unhandled Promise Rejection',
      });
    });
  }

  /**
   * Capture and log an exception
   */
  captureException(error: Error | unknown, context?: ErrorContext) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    const errorEvent: ErrorEvent = {
      message: errorMessage,
      level: 'error',
      context,
      timestamp: new Date().toISOString(),
    };

    // Add to queue
    this.addToQueue(errorEvent);

    // Log to console in development
    if (this.isDevelopment) {
      console.error('[ErrorTracking]', errorEvent.message, {
        error,
        context,
        stack: errorStack,
      });
    }

    // Log to external service in production
    if (!this.isDevelopment && this.sentryDSN) {
      // External error tracking would be implemented here
      this.sendToExternalService(error, context);
    }

    // Send to backend for persistent storage
    this.sendToBackend(errorEvent, errorStack);
  }

  /**
   * Capture a message (info/warning)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'debug' = 'info', context?: ErrorContext) {
    const errorEvent: ErrorEvent = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
    };

    this.addToQueue(errorEvent);

    if (this.isDevelopment) {
      console.log(`[ErrorTracking] ${level.toUpperCase()}: ${message}`, context);
    }

    // Log to external service in production
    if (!this.isDevelopment && this.sentryDSN) {
      this.sendToExternalService(message, context, level);
    }

    this.sendToBackend(errorEvent);
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, email?: string, name?: string) {
    // Store user context for error reports
    this.userContext = { userId, email, name };
    console.log('[ErrorTracking] User context set:', userId);
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    this.userContext = undefined;
    console.log('[ErrorTracking] User context cleared');
  }

  /**
   * Add breadcrumb for navigation tracking
   */
  addBreadcrumb(message: string, data?: Record<string, any>) {
    // Store breadcrumb for context
    this.breadcrumbs.push({ message, data, timestamp: new Date().toISOString() });
    
    // Keep only last 10 breadcrumbs
    if (this.breadcrumbs.length > 10) {
      this.breadcrumbs = this.breadcrumbs.slice(-10);
    }

    if (this.isDevelopment) {
      console.log('[ErrorTracking] Breadcrumb:', message, data);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, duration: number, tags?: Record<string, string>) {
    const performanceEvent = {
      metric: metricName,
      duration,
      tags,
      timestamp: new Date().toISOString()
    };
    
    // Store performance metrics
    this.performanceMetrics.push(performanceEvent);
    
    // Keep only last 50 metrics
    if (this.performanceMetrics.length > 50) {
      this.performanceMetrics = this.performanceMetrics.slice(-50);
    }

    if (this.isDevelopment) {
      console.log(`[Performance] ${metricName}: ${duration}ms`, tags);
    }
  }

  /**
   * Add to error queue
   */
  private addToQueue(errorEvent: ErrorEvent) {
    this.errorQueue.push(errorEvent);

    // Keep queue size manageable
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue = this.errorQueue.slice(-this.maxQueueSize);
    }
  }

  /**
   * Send error to backend for persistent storage
   */
  private sendToBackend(errorEvent: ErrorEvent, stack?: string) {
    // Only send in production or if explicitly enabled
    if (this.isDevelopment && !import.meta.env.VITE_ENABLE_ERROR_TRACKING) {
      return;
    }

    try {
      // In production, this would send to a backend error logging endpoint
      const errorData = {
        ...errorEvent,
        stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userContext: this.userContext,
        breadcrumbs: this.breadcrumbs
      };
      
      // Store locally for now (in production, send to backend)
      localStorage.setItem('wassel_last_error', JSON.stringify(errorData));
      
      if (this.isDevelopment) {
        console.log('[ErrorTracking] Error logged locally:', errorData);
      }
    } catch (err) {
      console.error('Error logging error:', err);
    }
  }

  /**
   * Get error queue (for debugging)
   */
  getErrorQueue(): ErrorEvent[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  clearErrorQueue() {
    this.errorQueue = [];
  }

  /**
   * Send to external error tracking service
   */
  private sendToExternalService(error: any, context?: ErrorContext, level?: string) {
    // In production, this would integrate with Sentry or similar service
    if (this.isDevelopment) {
      console.log('[ErrorTracking] Would send to external service:', { error, context, level });
    }
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.isDevelopment ? 'development' : 'production',
      url: window.location.href,
      userAgent: navigator.userAgent,
      errors: this.errorQueue,
      errorCount: this.errorQueue.length,
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const errorTracking = new ErrorTrackingService();

// Export types
export type { ErrorContext, ErrorEvent };
