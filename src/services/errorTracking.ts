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

  constructor() {
    this.initializeSentry();
    this.setupGlobalErrorHandlers();
  }

  /**
   * Initialize Sentry for error tracking
   */
  private initializeSentry() {
    if (!this.sentryDSN) {
      console.warn('Sentry DSN not configured. Error tracking disabled.');
      return;
    }

    // TODO: Initialize Sentry
    // import * as Sentry from "@sentry/react";
    // Sentry.init({
    //   dsn: this.sentryDSN,
    //   environment: this.isDevelopment ? 'development' : 'production',
    //   tracesSampleRate: this.isDevelopment ? 1.0 : 0.1,
    //   debug: this.isDevelopment,
    // });

    console.log('[ErrorTracking] Sentry initialized');
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

    // TODO: Send to Sentry
    // import * as Sentry from "@sentry/react";
    // Sentry.captureException(error, { contexts: { custom: context } });

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

    // TODO: Send to Sentry
    // import * as Sentry from "@sentry/react";
    // Sentry.captureMessage(message, level);

    this.sendToBackend(errorEvent);
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, email?: string, name?: string) {
    // TODO: Set Sentry user context
    // import * as Sentry from "@sentry/react";
    // Sentry.setUser({
    //   id: userId,
    //   email,
    //   username: name,
    // });

    console.log('[ErrorTracking] User context set:', userId);
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    // TODO: Clear Sentry user context
    // import * as Sentry from "@sentry/react";
    // Sentry.setUser(null);

    console.log('[ErrorTracking] User context cleared');
  }

  /**
   * Add breadcrumb for navigation tracking
   */
  addBreadcrumb(message: string, data?: Record<string, any>) {
    // TODO: Add Sentry breadcrumb
    // import * as Sentry from "@sentry/react";
    // Sentry.addBreadcrumb({
    //   message,
    //   data,
    //   level: 'info',
    // });

    if (this.isDevelopment) {
      console.log('[ErrorTracking] Breadcrumb:', message, data);
    }
  }

  /**
   * Track performance metric
   */
  trackPerformance(metricName: string, duration: number, tags?: Record<string, string>) {
    // TODO: Track with Sentry
    // import * as Sentry from "@sentry/react";
    // Sentry.captureMessage(`Performance: ${metricName}: ${duration}ms`, 'info');

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
      // TODO: Send to backend error logging endpoint
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     ...errorEvent,
      //     stack,
      //     userAgent: navigator.userAgent,
      //     url: window.location.href,
      //   }),
      // }).catch(err => console.error('Failed to send error to backend:', err));

      console.log('[ErrorTracking] Would send to backend:', errorEvent);
    } catch (err) {
      console.error('Error sending error to backend:', err);
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
