"use strict";
/**
 * Global Error Handler - Production Ready
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGlobalErrorHandling = exports.globalErrorHandler = exports.ErrorSeverity = void 0;
const integrations_1 = require("../services/integrations");
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
class GlobalErrorHandler {
    constructor() {
        this.errorQueue = [];
        this.isProcessing = false;
    }
    handleError(error, severity, context = {}) {
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
    async processErrorQueue() {
        if (this.isProcessing || this.errorQueue.length === 0)
            return;
        this.isProcessing = true;
        try {
            const errors = this.errorQueue.splice(0, 10); // Process 10 at a time
            for (const { error, context } of errors) {
                await this.reportError(error, context);
            }
        }
        catch (reportError) {
            console.error('Failed to report errors:', reportError);
        }
        finally {
            this.isProcessing = false;
            // Continue processing if more errors
            if (this.errorQueue.length > 0) {
                setTimeout(() => this.processErrorQueue(), 1000);
            }
        }
    }
    async reportError(error, context) {
        try {
            // Report to external service
            integrations_1.errorTrackingService.captureException(error, context);
            // Store in database for analytics
            if (context.userId) {
                await this.storeErrorLog(error, context);
            }
        }
        catch (reportingError) {
            console.error('Error reporting failed:', reportingError);
        }
    }
    async storeErrorLog(error, context) {
        // Implementation would store in database
        console.log('Error logged:', { error: error.message, context });
    }
    // Retry mechanism
    async withRetry(operation, maxRetries = 3, delay = 1000) {
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === maxRetries)
                    break;
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
        throw lastError;
    }
}
exports.globalErrorHandler = new GlobalErrorHandler();
// Global error boundary
const setupGlobalErrorHandling = () => {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        exports.globalErrorHandler.handleError(new Error(event.reason), ErrorSeverity.HIGH, { component: 'global', action: 'unhandled_promise' });
    });
    // Global errors
    window.addEventListener('error', (event) => {
        exports.globalErrorHandler.handleError(event.error || new Error(event.message), ErrorSeverity.MEDIUM, { component: 'global', action: 'global_error' });
    });
};
exports.setupGlobalErrorHandling = setupGlobalErrorHandling;
//# sourceMappingURL=errorHandler.js.map