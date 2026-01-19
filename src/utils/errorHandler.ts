/**
 * Global Error Handler - Production Ready
 */

import { errorTrackingService } from '../services/integrations';

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorContext {
  userId?: string;
  tripId?: string;
  component?: string;
  action?: string;
  metadata?: any;
}

class GlobalErrorHandler {
  private errorQueue: Array<{ error: Error; context: ErrorContext; timestamp: number }> = [];
  private isProcessing = false;

  handleError(error: Error, severity: ErrorSeverity, context: ErrorContext = {}): void {
    // Log immediately for critical errors
    if (severity === ErrorSeverity.CRITICAL) {
      console.error('CRITICAL ERROR:', error, context);
      this.reportError(error, context);
    }

    // Queue for batch processing
    this.errorQueue.push({
      error,
      context: { ...context, severity },
      timestamp: Date.now()
    });

    // Process queue
    this.processErrorQueue();
  }

  private async processErrorQueue(): Promise<void> {
    if (this.isProcessing || this.errorQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      const errors = this.errorQueue.splice(0, 10); // Process 10 at a time
      
      for (const { error, context } of errors) {
        await this.reportError(error, context);
      }
    } catch (reportError) {
      console.error('Failed to report errors:', reportError);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if more errors
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processErrorQueue(), 1000);
      }
    }
  }

  private async reportError(error: Error, context: ErrorContext): Promise<void> {
    try {
      // Report to external service
      errorTrackingService.captureException(error, context);
      
      // Store in database for analytics
      if (context.userId) {
        await this.storeErrorLog(error, context);
      }
    } catch (reportingError) {
      console.error('Error reporting failed:', reportingError);
    }
  }

  private async storeErrorLog(error: Error, context: ErrorContext): Promise<void> {
    // Implementation would store in database
    console.log('Error logged:', { error: error.message, context });
  }

  // Retry mechanism
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) break;
        
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
    
    throw lastError!;
  }
}

export const globalErrorHandler = new GlobalErrorHandler();

// Global error boundary
export const setupGlobalErrorHandling = (): void => {
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    globalErrorHandler.handleError(
      new Error(event.reason),
      ErrorSeverity.HIGH,
      { component: 'global', action: 'unhandled_promise' }
    );
  });

  // Global errors
  window.addEventListener('error', (event) => {
    globalErrorHandler.handleError(
      event.error || new Error(event.message),
      ErrorSeverity.MEDIUM,
      { component: 'global', action: 'global_error' }
    );
  });
};